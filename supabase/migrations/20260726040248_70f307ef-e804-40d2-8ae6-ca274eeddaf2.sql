BEGIN;

CREATE TABLE public.registrations (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id             uuid NOT NULL DEFAULT public.current_league_id()
                          REFERENCES public.leagues(id),
  player_id             uuid NOT NULL,
  season_id             uuid NOT NULL,
  program_id            uuid,
  division_id           uuid,

  kind                  text NOT NULL DEFAULT 'division'
                          CHECK (kind IN ('division','tryout')),

  grade_at_registration integer,
  baseball_age          integer,

  source                text DEFAULT 'platform'
                          CHECK (source IN ('platform','sportsconnect','manual')),
  external_id           text,

  jersey_size           text,
  skill_level           text,
  special_requests      text,

  lifecycle             text NOT NULL DEFAULT 'draft'
                          CHECK (lifecycle IN ('draft','submitted','active','cancelled')),
  seat                  text NOT NULL DEFAULT 'none'
                          CHECK (seat IN ('none','held','confirmed','waitlisted','released')),
  payment               text NOT NULL DEFAULT 'unpaid'
                          CHECK (payment IN ('unpaid','partial','paid','waived','refunded','part_refunded')),
  offer                 text NOT NULL DEFAULT 'na'
                          CHECK (offer IN ('na','pending_eval','offered','accepted','declined','lapsed')),

  waiver_status         text DEFAULT 'pending',
  on_hold_until         timestamptz,
  hold_reason           text,

  submitted_at          timestamptz DEFAULT now(),
  approved_by           uuid,
  approved_at           timestamptz,
  notes                 text,

  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT registrations_league_player_fkey
    FOREIGN KEY (league_id, player_id)
    REFERENCES public.league_players (league_id, player_id)
    ON DELETE RESTRICT,
  CONSTRAINT registrations_league_season_fkey
    FOREIGN KEY (league_id, season_id)
    REFERENCES public.seasons (league_id, id),
  CONSTRAINT registrations_league_program_fkey
    FOREIGN KEY (league_id, program_id)
    REFERENCES public.programs (league_id, id),
  CONSTRAINT registrations_league_division_fkey
    FOREIGN KEY (league_id, division_id)
    REFERENCES public.divisions (league_id, id),

  CONSTRAINT registrations_unique_per_kind
    UNIQUE (league_id, player_id, season_id, kind)
);

CREATE INDEX registrations_league_idx           ON public.registrations (league_id);
CREATE INDEX registrations_player_idx           ON public.registrations (player_id);
CREATE INDEX registrations_season_idx           ON public.registrations (season_id);
CREATE INDEX registrations_season_division_idx  ON public.registrations (season_id, division_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.registrations TO authenticated;
GRANT ALL ON public.registrations TO service_role;

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage registrations in their league"
ON public.registrations
FOR ALL
TO authenticated
USING (
  league_id = (SELECT public.current_league_id())
  AND (SELECT public.has_role(auth.uid(), 'admin'::app_role))
)
WITH CHECK (
  league_id = (SELECT public.current_league_id())
  AND (SELECT public.has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Commissioners view assigned registrations"
ON public.registrations
FOR SELECT
TO authenticated
USING (
  league_id = (SELECT public.current_league_id())
  AND program_id IS NOT NULL
  AND (SELECT public.is_commissioner_for(auth.uid(), program_id, division_id))
);

CREATE POLICY "Commissioners update assigned registrations"
ON public.registrations
FOR UPDATE
TO authenticated
USING (
  league_id = (SELECT public.current_league_id())
  AND program_id IS NOT NULL
  AND (SELECT public.is_commissioner_for(auth.uid(), program_id, division_id))
)
WITH CHECK (
  league_id = (SELECT public.current_league_id())
  AND program_id IS NOT NULL
  AND (SELECT public.is_commissioner_for(auth.uid(), program_id, division_id))
);

CREATE POLICY "Guardians view their players' registrations"
ON public.registrations
FOR SELECT
TO authenticated
USING (
  league_id = (SELECT public.current_league_id())
  AND (SELECT public.is_guardian_of_player(player_id))
);

CREATE TRIGGER registrations_set_updated_at
BEFORE UPDATE ON public.registrations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DO $$
DECLARE
  v_league  uuid := public.current_league_id();
  v_player  RECORD;
  v_season  uuid;
  v_count   integer;
  v_payment text;
BEGIN
  IF (SELECT count(*) FROM public.players) <> 1 THEN
    RAISE EXCEPTION 'Backfill expected exactly 1 player, found %', (SELECT count(*) FROM public.players);
  END IF;

  SELECT p.id, p.program_id, p.division_id, p.payment_status
    INTO v_player
    FROM public.players p;

  SELECT season_id INTO v_season FROM public.programs WHERE id = v_player.program_id;
  IF v_season IS NULL THEN
    INSERT INTO public.seasons (league_id, year, label, is_current)
    VALUES (v_league, '2026', '2026', true)
    RETURNING id INTO v_season;

    UPDATE public.programs SET season_id = v_season WHERE id = v_player.program_id;
  END IF;

  v_payment := CASE lower(coalesce(v_player.payment_status,'unpaid'))
                 WHEN 'paid'          THEN 'paid'
                 WHEN 'partial'       THEN 'partial'
                 WHEN 'waived'        THEN 'waived'
                 WHEN 'refunded'      THEN 'refunded'
                 WHEN 'part_refunded' THEN 'part_refunded'
                 ELSE 'unpaid'
               END;

  INSERT INTO public.registrations
    (league_id, player_id, season_id, program_id, division_id,
     kind, source, lifecycle, seat, payment)
  VALUES
    (v_league, v_player.id, v_season, v_player.program_id, v_player.division_id,
     'division', 'manual', 'active', 'confirmed', v_payment);

  SELECT count(*) INTO v_count FROM public.registrations;
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'Backfill produced % registrations rows, expected 1', v_count;
  END IF;
END $$;

COMMENT ON COLUMN public.players.division_id                    IS 'DEPRECATED: use registrations.division_id (Phase C import).';
COMMENT ON COLUMN public.players.program_id                     IS 'DEPRECATED: use registrations.program_id (Phase C import).';
COMMENT ON COLUMN public.players.status                         IS 'DEPRECATED: use registrations.lifecycle/seat (Phase C import).';
COMMENT ON COLUMN public.players.payment_status                 IS 'DEPRECATED: use registrations.payment (Phase C import).';
COMMENT ON COLUMN public.players.amount_due                     IS 'DEPRECATED: belongs to payments ledger (Module 1).';
COMMENT ON COLUMN public.players.amount_paid                    IS 'DEPRECATED: belongs to payments ledger (Module 1).';
COMMENT ON COLUMN public.players.payment_method                 IS 'DEPRECATED: belongs to payments ledger (Module 1).';
COMMENT ON COLUMN public.players.payment_date                   IS 'DEPRECATED: belongs to payments ledger (Module 1).';
COMMENT ON COLUMN public.players.payment_notes                  IS 'DEPRECATED: belongs to payments ledger (Module 1).';
COMMENT ON COLUMN public.players.team_id                        IS 'DEPRECATED: use team_rosters (Phase C import).';
COMMENT ON COLUMN public.players.team_name                      IS 'DEPRECATED: use team_rosters + teams (Phase C import).';
COMMENT ON COLUMN public.players.jersey_number                  IS 'DEPRECATED: use team_rosters.jersey_number (Phase C import).';
COMMENT ON COLUMN public.players.assigned_date                  IS 'DEPRECATED: use team_rosters.assigned_at (Phase C import).';
COMMENT ON COLUMN public.players.age_at_registration            IS 'DEPRECATED: use registrations.baseball_age (Phase C import).';
COMMENT ON COLUMN public.players.registration_date              IS 'DEPRECATED: use registrations.submitted_at (Phase C import).';
COMMENT ON COLUMN public.players.parent_guardian_name           IS 'DEPRECATED: use guardians + guardian_households (Phase C import).';
COMMENT ON COLUMN public.players.parent_first_name              IS 'DEPRECATED: use guardians.first_name (Phase C import).';
COMMENT ON COLUMN public.players.parent_last_name               IS 'DEPRECATED: use guardians.last_name (Phase C import).';
COMMENT ON COLUMN public.players.parent_email                   IS 'DEPRECATED: use guardians.email; do NOT use for authorization (Phase C import).';
COMMENT ON COLUMN public.players.parent_phone                   IS 'DEPRECATED: use guardians.phone (Phase C import).';
COMMENT ON COLUMN public.players.parent_relationship            IS 'DEPRECATED: use guardian_households.relationship (Phase C import).';
COMMENT ON COLUMN public.players.address_line1                  IS 'DEPRECATED: use households.address_line1 (Phase C import).';
COMMENT ON COLUMN public.players.address_line2                  IS 'DEPRECATED: use households.address_line2 (Phase C import).';
COMMENT ON COLUMN public.players.city                           IS 'DEPRECATED: use households.city (Phase C import).';
COMMENT ON COLUMN public.players.state                          IS 'DEPRECATED: use households.state (Phase C import).';
COMMENT ON COLUMN public.players.zip_code                       IS 'DEPRECATED: use households.zip_code (Phase C import).';
COMMENT ON COLUMN public.players.emergency_contact_name         IS 'DEPRECATED: use household emergency contacts (Phase C import).';
COMMENT ON COLUMN public.players.emergency_contact_phone        IS 'DEPRECATED: use household emergency contacts (Phase C import).';
COMMENT ON COLUMN public.players.emergency_contact_relationship IS 'DEPRECATED: use household emergency contacts (Phase C import).';
COMMENT ON COLUMN public.players.previous_experience            IS 'DEPRECATED: use registrations.notes or skill profile (Phase C import).';
COMMENT ON COLUMN public.players.previous_divisions_played      IS 'DEPRECATED: derive from registrations history (Phase C import).';
COMMENT ON COLUMN public.players.jersey_size                    IS 'DEPRECATED: use registrations.jersey_size (Phase C import).';
COMMENT ON COLUMN public.players.skill_level                    IS 'DEPRECATED: use registrations.skill_level (Phase C import).';
COMMENT ON COLUMN public.players.medical_notes                  IS 'DEPRECATED: use player_medical (Phase C import).';
COMMENT ON COLUMN public.players.allergies                      IS 'DEPRECATED: use player_medical.allergies (Phase C import).';

COMMIT;