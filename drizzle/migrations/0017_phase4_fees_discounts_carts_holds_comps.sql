-- ===== Season fee settings (working values, admin-editable) =====
CREATE TABLE public.season_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL DEFAULT public.current_league_id() REFERENCES public.leagues(id) ON DELETE RESTRICT,
  season_id uuid NOT NULL UNIQUE REFERENCES public.seasons(id) ON DELETE RESTRICT,
  early_bird_ends_on date,
  early_bird_amount numeric(10,2) NOT NULL DEFAULT 25 CHECK (early_bird_amount >= 0),
  sibling_amount numeric(10,2) NOT NULL DEFAULT 25 CHECK (sibling_amount >= 0),
  late_fee_amount numeric(10,2) NOT NULL DEFAULT 25 CHECK (late_fee_amount >= 0),
  ihtt_also_pays_in_house boolean NOT NULL DEFAULT true,
  seat_hold_minutes integer NOT NULL DEFAULT 30 CHECK (seat_hold_minutes BETWEEN 5 AND 1440),
  confirmed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON COLUMN public.season_settings.confirmed_at IS 'NULL = working values, confirm.';
GRANT SELECT, UPDATE ON public.season_settings TO authenticated;
GRANT ALL ON public.season_settings TO service_role;
REVOKE ALL ON public.season_settings FROM anon;
ALTER TABLE public.season_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read season settings" ON public.season_settings FOR SELECT TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND public.has_any_role(auth.uid(), ARRAY['admin','board_member','registrar','treasurer']::app_role[]));
CREATE POLICY "Admin and treasurer edit season settings" ON public.season_settings FOR UPDATE TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND public.has_any_role(auth.uid(), ARRAY['admin','treasurer']::app_role[]))
  WITH CHECK (league_id = (SELECT public.current_league_id()) AND public.has_any_role(auth.uid(), ARRAY['admin','treasurer']::app_role[]));
CREATE TRIGGER trg_season_settings_updated_at BEFORE UPDATE ON public.season_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== Discounts and redemptions =====
CREATE TABLE public.discounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL DEFAULT public.current_league_id() REFERENCES public.leagues(id) ON DELETE RESTRICT,
  season_id uuid REFERENCES public.seasons(id),
  kind text NOT NULL CHECK (kind IN ('early_bird','sibling','late_fee','code','role')),
  name text NOT NULL,
  code text,
  amount numeric(10,2) NOT NULL CHECK (amount >= 0),
  max_redemptions integer CHECK (max_redemptions IS NULL OR max_redemptions > 0),
  per_household_limit integer CHECK (per_household_limit IS NULL OR per_household_limit > 0),
  in_house_only boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX discounts_code_unique ON public.discounts (league_id, upper(code)) WHERE code IS NOT NULL;
CREATE UNIQUE INDEX discounts_one_rule_per_season ON public.discounts (league_id, season_id, kind) WHERE kind IN ('early_bird','sibling','late_fee');
GRANT SELECT, INSERT, UPDATE ON public.discounts TO authenticated;
GRANT ALL ON public.discounts TO service_role;
REVOKE ALL ON public.discounts FROM anon;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read discounts" ON public.discounts FOR SELECT TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND public.has_any_role(auth.uid(), ARRAY['admin','board_member','registrar','treasurer']::app_role[]));
CREATE POLICY "Admin and treasurer add discounts" ON public.discounts FOR INSERT TO authenticated
  WITH CHECK (league_id = (SELECT public.current_league_id()) AND public.has_any_role(auth.uid(), ARRAY['admin','treasurer']::app_role[]));
CREATE POLICY "Admin and treasurer edit discounts" ON public.discounts FOR UPDATE TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND public.has_any_role(auth.uid(), ARRAY['admin','treasurer']::app_role[]))
  WITH CHECK (league_id = (SELECT public.current_league_id()) AND public.has_any_role(auth.uid(), ARRAY['admin','treasurer']::app_role[]));

-- ===== Carts (a cart is one checkout; its id is registrations.checkout_id) =====
CREATE TABLE public.carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL DEFAULT public.current_league_id() REFERENCES public.leagues(id) ON DELETE RESTRICT,
  season_id uuid NOT NULL REFERENCES public.seasons(id),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE RESTRICT,
  created_by_guardian uuid REFERENCES public.guardians(id),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','locked','on_hold','paid','cancelled')),
  discount_code_id uuid REFERENCES public.discounts(id),
  lock_id uuid,
  locked_at timestamptz,
  lock_expires_at timestamptz,
  locked_total numeric(10,2),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX carts_household_idx ON public.carts (household_id, status);
GRANT SELECT ON public.carts TO authenticated;
GRANT ALL ON public.carts TO service_role;
REVOKE ALL ON public.carts FROM anon;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Guardians read their carts" ON public.carts FOR SELECT TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND public.is_guardian_of_household(household_id));
CREATE POLICY "Money staff read carts" ON public.carts FOR SELECT TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND public.has_any_role(auth.uid(), ARRAY['admin','treasurer','registrar']::app_role[]));

-- Line items written at checkout start (price lock). Insert-only.
CREATE TABLE public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL DEFAULT public.current_league_id() REFERENCES public.leagues(id) ON DELETE RESTRICT,
  cart_id uuid NOT NULL REFERENCES public.carts(id) ON DELETE RESTRICT,
  lock_id uuid NOT NULL,
  registration_id uuid REFERENCES public.registrations(id) ON DELETE RESTRICT,
  line_type text NOT NULL CHECK (line_type IN ('fee','early_bird','late_fee','sibling','ihtt_included','code','comp')),
  label text NOT NULL,
  amount numeric(10,2) NOT NULL,
  discount_id uuid REFERENCES public.discounts(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX cart_items_cart_idx ON public.cart_items (cart_id, lock_id);
GRANT SELECT ON public.cart_items TO authenticated;
GRANT ALL ON public.cart_items TO service_role;
REVOKE ALL ON public.cart_items FROM anon;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Guardians read their cart lines" ON public.cart_items FOR SELECT TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND EXISTS (
    SELECT 1 FROM public.carts c WHERE c.id = cart_items.cart_id AND public.is_guardian_of_household(c.household_id)));
CREATE POLICY "Money staff read cart lines" ON public.cart_items FOR SELECT TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND public.has_any_role(auth.uid(), ARRAY['admin','treasurer','registrar']::app_role[]));

CREATE TABLE public.discount_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL DEFAULT public.current_league_id() REFERENCES public.leagues(id) ON DELETE RESTRICT,
  discount_id uuid NOT NULL REFERENCES public.discounts(id) ON DELETE RESTRICT,
  registration_id uuid NOT NULL REFERENCES public.registrations(id) ON DELETE RESTRICT,
  cart_id uuid REFERENCES public.carts(id),
  household_id uuid REFERENCES public.households(id),
  amount numeric(10,2) NOT NULL,
  note text,
  applied_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (discount_id, registration_id)
);
GRANT SELECT ON public.discount_redemptions TO authenticated;
GRANT ALL ON public.discount_redemptions TO service_role;
REVOKE ALL ON public.discount_redemptions FROM anon;
ALTER TABLE public.discount_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Money staff read redemptions" ON public.discount_redemptions FOR SELECT TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND public.has_any_role(auth.uid(), ARRAY['admin','treasurer','registrar']::app_role[]));

-- ===== Financial help requests =====
CREATE TABLE public.assistance_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL DEFAULT public.current_league_id() REFERENCES public.leagues(id) ON DELETE RESTRICT,
  cart_id uuid NOT NULL REFERENCES public.carts(id) ON DELETE RESTRICT,
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE RESTRICT,
  guardian_id uuid REFERENCES public.guardians(id),
  contact_name text NOT NULL,
  contact_phone text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','decided')),
  decided_by uuid,
  decided_at timestamptz,
  decision_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.assistance_requests TO authenticated;
GRANT ALL ON public.assistance_requests TO service_role;
REVOKE ALL ON public.assistance_requests FROM anon;
ALTER TABLE public.assistance_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Board treasurer admin read help requests" ON public.assistance_requests FOR SELECT TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND public.has_any_role(auth.uid(), ARRAY['admin','board_member','treasurer']::app_role[]));
CREATE POLICY "Board treasurer admin decide help requests" ON public.assistance_requests FOR UPDATE TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND public.has_any_role(auth.uid(), ARRAY['admin','board_member','treasurer']::app_role[]))
  WITH CHECK (league_id = (SELECT public.current_league_id()) AND public.has_any_role(auth.uid(), ARRAY['admin','board_member','treasurer']::app_role[]));

-- ===== Comps (payment facts, insert-only) =====
CREATE TABLE public.comps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL DEFAULT public.current_league_id() REFERENCES public.leagues(id) ON DELETE RESTRICT,
  registration_id uuid NOT NULL REFERENCES public.registrations(id) ON DELETE RESTRICT,
  cart_id uuid REFERENCES public.carts(id),
  assistance_request_id uuid REFERENCES public.assistance_requests(id),
  amount numeric(10,2) NOT NULL CHECK (amount > 0),
  reason text NOT NULL,
  approved_by uuid NOT NULL,
  approved_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.comps TO authenticated;
GRANT ALL ON public.comps TO service_role;
REVOKE ALL ON public.comps FROM anon;
ALTER TABLE public.comps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Board treasurer admin read comps" ON public.comps FOR SELECT TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND public.has_any_role(auth.uid(), ARRAY['admin','board_member','treasurer']::app_role[]));

-- Insert-only money rows
CREATE TRIGGER trg_cart_items_insert_only BEFORE UPDATE OR DELETE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION public.block_signature_changes();
CREATE TRIGGER trg_redemptions_insert_only BEFORE UPDATE OR DELETE ON public.discount_redemptions FOR EACH ROW EXECUTE FUNCTION public.block_signature_changes();
CREATE TRIGGER trg_comps_insert_only BEFORE UPDATE OR DELETE ON public.comps FOR EACH ROW EXECUTE FUNCTION public.block_signature_changes();

-- ===== Family group (households connected by a shared player) =====
CREATE OR REPLACE FUNCTION public.family_group_households(_household_id uuid)
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  WITH RECURSIVE g(hid) AS (
    SELECT _household_id
    UNION
    SELECT hp2.household_id FROM g
    JOIN public.household_players hp1 ON hp1.household_id = g.hid
    JOIN public.household_players hp2 ON hp2.player_id = hp1.player_id
  ) SELECT hid FROM g
$$;
REVOKE ALL ON FUNCTION public.family_group_households(uuid) FROM PUBLIC, anon, authenticated;

-- ===== Pure pricing rule (no table reads; testable) =====
-- _items: every live registration in the family group this season:
--   [{registration_id, player_id, player_name, cart_id, kind, fee, label, created_at, sibling_redeemed}]
-- _settings: {early_bird_ends_on, early_bird_amount, sibling_amount, late_fee_amount, closes_on, late_until, ihtt_also_pays_in_house}
CREATE OR REPLACE FUNCTION public.price_cart_lines(_items jsonb, _settings jsonb, _as_of date, _cart_id uuid)
RETURNS jsonb LANGUAGE plpgsql IMMUTABLE SET search_path TO 'public'
AS $$
DECLARE
  r RECORD; v_first uuid; v_lines jsonb := '[]'::jsonb; v_total numeric := 0;
  v_eb_end date := (_settings->>'early_bird_ends_on')::date;
  v_closes date := (_settings->>'closes_on')::date;
  v_late date := (_settings->>'late_until')::date;
  v_eb numeric := coalesce((_settings->>'early_bird_amount')::numeric, 0);
  v_sib numeric := coalesce((_settings->>'sibling_amount')::numeric, 0);
  v_lf numeric := coalesce((_settings->>'late_fee_amount')::numeric, 0);
  v_ihtt_on boolean := coalesce((_settings->>'ihtt_also_pays_in_house')::boolean, true);
  v_waived boolean; v_carrier uuid;
BEGIN
  CREATE TEMP TABLE IF NOT EXISTS _pc_items (registration_id uuid, player_id uuid, player_name text, cart_id uuid, kind text,
    fee numeric, label text, created_at timestamptz, sibling_redeemed boolean) ON COMMIT DROP;
  DELETE FROM _pc_items;
  INSERT INTO _pc_items SELECT * FROM jsonb_to_recordset(_items) AS x(registration_id uuid, player_id uuid, player_name text,
    cart_id uuid, kind text, fee numeric, label text, created_at timestamptz, sibling_redeemed boolean);

  -- First child in the family group pays full price (clinic never counts).
  SELECT player_id INTO v_first FROM _pc_items WHERE kind <> 'clinic'
   GROUP BY player_id ORDER BY bool_or(coalesce(sibling_redeemed,false)) ASC, min(created_at), player_id LIMIT 1;

  FOR r IN SELECT * FROM _pc_items WHERE cart_id = _cart_id ORDER BY player_name, created_at LOOP
    v_lines := v_lines || jsonb_build_object('registration_id', r.registration_id, 'type', 'fee', 'label', r.label, 'amount', r.fee);
    v_total := v_total + r.fee;
    v_waived := r.kind = 'division' AND NOT v_ihtt_on AND EXISTS (
      SELECT 1 FROM _pc_items i WHERE i.player_id = r.player_id AND i.kind = 'ihtt');
    IF v_waived THEN
      v_lines := v_lines || jsonb_build_object('registration_id', r.registration_id, 'type', 'ihtt_included', 'label', 'In-House included with IHTT', 'amount', -r.fee);
      v_total := v_total - r.fee;
    END IF;
    IF r.kind <> 'clinic' AND NOT v_waived THEN
      IF v_eb_end IS NOT NULL AND _as_of <= v_eb_end AND v_eb > 0 THEN
        v_lines := v_lines || jsonb_build_object('registration_id', r.registration_id, 'type', 'early_bird', 'label', 'Early bird discount', 'amount', -v_eb);
        v_total := v_total - v_eb;
      ELSIF v_closes IS NOT NULL AND _as_of > v_closes AND (v_late IS NULL OR _as_of <= v_late) AND v_lf > 0 THEN
        v_lines := v_lines || jsonb_build_object('registration_id', r.registration_id, 'type', 'late_fee', 'label', 'Late registration fee', 'amount', v_lf);
        v_total := v_total + v_lf;
      END IF;
    END IF;
    IF r.kind <> 'clinic' AND r.player_id <> v_first AND v_sib > 0 THEN
      SELECT registration_id INTO v_carrier FROM _pc_items i WHERE i.player_id = r.player_id AND i.kind <> 'clinic'
       ORDER BY coalesce(i.sibling_redeemed,false) DESC, (i.kind = 'division') DESC, i.created_at, i.registration_id LIMIT 1;
      IF v_carrier = r.registration_id THEN
        v_lines := v_lines || jsonb_build_object('registration_id', r.registration_id, 'type', 'sibling', 'label', 'Sibling discount', 'amount', -v_sib);
        v_total := v_total - v_sib;
      END IF;
    END IF;
  END LOOP;
  RETURN jsonb_build_object('lines', v_lines, 'total', greatest(v_total, 0), 'as_of', _as_of,
    'closed', v_late IS NOT NULL AND _as_of > v_late);
END $$;
-- Note: IMMUTABLE is not strictly true because of the temp table; mark VOLATILE instead.
ALTER FUNCTION public.price_cart_lines(jsonb, jsonb, date, uuid) VOLATILE;
REVOKE ALL ON FUNCTION public.price_cart_lines(jsonb, jsonb, date, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.price_cart_lines(jsonb, jsonb, date, uuid) TO authenticated;

-- ===== Cart total from the database =====
CREATE OR REPLACE FUNCTION public.cart_lines(_cart_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_cart RECORD; v_set RECORD; v_season RECORD; v_items jsonb; v_res jsonb; v_lines jsonb; v_total numeric;
  v_code RECORD; v_first_reg uuid; c RECORD;
BEGIN
  SELECT * INTO v_cart FROM public.carts WHERE id = _cart_id AND league_id = public.current_league_id();
  IF v_cart.id IS NULL OR NOT (public.is_guardian_of_household(v_cart.household_id)
       OR public.has_any_role(auth.uid(), ARRAY['admin','treasurer','registrar']::app_role[])) THEN
    RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501'; END IF;

  -- Locked and not expired: return the locked lines exactly.
  IF v_cart.lock_id IS NOT NULL AND (v_cart.status IN ('on_hold','paid') OR v_cart.lock_expires_at > now()) THEN
    SELECT coalesce(jsonb_agg(jsonb_build_object('registration_id', registration_id, 'type', line_type, 'label', label, 'amount', amount) ORDER BY created_at), '[]'::jsonb),
           coalesce(sum(amount), 0)
      INTO v_lines, v_total FROM public.cart_items WHERE cart_id = _cart_id AND lock_id = v_cart.lock_id;
    FOR c IN SELECT * FROM public.comps WHERE cart_id = _cart_id LOOP
      v_lines := v_lines || jsonb_build_object('registration_id', c.registration_id, 'type', 'comp', 'label', 'Financial help from the league', 'amount', -c.amount);
      v_total := v_total - c.amount;
    END LOOP;
    RETURN jsonb_build_object('lines', v_lines, 'total', greatest(v_total, 0), 'locked', true,
      'lock_expires_at', v_cart.lock_expires_at, 'status', v_cart.status);
  END IF;

  SELECT * INTO v_season FROM public.seasons WHERE id = v_cart.season_id;
  SELECT * INTO v_set FROM public.season_settings WHERE season_id = v_cart.season_id;

  SELECT coalesce(jsonb_agg(jsonb_build_object(
      'registration_id', r.id, 'player_id', r.player_id,
      'player_name', coalesce(p.preferred_name, p.first_name),
      'cart_id', r.checkout_id,
      'kind', r.kind, 'fee', coalesce(d.cost, 0),
      'label', coalesce(p.preferred_name, p.first_name) || ', ' || pr.name || ' ' || coalesce(d.display_label, d.name),
      'created_at', r.created_at,
      'sibling_redeemed', EXISTS (SELECT 1 FROM public.discount_redemptions dr JOIN public.discounts dd ON dd.id = dr.discount_id
                                  WHERE dr.registration_id = r.id AND dd.kind = 'sibling'))), '[]'::jsonb)
    INTO v_items
  FROM public.registrations r
  JOIN public.players p ON p.id = r.player_id
  JOIN public.programs pr ON pr.id = r.program_id
  LEFT JOIN public.divisions d ON d.id = r.division_id
  WHERE r.season_id = v_cart.season_id AND r.lifecycle <> 'cancelled'
    AND r.player_id IN (SELECT hp.player_id FROM public.household_players hp
                        WHERE hp.household_id IN (SELECT public.family_group_households(v_cart.household_id)));

  v_res := public.price_cart_lines(v_items, jsonb_build_object(
    'early_bird_ends_on', v_set.early_bird_ends_on, 'early_bird_amount', v_set.early_bird_amount,
    'sibling_amount', v_set.sibling_amount, 'late_fee_amount', v_set.late_fee_amount,
    'closes_on', v_season.registration_closes_on, 'late_until', v_season.late_registration_until,
    'ihtt_also_pays_in_house', coalesce(v_set.ihtt_also_pays_in_house, true)), current_date, _cart_id);

  -- One code per cart, applied once to the first non-clinic registration.
  IF v_cart.discount_code_id IS NOT NULL THEN
    SELECT * INTO v_code FROM public.discounts WHERE id = v_cart.discount_code_id AND is_active;
    SELECT (l->>'registration_id')::uuid INTO v_first_reg FROM jsonb_array_elements(v_res->'lines') l WHERE l->>'type' = 'fee' LIMIT 1;
    IF v_code.id IS NOT NULL AND v_first_reg IS NOT NULL THEN
      v_res := jsonb_set(v_res, '{lines}', (v_res->'lines') || jsonb_build_object('registration_id', v_first_reg, 'type', 'code', 'label', v_code.name, 'amount', -v_code.amount));
      v_res := jsonb_set(v_res, '{total}', to_jsonb(greatest((v_res->>'total')::numeric - v_code.amount, 0)));
    END IF;
  END IF;
  RETURN v_res || jsonb_build_object('locked', false, 'status', v_cart.status);
END $$;
REVOKE ALL ON FUNCTION public.cart_lines(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cart_lines(uuid) TO authenticated;

-- ===== Family cart actions =====
CREATE OR REPLACE FUNCTION public.add_to_my_cart(_registration_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_reg RECORD; v_hh uuid; v_cart uuid; v_g uuid; v_inhouse RECORD;
BEGIN
  SELECT * INTO v_reg FROM public.registrations WHERE id = _registration_id AND league_id = public.current_league_id();
  IF v_reg.id IS NULL OR NOT public.is_guardian_of_player(v_reg.player_id) THEN RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501'; END IF;
  IF v_reg.lifecycle <> 'draft' THEN RAISE EXCEPTION 'This registration is already in checkout' USING ERRCODE = 'check_violation'; END IF;
  SELECT hp.household_id INTO v_hh FROM public.household_players hp
   WHERE hp.player_id = v_reg.player_id AND public.is_guardian_of_household(hp.household_id) LIMIT 1;
  SELECT g.id INTO v_g FROM public.guardians g WHERE g.auth_user_id = auth.uid() LIMIT 1;

  -- IHTT rides in the same cart as its in-house registration.
  IF v_reg.kind = 'ihtt' THEN
    SELECT r.* INTO v_inhouse FROM public.registrations r JOIN public.programs p ON p.id = r.program_id AND p.type = 'in_house'
     WHERE r.player_id = v_reg.player_id AND r.season_id = v_reg.season_id AND r.lifecycle <> 'cancelled' LIMIT 1;
    v_cart := v_inhouse.checkout_id;
  END IF;
  IF v_cart IS NULL OR NOT EXISTS (SELECT 1 FROM public.carts WHERE id = v_cart) THEN
    SELECT id INTO v_cart FROM public.carts WHERE household_id = v_hh AND season_id = v_reg.season_id AND status = 'open'
     ORDER BY created_at DESC LIMIT 1;
  END IF;
  IF v_cart IS NULL OR NOT EXISTS (SELECT 1 FROM public.carts WHERE id = v_cart) THEN
    INSERT INTO public.carts (id, season_id, household_id, created_by_guardian)
    VALUES (coalesce(v_cart, gen_random_uuid()), v_reg.season_id, v_hh, v_g) RETURNING id INTO v_cart;
  END IF;
  IF (SELECT status FROM public.carts WHERE id = v_cart) <> 'open' THEN
    RAISE EXCEPTION 'That checkout has already started' USING ERRCODE = 'check_violation'; END IF;
  UPDATE public.registrations SET checkout_id = v_cart WHERE id = _registration_id;
  IF v_reg.kind = 'ihtt' AND v_inhouse.id IS NOT NULL AND v_inhouse.checkout_id IS DISTINCT FROM v_cart AND v_inhouse.lifecycle = 'draft' THEN
    UPDATE public.registrations SET checkout_id = v_cart WHERE id = v_inhouse.id;
  END IF;
  RETURN v_cart;
END $$;

CREATE OR REPLACE FUNCTION public.apply_cart_code(_cart_id uuid, _code text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_cart RECORD; v_d RECORD; v_used int; v_hh_used int;
BEGIN
  SELECT * INTO v_cart FROM public.carts WHERE id = _cart_id;
  IF v_cart.id IS NULL OR NOT public.is_guardian_of_household(v_cart.household_id) THEN RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501'; END IF;
  IF v_cart.status <> 'open' THEN RAISE EXCEPTION 'Codes can be added before checkout starts' USING ERRCODE = 'check_violation'; END IF;
  SELECT * INTO v_d FROM public.discounts WHERE league_id = v_cart.league_id AND kind = 'code' AND is_active AND upper(code) = upper(trim(_code));
  IF v_d.id IS NULL THEN RAISE EXCEPTION 'That code isn''t valid' USING ERRCODE = 'check_violation'; END IF;
  SELECT count(*) INTO v_used FROM public.discount_redemptions WHERE discount_id = v_d.id;
  IF v_d.max_redemptions IS NOT NULL AND v_used >= v_d.max_redemptions THEN RAISE EXCEPTION 'That code has been used up' USING ERRCODE = 'check_violation'; END IF;
  SELECT count(*) INTO v_hh_used FROM public.discount_redemptions WHERE discount_id = v_d.id
    AND household_id IN (SELECT public.family_group_households(v_cart.household_id));
  IF v_d.per_household_limit IS NOT NULL AND v_hh_used >= v_d.per_household_limit THEN RAISE EXCEPTION 'Your family has already used that code' USING ERRCODE = 'check_violation'; END IF;
  UPDATE public.carts SET discount_code_id = v_d.id WHERE id = _cart_id;
  RETURN public.cart_lines(_cart_id);
END $$;

-- Start checkout: lock the price for the seat-hold window.
CREATE OR REPLACE FUNCTION public.lock_my_cart(_cart_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_cart RECORD; v_res jsonb; v_lock uuid := gen_random_uuid(); v_set RECORD; l jsonb; v_disc uuid; v_hold int;
BEGIN
  SELECT * INTO v_cart FROM public.carts WHERE id = _cart_id FOR UPDATE;
  IF v_cart.id IS NULL OR NOT public.is_guardian_of_household(v_cart.household_id) THEN RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501'; END IF;
  IF v_cart.status IN ('paid','cancelled','on_hold') THEN RAISE EXCEPTION 'This checkout can''t be restarted' USING ERRCODE = 'check_violation'; END IF;
  IF v_cart.status = 'locked' AND v_cart.lock_expires_at > now() THEN RETURN public.cart_lines(_cart_id); END IF;
  IF NOT EXISTS (SELECT 1 FROM public.registrations WHERE checkout_id = _cart_id AND lifecycle <> 'cancelled') THEN
    RAISE EXCEPTION 'Add a registration first' USING ERRCODE = 'check_violation'; END IF;
  UPDATE public.carts SET status = 'open', lock_id = NULL WHERE id = _cart_id;
  v_res := public.cart_lines(_cart_id);
  IF (v_res->>'closed')::boolean THEN RAISE EXCEPTION 'Registration is closed for this season' USING ERRCODE = 'check_violation'; END IF;
  SELECT * INTO v_set FROM public.season_settings WHERE season_id = v_cart.season_id;
  v_hold := coalesce(v_set.seat_hold_minutes, 30);

  FOR l IN SELECT * FROM jsonb_array_elements(v_res->'lines') LOOP
    v_disc := CASE WHEN l->>'type' IN ('early_bird','sibling','late_fee') THEN
      (SELECT id FROM public.discounts WHERE season_id = v_cart.season_id AND kind = l->>'type' LIMIT 1)
      WHEN l->>'type' = 'code' THEN v_cart.discount_code_id END;
    INSERT INTO public.cart_items (cart_id, lock_id, registration_id, line_type, label, amount, discount_id)
    VALUES (_cart_id, v_lock, (l->>'registration_id')::uuid, l->>'type', l->>'label', (l->>'amount')::numeric, v_disc);
    IF v_disc IS NOT NULL THEN
      INSERT INTO public.discount_redemptions (discount_id, registration_id, cart_id, household_id, amount, applied_by)
      VALUES (v_disc, (l->>'registration_id')::uuid, _cart_id, v_cart.household_id, abs((l->>'amount')::numeric), auth.uid())
      ON CONFLICT (discount_id, registration_id) DO NOTHING;
    END IF;
  END LOOP;

  UPDATE public.carts SET status = 'locked', lock_id = v_lock, locked_at = now(),
    lock_expires_at = now() + make_interval(mins => v_hold), locked_total = (v_res->>'total')::numeric
   WHERE id = _cart_id;
  UPDATE public.registrations SET lifecycle = 'submitted', seat = 'held', submitted_at = coalesce(submitted_at, now()),
    on_hold_until = now() + make_interval(mins => v_hold), hold_reason = coalesce(hold_reason, 'checkout')
   WHERE checkout_id = _cart_id AND lifecycle IN ('draft','submitted');
  RETURN public.cart_lines(_cart_id);
END $$;

-- Financial help: private request, and every registration in the cart is held.
CREATE OR REPLACE FUNCTION public.request_payment_help(_cart_id uuid, _name text, _phone text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_cart RECORD; v_g uuid;
BEGIN
  SELECT * INTO v_cart FROM public.carts WHERE id = _cart_id FOR UPDATE;
  IF v_cart.id IS NULL OR NOT public.is_guardian_of_household(v_cart.household_id) THEN RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501'; END IF;
  IF coalesce(trim(_name),'') = '' OR length(regexp_replace(coalesce(_phone,''), '\D', '', 'g')) < 10 THEN
    RAISE EXCEPTION 'Enter your name and a 10-digit phone number' USING ERRCODE = 'check_violation'; END IF;
  SELECT id INTO v_g FROM public.guardians WHERE auth_user_id = auth.uid() LIMIT 1;
  INSERT INTO public.assistance_requests (cart_id, household_id, guardian_id, contact_name, contact_phone)
  VALUES (_cart_id, v_cart.household_id, v_g, trim(_name), trim(_phone));
  UPDATE public.carts SET status = CASE WHEN status = 'paid' THEN status ELSE 'on_hold' END, lock_expires_at = NULL WHERE id = _cart_id;
  UPDATE public.registrations SET on_hold_until = 'infinity', hold_reason = 'financial_help'
   WHERE checkout_id = _cart_id AND lifecycle <> 'cancelled';
  RETURN true;
END $$;

-- Comp: board, treasurer or admin waives an amount in one transaction.
CREATE OR REPLACE FUNCTION public.approve_comp(_registration_id uuid, _amount numeric, _reason text, _assistance_request_id uuid DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_reg RECORD; v_id uuid;
BEGIN
  IF NOT public.has_any_role(auth.uid(), ARRAY['admin','board_member','treasurer']::app_role[]) OR NOT public.mfa_satisfied() THEN
    RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501'; END IF;
  IF coalesce(_amount, 0) <= 0 OR coalesce(trim(_reason),'') = '' THEN RAISE EXCEPTION 'Amount and reason are required' USING ERRCODE = 'check_violation'; END IF;
  SELECT * INTO v_reg FROM public.registrations WHERE id = _registration_id AND league_id = public.current_league_id();
  IF v_reg.id IS NULL THEN RAISE EXCEPTION 'Registration not found' USING ERRCODE = 'check_violation'; END IF;
  INSERT INTO public.comps (registration_id, cart_id, assistance_request_id, amount, reason, approved_by)
  VALUES (_registration_id, v_reg.checkout_id, _assistance_request_id, _amount, trim(_reason), auth.uid()) RETURNING id INTO v_id;
  IF _assistance_request_id IS NOT NULL THEN
    UPDATE public.assistance_requests SET status = 'decided', decided_by = auth.uid(), decided_at = now(),
      decision_note = 'Comp approved' WHERE id = _assistance_request_id;
  END IF;
  RETURN v_id;
END $$;

-- Head coach's child: registrar applies a role discount after the board vote (in-house only).
CREATE OR REPLACE FUNCTION public.apply_role_discount(_registration_id uuid, _discount_id uuid, _note text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_reg RECORD; v_d RECORD; v_fee numeric; v_id uuid;
BEGIN
  IF NOT public.has_any_role(auth.uid(), ARRAY['admin','registrar']::app_role[]) OR NOT public.mfa_satisfied() THEN
    RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501'; END IF;
  SELECT r.*, p.type AS ptype INTO v_reg FROM public.registrations r JOIN public.programs p ON p.id = r.program_id
   WHERE r.id = _registration_id AND r.league_id = public.current_league_id();
  SELECT * INTO v_d FROM public.discounts WHERE id = _discount_id AND kind = 'role' AND is_active;
  IF v_reg.id IS NULL OR v_d.id IS NULL THEN RAISE EXCEPTION 'Registration or discount not found' USING ERRCODE = 'check_violation'; END IF;
  IF v_d.in_house_only AND v_reg.ptype <> 'in_house' THEN RAISE EXCEPTION 'This credit is for In-House only' USING ERRCODE = 'check_violation'; END IF;
  SELECT cost INTO v_fee FROM public.divisions WHERE id = v_reg.division_id;
  INSERT INTO public.discount_redemptions (discount_id, registration_id, cart_id, amount, note, applied_by)
  VALUES (_discount_id, _registration_id, v_reg.checkout_id, CASE WHEN v_d.amount = 0 THEN coalesce(v_fee, 0) ELSE v_d.amount END, _note, auth.uid())
  RETURNING id INTO v_id;
  RETURN v_id;
END $$;

REVOKE ALL ON FUNCTION public.add_to_my_cart(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.apply_cart_code(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.lock_my_cart(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.request_payment_help(uuid, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.approve_comp(uuid, numeric, text, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.apply_role_discount(uuid, uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.add_to_my_cart(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.apply_cart_code(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.lock_my_cart(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.request_payment_help(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_comp(uuid, numeric, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.apply_role_discount(uuid, uuid, text) TO authenticated;

-- Default grants in this project give authenticated full table rights; keep money tables to what policies need.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.carts, public.cart_items, public.discount_redemptions, public.comps FROM authenticated;
REVOKE INSERT, DELETE, TRUNCATE ON public.season_settings, public.assistance_requests FROM authenticated;
REVOKE DELETE, TRUNCATE ON public.discounts FROM authenticated;