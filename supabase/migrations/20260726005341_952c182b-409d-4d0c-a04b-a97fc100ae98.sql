
-- =========================================================================
-- STEP 0: Drop empty Phase 0 stubs (CASCADE clears dependent policies)
-- =========================================================================
DROP FUNCTION IF EXISTS public.is_household_member(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_household_owner(uuid, uuid) CASCADE;
DROP TABLE IF EXISTS public.guardian_household_members CASCADE;
DROP TABLE IF EXISTS public.guardian_households CASCADE;

-- =========================================================================
-- STEP 1: households
-- =========================================================================
CREATE TABLE public.households (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  address_line1 text,
  address_line2 text,
  city text,
  state text DEFAULT 'IL',
  zip_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.households TO authenticated;
GRANT ALL ON public.households TO service_role;
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- STEP 2: guardians (with permanent legacy provenance column)
-- =========================================================================
CREATE TABLE public.guardians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  first_name text,
  last_name text,
  email text,
  phone text,
  contact_method text NOT NULL DEFAULT 'email'
    CHECK (contact_method IN ('email','phone','both')),
  legacy_player_guardian_id uuid UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX guardians_auth_user_id_unique
  ON public.guardians (auth_user_id)
  WHERE auth_user_id IS NOT NULL;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guardians TO authenticated;
GRANT ALL ON public.guardians TO service_role;
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- STEP 3: guardian_households (join)
-- =========================================================================
CREATE TABLE public.guardian_households (
  guardian_id uuid NOT NULL REFERENCES public.guardians(id) ON DELETE CASCADE,
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  is_primary boolean NOT NULL DEFAULT false,
  receives_comms boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (guardian_id, household_id)
);
CREATE INDEX guardian_households_household_id_idx
  ON public.guardian_households (household_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guardian_households TO authenticated;
GRANT ALL ON public.guardian_households TO service_role;
ALTER TABLE public.guardian_households ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- STEP 4: household_players (join)
-- =========================================================================
CREATE TABLE public.household_players (
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'manager'
    CHECK (role IN ('manager','viewer')),
  can_edit_medical boolean NOT NULL DEFAULT false,
  shares_contact boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (household_id, player_id)
);
CREATE INDEX household_players_player_id_idx
  ON public.household_players (player_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.household_players TO authenticated;
GRANT ALL ON public.household_players TO service_role;
ALTER TABLE public.household_players ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- STEP 5: player_medical
-- =========================================================================
CREATE TABLE public.player_medical (
  player_id uuid PRIMARY KEY REFERENCES public.players(id) ON DELETE CASCADE,
  conditions text,
  allergies text,
  medications text,
  notes text,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.player_medical TO authenticated;
GRANT ALL ON public.player_medical TO service_role;
ALTER TABLE public.player_medical ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- STEP 6: extend players
-- =========================================================================
ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS preferred_name text,
  ADD COLUMN IF NOT EXISTS school text;

-- =========================================================================
-- STEP 7: updated_at triggers
-- =========================================================================
CREATE TRIGGER trg_households_updated_at
  BEFORE UPDATE ON public.households
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_guardians_updated_at
  BEFORE UPDATE ON public.guardians
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_player_medical_updated_at
  BEFORE UPDATE ON public.player_medical
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================================
-- STEP 8: RLS policies + helpers
-- =========================================================================
CREATE OR REPLACE FUNCTION public.is_guardian_of_household(_household_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.guardian_households gh
    JOIN public.guardians g ON g.id = gh.guardian_id
    WHERE gh.household_id = _household_id
      AND g.auth_user_id = auth.uid()
  )
$$;
REVOKE ALL ON FUNCTION public.is_guardian_of_household(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_guardian_of_household(uuid) TO postgres, service_role;

CREATE OR REPLACE FUNCTION public.is_guardian_of_player(_player_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.household_players hp
    JOIN public.guardian_households gh ON gh.household_id = hp.household_id
    JOIN public.guardians g ON g.id = gh.guardian_id
    WHERE hp.player_id = _player_id
      AND g.auth_user_id = auth.uid()
  )
$$;
REVOKE ALL ON FUNCTION public.is_guardian_of_player(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_guardian_of_player(uuid) TO postgres, service_role;

-- households
CREATE POLICY "Admins manage all households"
  ON public.households FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Guardians view their households"
  ON public.households FOR SELECT
  USING (public.is_guardian_of_household(id));

CREATE POLICY "Guardians update their households"
  ON public.households FOR UPDATE
  USING (public.is_guardian_of_household(id))
  WITH CHECK (public.is_guardian_of_household(id));

-- guardians
CREATE POLICY "Admins manage all guardians"
  ON public.guardians FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Guardians view themselves"
  ON public.guardians FOR SELECT
  USING (auth_user_id = auth.uid());

CREATE POLICY "Guardians view co-guardians in shared households"
  ON public.guardians FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.guardian_households gh
    WHERE gh.guardian_id = guardians.id
      AND public.is_guardian_of_household(gh.household_id)
  ));

CREATE POLICY "Guardians update themselves"
  ON public.guardians FOR UPDATE
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- guardian_households
CREATE POLICY "Admins manage all guardian_households"
  ON public.guardian_households FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Guardians view their household links"
  ON public.guardian_households FOR SELECT
  USING (public.is_guardian_of_household(household_id));

-- household_players
CREATE POLICY "Admins manage all household_players"
  ON public.household_players FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Guardians view players in their households"
  ON public.household_players FOR SELECT
  USING (public.is_guardian_of_household(household_id));

-- player_medical
CREATE POLICY "Admins manage all player_medical"
  ON public.player_medical FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Guardians view medical for their players"
  ON public.player_medical FOR SELECT
  USING (public.is_guardian_of_player(player_id));

CREATE POLICY "Guardians with can_edit_medical update medical"
  ON public.player_medical FOR UPDATE
  USING (EXISTS (
    SELECT 1
    FROM public.household_players hp
    JOIN public.guardian_households gh ON gh.household_id = hp.household_id
    JOIN public.guardians g ON g.id = gh.guardian_id
    WHERE hp.player_id = player_medical.player_id
      AND hp.can_edit_medical = true
      AND g.auth_user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1
    FROM public.household_players hp
    JOIN public.guardian_households gh ON gh.household_id = hp.household_id
    JOIN public.guardians g ON g.id = gh.guardian_id
    WHERE hp.player_id = player_medical.player_id
      AND hp.can_edit_medical = true
      AND g.auth_user_id = auth.uid()
  ));

-- =========================================================================
-- STEP 9: Deterministic data migration
-- =========================================================================
DO $$
DECLARE
  v_player          public.players%ROWTYPE;
  v_household_id    uuid;
  v_pg              public.player_guardians%ROWTYPE;
  v_new_guardian_id uuid;
  v_source_count    integer;
  v_created_count   integer := 0;
BEGIN
  SELECT count(*) INTO v_source_count FROM public.player_guardians;

  SELECT * INTO v_player FROM public.players ORDER BY created_at ASC LIMIT 1;
  IF v_player.id IS NULL THEN
    RAISE EXCEPTION 'Migration aborted: no players row found';
  END IF;

  INSERT INTO public.households (name, address_line1, address_line2, city, state, zip_code)
  VALUES (
    COALESCE(v_player.last_name || ' Household', 'Household'),
    v_player.address_line1,
    v_player.address_line2,
    v_player.city,
    COALESCE(v_player.state, 'IL'),
    v_player.zip_code
  )
  RETURNING id INTO v_household_id;

  INSERT INTO public.household_players (household_id, player_id, role, can_edit_medical, shares_contact)
  VALUES (v_household_id, v_player.id, 'manager', true, true);

  FOR v_pg IN
    SELECT * FROM public.player_guardians ORDER BY id ASC
  LOOP
    INSERT INTO public.guardians (
      first_name, last_name, email, phone, contact_method,
      legacy_player_guardian_id
    )
    VALUES (
      v_pg.first_name,
      v_pg.last_name,
      NULLIF(v_pg.email, ''),
      NULLIF(v_pg.phone, ''),
      'email',
      v_pg.id
    )
    RETURNING id INTO v_new_guardian_id;

    INSERT INTO public.guardian_households (
      guardian_id, household_id, is_primary, receives_comms
    )
    VALUES (
      v_new_guardian_id,
      v_household_id,
      COALESCE(v_pg.is_primary, false),
      true
    );

    v_created_count := v_created_count + 1;
  END LOOP;

  IF v_created_count <> v_source_count THEN
    RAISE EXCEPTION
      'Migration aborted: created % guardians but player_guardians has % rows',
      v_created_count, v_source_count;
  END IF;

  IF v_player.medical_notes IS NOT NULL
     OR v_player.allergies IS NOT NULL THEN
    INSERT INTO public.player_medical (player_id, allergies, notes)
    VALUES (v_player.id, v_player.allergies, v_player.medical_notes);
  END IF;
END $$;
