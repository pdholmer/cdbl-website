ALTER TABLE public.carts DROP CONSTRAINT carts_status_check;
ALTER TABLE public.carts ADD CONSTRAINT carts_status_check
  CHECK (status IN ('open','locked','on_hold','payment_pending','paid','cancelled'));
ALTER TABLE public.carts ADD COLUMN IF NOT EXISTS stripe_session_id text;

CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL DEFAULT public.current_league_id() REFERENCES public.leagues(id) ON DELETE RESTRICT,
  cart_id uuid REFERENCES public.carts(id) ON DELETE RESTRICT,
  household_id uuid REFERENCES public.households(id) ON DELETE RESTRICT,
  provider text NOT NULL CHECK (provider IN ('stripe','offline')),
  provider_payment_id text NOT NULL,
  related_payment_id text,
  kind text NOT NULL CHECK (kind IN ('charge','refund','dispute','dispute_reversal')),
  status text NOT NULL CHECK (status IN ('pending','succeeded','failed')),
  method text CHECK (method IN ('card','us_bank_account','cash','check','other')),
  amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  revenue_class text NOT NULL DEFAULT 'program_service' CHECK (revenue_class IN ('program_service','donation','other')),
  registration_ids uuid[] NOT NULL DEFAULT '{}',
  livemode boolean NOT NULL DEFAULT false,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  recorded_by uuid,
  note text,
  raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT payments_provider_state_unique UNIQUE (provider_payment_id, status)
);
CREATE INDEX payments_cart_idx ON public.payments (cart_id);
CREATE INDEX payments_household_idx ON public.payments (household_id);
GRANT SELECT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
REVOKE ALL ON public.payments FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.payments FROM authenticated;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Guardians read their payments" ON public.payments FOR SELECT TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND household_id IS NOT NULL AND public.is_guardian_of_household(household_id));
CREATE POLICY "Money staff read payments" ON public.payments FOR SELECT TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND public.has_any_role(auth.uid(), ARRAY['admin','treasurer','registrar']::app_role[]));
CREATE TRIGGER trg_payments_insert_only BEFORE UPDATE OR DELETE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.block_signature_changes();

CREATE TABLE public.payment_expectations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL DEFAULT public.current_league_id() REFERENCES public.leagues(id) ON DELETE RESTRICT,
  cart_id uuid NOT NULL REFERENCES public.carts(id) ON DELETE RESTRICT,
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE RESTRICT,
  kind text NOT NULL CHECK (kind IN ('offline','plan')),
  due_on date NOT NULL,
  amount numeric(10,2) NOT NULL CHECK (amount > 0),
  reference_code text NOT NULL,
  created_by uuid,
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX payment_expectations_cart_idx ON public.payment_expectations (cart_id);
GRANT SELECT ON public.payment_expectations TO authenticated;
GRANT ALL ON public.payment_expectations TO service_role;
REVOKE ALL ON public.payment_expectations FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.payment_expectations FROM authenticated;
ALTER TABLE public.payment_expectations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Guardians read their expectations" ON public.payment_expectations FOR SELECT TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND public.is_guardian_of_household(household_id));
CREATE POLICY "Money staff read expectations" ON public.payment_expectations FOR SELECT TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND public.has_any_role(auth.uid(), ARRAY['admin','treasurer','registrar']::app_role[]));

CREATE TABLE public.job_heartbeats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL DEFAULT public.current_league_id() REFERENCES public.leagues(id) ON DELETE RESTRICT,
  job_key text NOT NULL,
  ok boolean NOT NULL,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  ran_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX job_heartbeats_job_idx ON public.job_heartbeats (job_key, ran_at DESC);
GRANT SELECT ON public.job_heartbeats TO authenticated;
GRANT ALL ON public.job_heartbeats TO service_role;
REVOKE ALL ON public.job_heartbeats FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.job_heartbeats FROM authenticated;
ALTER TABLE public.job_heartbeats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Money staff read heartbeats" ON public.job_heartbeats FOR SELECT TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND public.has_any_role(auth.uid(), ARRAY['admin','treasurer','registrar']::app_role[]));

CREATE OR REPLACE FUNCTION public.cart_expected_amount(_cart_id uuid)
RETURNS numeric LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT greatest(coalesce(c.locked_total, 0) - coalesce((SELECT sum(amount) FROM public.comps WHERE cart_id = c.id), 0), 0)
  FROM public.carts c WHERE c.id = _cart_id
$$;

CREATE OR REPLACE FUNCTION public.queue_registration_confirmation(_cart_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_cart RECORD; v_list text;
BEGIN
  SELECT * INTO v_cart FROM public.carts WHERE id = _cart_id;
  IF v_cart.id IS NULL OR EXISTS (SELECT 1 FROM public.notification_queue WHERE dedupe_key = 'reg-confirm-' || _cart_id) THEN RETURN; END IF;
  SELECT string_agg('- ' || coalesce(p.preferred_name, p.first_name) || ' ' || p.last_name || ': ' || pr.name || ' ' || coalesce(d.display_label, d.name, ''), E'\n' ORDER BY p.first_name)
    INTO v_list
  FROM public.registrations r JOIN public.players p ON p.id = r.player_id JOIN public.programs pr ON pr.id = r.program_id
  LEFT JOIN public.divisions d ON d.id = r.division_id
  WHERE r.checkout_id = _cart_id AND r.lifecycle <> 'cancelled';
  INSERT INTO public.notification_queue (league_id, event_key, template_key, priority, subject, body_markdown, payload,
    audience_description, dedupe_key, status, requires_approval)
  VALUES (v_cart.league_id, 'registration.confirmed', 'registration_confirmation', 'normal',
    'You''re registered for the 2027 CDBL season',
    E'Thanks for registering. Your spots are confirmed:\n\n' || coalesce(v_list, '') ||
    E'\n\nThe CDBL website is the official schedule. GameChanger is for live scores.',
    jsonb_build_object('scope', 'household', 'household_id', v_cart.household_id, 'cart_id', _cart_id),
    'This family', 'reg-confirm-' || _cart_id, 'pending', false);
END $$;

CREATE OR REPLACE FUNCTION public.queue_call_task(_cart_id uuid, _reason text, _key text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_cart RECORD; v_q uuid; v_g RECORD;
BEGIN
  SELECT * INTO v_cart FROM public.carts WHERE id = _cart_id;
  IF v_cart.id IS NULL OR EXISTS (SELECT 1 FROM public.notification_queue WHERE dedupe_key = _key) THEN RETURN; END IF;
  INSERT INTO public.notification_queue (league_id, event_key, template_key, priority, subject, body_markdown, payload,
    audience_description, dedupe_key, status, requires_approval)
  VALUES (v_cart.league_id, 'registrar.call_task', 'call_task', 'urgent', 'Call this family', _reason,
    jsonb_build_object('scope', 'call_task', 'household_id', v_cart.household_id, 'cart_id', _cart_id),
    'Registrar call task', _key, 'pending', true)
  RETURNING id INTO v_q;
  SELECT g.id, coalesce(g.phone, g.email, 'no phone on file') AS addr INTO v_g
  FROM public.guardian_households gh JOIN public.guardians g ON g.id = gh.guardian_id
  WHERE gh.household_id = v_cart.household_id ORDER BY gh.created_at LIMIT 1;
  INSERT INTO public.notification_recipients (queue_id, league_id, guardian_id, household_id, channel, address)
  VALUES (v_q, v_cart.league_id, v_g.id, v_cart.household_id, 'call_task', coalesce(v_g.addr, 'no contact on file'));
END $$;

CREATE OR REPLACE FUNCTION public.recompute_cart_payment(_cart_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_exp numeric; v_net numeric; v_chg numeric; v_back numeric; v_state text;
BEGIN
  v_exp := public.cart_expected_amount(_cart_id);
  SELECT coalesce(sum(amount) FILTER (WHERE status = 'succeeded'), 0),
         coalesce(sum(amount) FILTER (WHERE status = 'succeeded' AND kind = 'charge'), 0),
         coalesce(-sum(amount) FILTER (WHERE status = 'succeeded' AND kind IN ('refund','dispute')), 0)
    INTO v_net, v_chg, v_back FROM public.payments WHERE cart_id = _cart_id;
  v_state := CASE
    WHEN v_chg = 0 THEN 'unpaid'
    WHEN v_net <= 0 THEN 'refunded'
    WHEN v_back > 0 AND v_net < v_exp THEN 'part_refunded'
    WHEN v_net >= v_exp THEN 'paid'
    ELSE 'partial' END;
  UPDATE public.registrations SET payment = v_state, updated_at = now()
   WHERE checkout_id = _cart_id AND payment <> 'waived' AND payment IS DISTINCT FROM v_state;
  IF v_state = 'paid' THEN
    UPDATE public.carts SET status = 'paid', lock_expires_at = NULL WHERE id = _cart_id AND status <> 'paid';
    UPDATE public.registrations SET lifecycle = 'active', seat = 'confirmed', on_hold_until = NULL, hold_reason = NULL
     WHERE checkout_id = _cart_id AND lifecycle <> 'cancelled';
    PERFORM public.queue_registration_confirmation(_cart_id);
  END IF;
  RETURN v_state;
END $$;

CREATE OR REPLACE FUNCTION public.ingest_payment_event(_e jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_cart RECORD; v_id uuid; v_kind text := _e->>'kind'; v_status text := _e->>'status'; v_cart_id uuid; v_state text;
BEGIN
  IF coalesce((_e->>'livemode')::boolean, false) THEN
    RAISE EXCEPTION 'Live-mode payments are not accepted until the board approves Stripe' USING ERRCODE = 'check_violation'; END IF;
  v_cart_id := public.safe_uuid(_e->>'cart_id');
  IF v_cart_id IS NULL AND _e->>'related_payment_id' IS NOT NULL THEN
    SELECT cart_id INTO v_cart_id FROM public.payments WHERE provider_payment_id = _e->>'related_payment_id' AND cart_id IS NOT NULL LIMIT 1;
  END IF;
  SELECT * INTO v_cart FROM public.carts WHERE id = v_cart_id;

  INSERT INTO public.payments (league_id, cart_id, household_id, provider, provider_payment_id, related_payment_id, kind, status,
    method, amount, currency, revenue_class, registration_ids, livemode, occurred_at, raw)
  VALUES (coalesce(v_cart.league_id, public.current_league_id()), v_cart.id, v_cart.household_id, 'stripe',
    _e->>'provider_payment_id', _e->>'related_payment_id', v_kind, v_status, _e->>'method',
    (_e->>'amount')::numeric, coalesce(_e->>'currency', 'usd'), 'program_service',
    coalesce((SELECT array_agg(public.safe_uuid(x)) FROM jsonb_array_elements_text(coalesce(_e->'registration_ids', '[]'::jsonb)) x
              WHERE public.safe_uuid(x) IS NOT NULL), '{}'),
    false, coalesce((_e->>'occurred_at')::timestamptz, now()), _e->'raw')
  ON CONFLICT (provider_payment_id, status) DO NOTHING
  RETURNING id INTO v_id;

  IF v_id IS NULL THEN RETURN jsonb_build_object('result', 'duplicate'); END IF;
  IF v_cart.id IS NULL THEN RETURN jsonb_build_object('result', 'recorded_unmatched', 'payment_id', v_id); END IF;

  IF v_kind = 'charge' AND v_status = 'pending' THEN
    UPDATE public.carts SET status = 'payment_pending', lock_expires_at = NULL WHERE id = v_cart.id AND status <> 'paid';
    UPDATE public.registrations SET seat = 'confirmed', lifecycle = 'active', on_hold_until = NULL, hold_reason = 'bank_debit_pending'
     WHERE checkout_id = v_cart.id AND lifecycle <> 'cancelled';
  ELSIF v_kind = 'charge' AND v_status = 'failed' THEN
    UPDATE public.carts SET status = 'on_hold' WHERE id = v_cart.id AND status <> 'paid';
    UPDATE public.registrations SET on_hold_until = 'infinity', hold_reason = 'payment_failed'
     WHERE checkout_id = v_cart.id AND lifecycle <> 'cancelled';
    PERFORM public.queue_call_task(v_cart.id, 'A bank payment for this family did not go through. Their spots are kept. Call to arrange payment.',
      'call-failed-' || (_e->>'provider_payment_id'));
  END IF;
  v_state := public.recompute_cart_payment(v_cart.id);
  RETURN jsonb_build_object('result', 'recorded', 'payment_id', v_id, 'payment', v_state);
END $$;

CREATE OR REPLACE FUNCTION public.record_heartbeat(_job_key text, _ok boolean, _detail jsonb)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path TO 'public'
AS $$ INSERT INTO public.job_heartbeats (job_key, ok, detail) VALUES (_job_key, _ok, coalesce(_detail, '{}'::jsonb)) $$;

CREATE OR REPLACE FUNCTION public.expire_stale_holds()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE r RECORD; v_cap int; v_taken int; v_released int := 0; v_reminded int := 0;
BEGIN
  FOR r IN SELECT reg.*, c.household_id FROM public.registrations reg JOIN public.carts c ON c.id = reg.checkout_id
    WHERE reg.seat = 'held' AND reg.lifecycle = 'submitted' AND reg.hold_reason = 'checkout'
      AND reg.on_hold_until IS NOT NULL AND reg.on_hold_until < now()
      AND NOT EXISTS (SELECT 1 FROM public.payments p WHERE p.cart_id = c.id AND p.status IN ('pending','succeeded'))
      AND NOT EXISTS (SELECT 1 FROM public.payment_expectations e WHERE e.cart_id = c.id AND e.cancelled_at IS NULL)
      AND NOT EXISTS (SELECT 1 FROM public.payments p WHERE p.cart_id IS NULL AND p.household_id = c.household_id)
      AND NOT EXISTS (SELECT 1 FROM public.assistance_requests a WHERE a.cart_id = c.id AND a.status = 'open')
  LOOP
    SELECT capacity INTO v_cap FROM public.divisions WHERE id = r.division_id;
    SELECT count(*) INTO v_taken FROM public.registrations x
     WHERE x.division_id = r.division_id AND x.season_id = r.season_id AND x.seat IN ('held','confirmed') AND x.lifecycle <> 'cancelled';
    IF v_cap IS NOT NULL AND v_taken >= ceil(0.9 * v_cap) THEN
      UPDATE public.registrations SET seat = 'released', lifecycle = 'draft', on_hold_until = NULL, hold_reason = NULL WHERE id = r.id;
      UPDATE public.carts SET status = 'open', lock_id = NULL, lock_expires_at = NULL WHERE id = r.checkout_id AND status = 'locked';
      v_released := v_released + 1;
    ELSE
      IF NOT EXISTS (SELECT 1 FROM public.notification_queue WHERE dedupe_key = 'hold-reminder-' || r.checkout_id || '-' || current_date) THEN
        INSERT INTO public.notification_queue (event_key, template_key, priority, subject, body_markdown, payload, audience_description, dedupe_key, status, requires_approval)
        VALUES ('registration.payment_reminder', 'payment_reminder', 'normal', 'Finish your CDBL registration',
          E'Your player''s spot is still saved. Finish checkout on the CDBL website when you''re ready.',
          jsonb_build_object('scope', 'household', 'household_id', r.household_id, 'cart_id', r.checkout_id),
          'This family', 'hold-reminder-' || r.checkout_id || '-' || current_date, 'pending', false);
        v_reminded := v_reminded + 1;
      END IF;
    END IF;
  END LOOP;
  RETURN jsonb_build_object('released', v_released, 'reminded', v_reminded);
END $$;

CREATE OR REPLACE FUNCTION public.lock_my_cart(_cart_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_cart RECORD; v_res jsonb; v_lock uuid := gen_random_uuid(); v_set RECORD; l jsonb; v_disc uuid; v_hold int;
  v_until timestamptz; r RECORD; v_div RECORD; v_taken int; v_wait int := 0;
BEGIN
  SELECT * INTO v_cart FROM public.carts WHERE id = _cart_id FOR UPDATE;
  IF v_cart.id IS NULL OR NOT public.is_guardian_of_household(v_cart.household_id) THEN RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501'; END IF;
  IF v_cart.status IN ('paid','cancelled','on_hold','payment_pending') THEN RAISE EXCEPTION 'This checkout can''t be restarted' USING ERRCODE = 'check_violation'; END IF;
  IF v_cart.status = 'locked' AND v_cart.lock_expires_at > now() THEN RETURN public.cart_lines(_cart_id); END IF;
  IF NOT EXISTS (SELECT 1 FROM public.registrations WHERE checkout_id = _cart_id AND lifecycle <> 'cancelled') THEN
    RAISE EXCEPTION 'Add a registration first' USING ERRCODE = 'check_violation'; END IF;

  SELECT * INTO v_set FROM public.season_settings WHERE season_id = v_cart.season_id;
  v_hold := coalesce(v_set.seat_hold_minutes, 2880);
  v_until := date_trunc('hour', now() + make_interval(mins => v_hold)) + interval '1 hour';

  FOR r IN SELECT reg.id, reg.division_id, reg.season_id FROM public.registrations reg
    WHERE reg.checkout_id = _cart_id AND reg.lifecycle IN ('draft','submitted') AND reg.seat NOT IN ('held','confirmed')
    ORDER BY reg.division_id NULLS LAST, reg.id
  LOOP
    IF r.division_id IS NOT NULL THEN
      SELECT id, capacity, waitlist_enabled INTO v_div FROM public.divisions WHERE id = r.division_id FOR UPDATE;
      IF v_div.capacity IS NOT NULL THEN
        SELECT count(*) INTO v_taken FROM public.registrations x
         WHERE x.division_id = r.division_id AND x.season_id = r.season_id AND x.seat IN ('held','confirmed')
           AND x.lifecycle <> 'cancelled' AND x.id <> r.id;
        IF v_taken >= v_div.capacity THEN
          UPDATE public.registrations SET seat = 'waitlisted', lifecycle = 'submitted', checkout_id = NULL,
            hold_reason = 'waitlist', on_hold_until = NULL, submitted_at = coalesce(submitted_at, now()) WHERE id = r.id;
          v_wait := v_wait + 1;
          CONTINUE;
        END IF;
      END IF;
    END IF;
    UPDATE public.registrations SET seat = 'held' WHERE id = r.id;
  END LOOP;

  IF NOT EXISTS (SELECT 1 FROM public.registrations WHERE checkout_id = _cart_id AND lifecycle <> 'cancelled') THEN
    RETURN jsonb_build_object('lines', '[]'::jsonb, 'total', 0, 'locked', false, 'status', 'open', 'waitlisted', v_wait);
  END IF;

  UPDATE public.carts SET status = 'open', lock_id = NULL WHERE id = _cart_id;
  v_res := public.cart_lines(_cart_id);
  IF (v_res->>'closed')::boolean THEN RAISE EXCEPTION 'Registration is closed for this season' USING ERRCODE = 'check_violation'; END IF;

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
    lock_expires_at = v_until, locked_total = (v_res->>'total')::numeric
   WHERE id = _cart_id;
  UPDATE public.registrations SET lifecycle = 'submitted', submitted_at = coalesce(submitted_at, now()),
    on_hold_until = v_until, hold_reason = coalesce(hold_reason, 'checkout')
   WHERE checkout_id = _cart_id AND lifecycle IN ('draft','submitted');
  RETURN public.cart_lines(_cart_id) || jsonb_build_object('waitlisted', v_wait);
END $$;

CREATE OR REPLACE FUNCTION public.checkout_session_input(_cart_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_cart RECORD; v_regs jsonb; v_email text;
BEGIN
  SELECT * INTO v_cart FROM public.carts WHERE id = _cart_id;
  IF v_cart.id IS NULL OR NOT public.is_guardian_of_household(v_cart.household_id) THEN RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501'; END IF;
  IF v_cart.status <> 'locked' OR v_cart.lock_expires_at IS NULL OR v_cart.lock_expires_at <= now() THEN
    RAISE EXCEPTION 'Hold your spots first' USING ERRCODE = 'check_violation'; END IF;
  SELECT coalesce(jsonb_agg(id), '[]'::jsonb) INTO v_regs FROM public.registrations WHERE checkout_id = _cart_id AND lifecycle <> 'cancelled';
  SELECT email INTO v_email FROM public.guardians WHERE auth_user_id = auth.uid() LIMIT 1;
  RETURN jsonb_build_object('cart_id', v_cart.id, 'amount', public.cart_expected_amount(_cart_id),
    'registration_ids', v_regs, 'household_id', v_cart.household_id, 'email', v_email, 'hold_until', v_cart.lock_expires_at);
END $$;

CREATE OR REPLACE FUNCTION public.set_cart_stripe_session(_cart_id uuid, _session_id text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path TO 'public'
AS $$ UPDATE public.carts SET stripe_session_id = _session_id WHERE id = _cart_id $$;

CREATE OR REPLACE FUNCTION public.cart_balance(_cart_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_cart RECORD; v_paid numeric; v_pending boolean;
BEGIN
  SELECT * INTO v_cart FROM public.carts WHERE id = _cart_id;
  IF v_cart.id IS NULL OR NOT (public.is_guardian_of_household(v_cart.household_id)
     OR public.has_any_role(auth.uid(), ARRAY['admin','treasurer','registrar']::app_role[])) THEN
    RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501'; END IF;
  SELECT coalesce(sum(amount) FILTER (WHERE status = 'succeeded'), 0) INTO v_paid FROM public.payments WHERE cart_id = _cart_id;
  v_pending := EXISTS (SELECT 1 FROM public.payments p WHERE p.cart_id = _cart_id AND p.kind = 'charge' AND p.status = 'pending'
    AND NOT EXISTS (SELECT 1 FROM public.payments q WHERE q.provider_payment_id = p.provider_payment_id AND q.status IN ('succeeded','failed')));
  RETURN jsonb_build_object('status', v_cart.status, 'expected', public.cart_expected_amount(_cart_id), 'paid', v_paid,
    'balance', greatest(public.cart_expected_amount(_cart_id) - v_paid, 0), 'bank_pending', v_pending,
    'hold_until', v_cart.lock_expires_at,
    'expectations', (SELECT coalesce(jsonb_agg(jsonb_build_object('kind', kind, 'due_on', due_on, 'amount', amount, 'reference_code', reference_code) ORDER BY due_on), '[]'::jsonb)
                     FROM public.payment_expectations WHERE cart_id = _cart_id AND cancelled_at IS NULL));
END $$;

CREATE OR REPLACE FUNCTION public.choose_offline_payment(_cart_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_cart RECORD; v_ref text; v_due date := current_date + 21; v_amt numeric; v_existing RECORD;
BEGIN
  SELECT * INTO v_cart FROM public.carts WHERE id = _cart_id FOR UPDATE;
  IF v_cart.id IS NULL OR NOT public.is_guardian_of_household(v_cart.household_id) THEN RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501'; END IF;
  SELECT * INTO v_existing FROM public.payment_expectations WHERE cart_id = _cart_id AND kind = 'offline' AND cancelled_at IS NULL LIMIT 1;
  IF v_existing.id IS NOT NULL THEN
    RETURN jsonb_build_object('reference_code', v_existing.reference_code, 'due_on', v_existing.due_on, 'amount', v_existing.amount,
      'payee', 'Central District Baseball League', 'mail_to', 'P.O. Box 5551, Elgin, IL');
  END IF;
  IF v_cart.status <> 'locked' OR v_cart.lock_expires_at <= now() THEN RAISE EXCEPTION 'Hold your spots first' USING ERRCODE = 'check_violation'; END IF;
  v_amt := public.cart_expected_amount(_cart_id);
  IF v_amt <= 0 THEN RAISE EXCEPTION 'Nothing to pay' USING ERRCODE = 'check_violation'; END IF;
  v_ref := 'CDBL-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
  INSERT INTO public.payment_expectations (cart_id, household_id, kind, due_on, amount, reference_code, created_by)
  VALUES (_cart_id, v_cart.household_id, 'offline', v_due, v_amt, v_ref, auth.uid());
  UPDATE public.carts SET status = 'payment_pending', lock_expires_at = NULL WHERE id = _cart_id;
  UPDATE public.registrations SET on_hold_until = ((v_due + 1)::timestamp AT TIME ZONE 'America/Chicago'), hold_reason = 'offline_payment'
   WHERE checkout_id = _cart_id AND lifecycle <> 'cancelled';
  INSERT INTO public.notification_queue (league_id, event_key, template_key, priority, subject, body_markdown, payload, audience_description, dedupe_key, status, requires_approval)
  VALUES (v_cart.league_id, 'registration.offline_payment', 'offline_payment', 'normal', 'How to pay your CDBL registration by check or cash',
    'Your spots are saved while we wait for your payment.' || E'\n\n' ||
    'Amount: $' || to_char(v_amt, 'FM999990.00') || E'\n' ||
    'Make checks payable to: Central District Baseball League' || E'\n' ||
    'Mail to: P.O. Box 5551, Elgin, IL' || E'\n' ||
    'Please pay by: ' || to_char(v_due, 'FMDay, FMMonth FMDD, YYYY') || E'\n' ||
    'Reference code (write it on the check memo): ' || v_ref,
    jsonb_build_object('scope', 'household', 'household_id', v_cart.household_id, 'cart_id', _cart_id),
    'This family', 'offline-' || _cart_id, 'pending', false);
  RETURN jsonb_build_object('reference_code', v_ref, 'due_on', v_due, 'amount', v_amt,
    'payee', 'Central District Baseball League', 'mail_to', 'P.O. Box 5551, Elgin, IL');
END $$;

CREATE OR REPLACE FUNCTION public.record_offline_payment(_cart_id uuid, _amount numeric, _method text, _note text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_cart RECORD; v_id uuid;
BEGIN
  IF NOT public.has_any_role(auth.uid(), ARRAY['admin','registrar','treasurer']::app_role[]) OR NOT public.mfa_satisfied() THEN
    RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501'; END IF;
  IF coalesce(_amount, 0) <= 0 OR _method NOT IN ('cash','check') THEN RAISE EXCEPTION 'Enter the amount and choose cash or check' USING ERRCODE = 'check_violation'; END IF;
  SELECT * INTO v_cart FROM public.carts WHERE id = _cart_id AND league_id = public.current_league_id();
  IF v_cart.id IS NULL THEN RAISE EXCEPTION 'Checkout not found' USING ERRCODE = 'check_violation'; END IF;
  INSERT INTO public.payments (league_id, cart_id, household_id, provider, provider_payment_id, kind, status, method, amount,
    registration_ids, recorded_by, note)
  VALUES (v_cart.league_id, v_cart.id, v_cart.household_id, 'offline', 'offline-' || gen_random_uuid(), 'charge', 'succeeded', _method, _amount,
    coalesce((SELECT array_agg(id) FROM public.registrations WHERE checkout_id = _cart_id), '{}'), auth.uid(), _note)
  RETURNING id INTO v_id;
  RETURN jsonb_build_object('payment_id', v_id, 'payment', public.recompute_cart_payment(_cart_id));
END $$;

CREATE OR REPLACE FUNCTION public.set_payment_plan(_cart_id uuid, _schedule jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_cart RECORD; v_sum numeric; v_bal numeric; v_ref text; s jsonb; v_last date;
BEGIN
  IF NOT public.has_any_role(auth.uid(), ARRAY['admin','registrar','treasurer']::app_role[]) OR NOT public.mfa_satisfied() THEN
    RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501'; END IF;
  SELECT * INTO v_cart FROM public.carts WHERE id = _cart_id AND league_id = public.current_league_id() FOR UPDATE;
  IF v_cart.id IS NULL OR v_cart.locked_total IS NULL THEN RAISE EXCEPTION 'Checkout not found or not started' USING ERRCODE = 'check_violation'; END IF;
  SELECT coalesce(sum((x->>'amount')::numeric), 0), max((x->>'due_on')::date) INTO v_sum, v_last FROM jsonb_array_elements(_schedule) x;
  v_bal := public.cart_expected_amount(_cart_id) - coalesce((SELECT sum(amount) FROM public.payments WHERE cart_id = _cart_id AND status = 'succeeded'), 0);
  IF jsonb_array_length(_schedule) < 1 OR v_sum <> v_bal THEN
    RAISE EXCEPTION 'The plan must add up to the balance of $%', v_bal USING ERRCODE = 'check_violation'; END IF;
  UPDATE public.payment_expectations SET cancelled_at = now() WHERE cart_id = _cart_id AND cancelled_at IS NULL;
  v_ref := 'CDBL-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
  FOR s IN SELECT * FROM jsonb_array_elements(_schedule) LOOP
    INSERT INTO public.payment_expectations (cart_id, household_id, kind, due_on, amount, reference_code, created_by)
    VALUES (_cart_id, v_cart.household_id, 'plan', (s->>'due_on')::date, (s->>'amount')::numeric, v_ref, auth.uid());
  END LOOP;
  UPDATE public.carts SET status = CASE WHEN status = 'paid' THEN status ELSE 'payment_pending' END, lock_expires_at = NULL WHERE id = _cart_id;
  UPDATE public.registrations SET on_hold_until = ((v_last + 1)::timestamp AT TIME ZONE 'America/Chicago'), hold_reason = 'payment_plan'
   WHERE checkout_id = _cart_id AND lifecycle <> 'cancelled' AND payment <> 'paid';
  RETURN jsonb_build_object('reference_code', v_ref, 'count', jsonb_array_length(_schedule));
END $$;

CREATE OR REPLACE FUNCTION public.list_call_tasks()
RETURNS TABLE (id uuid, created_at timestamptz, body text, household_name text, contact text, cart_id uuid, done boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_any_role(auth.uid(), ARRAY['admin','registrar','treasurer']::app_role[]) THEN RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501'; END IF;
  RETURN QUERY
  SELECT q.id, q.created_at, q.body_markdown, h.name, nr.address, public.safe_uuid(q.payload->>'cart_id'), q.status = 'sent'
  FROM public.notification_queue q
  LEFT JOIN public.notification_recipients nr ON nr.queue_id = q.id AND nr.channel = 'call_task'
  LEFT JOIN public.households h ON h.id = public.safe_uuid(q.payload->>'household_id')
  WHERE q.event_key = 'registrar.call_task' AND q.league_id = public.current_league_id()
  ORDER BY (q.status = 'sent'), q.created_at DESC LIMIT 200;
END $$;

CREATE OR REPLACE FUNCTION public.complete_call_task(_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_any_role(auth.uid(), ARRAY['admin','registrar','treasurer']::app_role[]) THEN RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501'; END IF;
  UPDATE public.notification_queue SET status = 'sent', sent_at = now(), approved_by = auth.uid()
   WHERE id = _id AND event_key = 'registrar.call_task';
  UPDATE public.notification_recipients SET status = 'delivered', delivered_at = now() WHERE queue_id = _id;
END $$;

REVOKE ALL ON FUNCTION public.cart_expected_amount(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.queue_registration_confirmation(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.queue_call_task(uuid, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.recompute_cart_payment(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.ingest_payment_event(jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.record_heartbeat(text, boolean, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.expire_stale_holds() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_cart_stripe_session(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ingest_payment_event(jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.record_heartbeat(text, boolean, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.expire_stale_holds() TO service_role;
GRANT EXECUTE ON FUNCTION public.set_cart_stripe_session(uuid, text) TO service_role;
REVOKE ALL ON FUNCTION public.lock_my_cart(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.checkout_session_input(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.cart_balance(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.choose_offline_payment(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.record_offline_payment(uuid, numeric, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.set_payment_plan(uuid, jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.list_call_tasks() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.complete_call_task(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.lock_my_cart(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.checkout_session_input(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cart_balance(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.choose_offline_payment(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_offline_payment(uuid, numeric, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_payment_plan(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_call_tasks() TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_call_task(uuid) TO authenticated;