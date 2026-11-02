-- Phase 6: league office views and real family status.

CREATE VIEW public.roster_eligible WITH (security_invoker = true) AS
  SELECT r.id AS registration_id, r.league_id, r.player_id, r.season_id, r.program_id, r.division_id
  FROM public.registrations r
  WHERE r.lifecycle = 'active' AND r.seat = 'confirmed' AND r.waiver_status = 'signed'
    AND r.payment IN ('paid','waived','partial');
GRANT SELECT ON public.roster_eligible TO authenticated;
GRANT SELECT ON public.roster_eligible TO service_role;
REVOKE ALL ON public.roster_eligible FROM anon;

CREATE TABLE public.coverage_mode_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL DEFAULT public.current_league_id() REFERENCES public.leagues(id) ON DELETE RESTRICT,
  turned_on boolean NOT NULL,
  changed_by uuid,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.coverage_mode_events TO authenticated;
GRANT ALL ON public.coverage_mode_events TO service_role;
REVOKE ALL ON public.coverage_mode_events FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.coverage_mode_events FROM authenticated;
ALTER TABLE public.coverage_mode_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read coverage mode" ON public.coverage_mode_events FOR SELECT TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND public.has_any_role(auth.uid(), ARRAY['admin','board_member','registrar','treasurer','commissioner']::app_role[]));
CREATE TRIGGER trg_coverage_insert_only BEFORE UPDATE OR DELETE ON public.coverage_mode_events FOR EACH ROW EXECUTE FUNCTION public.block_signature_changes();

CREATE OR REPLACE FUNCTION public.coverage_mode_on()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT coalesce((SELECT turned_on FROM public.coverage_mode_events
    WHERE league_id = public.current_league_id() ORDER BY created_at DESC, id DESC LIMIT 1), false)
$$;

CREATE OR REPLACE FUNCTION public.set_coverage_mode(_on boolean, _note text DEFAULT NULL)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_any_role(auth.uid(), ARRAY['admin','registrar']::app_role[]) THEN RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501'; END IF;
  IF public.coverage_mode_on() IS DISTINCT FROM _on THEN
    INSERT INTO public.coverage_mode_events (turned_on, changed_by, note) VALUES (_on, auth.uid(), _note);
  END IF;
  RETURN _on;
END $$;
REVOKE EXECUTE ON FUNCTION public.set_coverage_mode(boolean, text) FROM PUBLIC, anon;

CREATE OR REPLACE FUNCTION public.expire_stale_holds()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE r RECORD; v_cap int; v_taken int; v_released int := 0; v_reminded int := 0;
BEGIN
  IF public.coverage_mode_on() THEN
    RETURN jsonb_build_object('released', 0, 'reminded', 0, 'paused', true);
  END IF;
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
  RETURN jsonb_build_object('released', v_released, 'reminded', v_reminded, 'paused', false);
END $function$;

CREATE TABLE public.worklist_done (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL DEFAULT public.current_league_id() REFERENCES public.leagues(id) ON DELETE RESTRICT,
  item_key text NOT NULL,
  done_by uuid,
  done_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT worklist_done_unique UNIQUE (league_id, item_key)
);
GRANT SELECT ON public.worklist_done TO authenticated;
GRANT ALL ON public.worklist_done TO service_role;
REVOKE ALL ON public.worklist_done FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.worklist_done FROM authenticated;
ALTER TABLE public.worklist_done ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Registrar reads worklist marks" ON public.worklist_done FOR SELECT TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND public.has_any_role(auth.uid(), ARRAY['admin','registrar']::app_role[]));
CREATE TRIGGER trg_worklist_done_insert_only BEFORE UPDATE OR DELETE ON public.worklist_done FOR EACH ROW EXECUTE FUNCTION public.block_signature_changes();

CREATE OR REPLACE FUNCTION public.mark_worklist_done(_item_key text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_any_role(auth.uid(), ARRAY['admin','registrar']::app_role[]) THEN RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501'; END IF;
  IF _item_key !~ '^(phone|waiver|hold)-[0-9a-f-]{36}$' THEN RAISE EXCEPTION 'This item is finished with its own action' USING ERRCODE = 'check_violation'; END IF;
  INSERT INTO public.worklist_done (item_key, done_by) VALUES (_item_key, auth.uid()) ON CONFLICT DO NOTHING;
END $$;
REVOKE EXECUTE ON FUNCTION public.mark_worklist_done(text) FROM PUBLIC, anon;

CREATE OR REPLACE FUNCTION public.registration_forms_progress(_registration_id uuid)
RETURNS TABLE (signed int, required int, next_title text, next_form_key text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  WITH cur AS (
    SELECT DISTINCT ON (form_key) form_key, title, required, display_order FROM public.form_documents
    WHERE league_id = public.current_league_id() ORDER BY form_key, version DESC
  ), s AS (
    SELECT cur.*, EXISTS (SELECT 1 FROM public.registration_forms f
      WHERE f.registration_id = _registration_id AND f.form_key = cur.form_key AND f.attested
        AND f.form_version >= public.form_min_valid_version(cur.form_key)) AS done
    FROM cur WHERE cur.required
  )
  SELECT count(*) FILTER (WHERE done)::int, count(*)::int,
    (SELECT title FROM s WHERE NOT done ORDER BY display_order, form_key LIMIT 1),
    (SELECT form_key FROM s WHERE NOT done ORDER BY display_order, form_key LIMIT 1)
  FROM s
$$;
REVOKE EXECUTE ON FUNCTION public.registration_forms_progress(uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.cart_amount_due(_cart_id uuid)
RETURNS numeric LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT greatest(public.cart_expected_amount(_cart_id)
    - coalesce((SELECT sum(amount) FROM public.payments WHERE cart_id = _cart_id AND status = 'succeeded'), 0), 0)
$$;
REVOKE EXECUTE ON FUNCTION public.cart_amount_due(uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.registrar_worklist()
RETURNS TABLE (item_key text, kind text, title text, detail text, due_at timestamptz, ref_id uuid, amount numeric)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_league uuid := public.current_league_id();
BEGIN
  IF NOT public.has_any_role(auth.uid(), ARRAY['admin','registrar']::app_role[]) THEN RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501'; END IF;
  RETURN QUERY
  SELECT 'placement-' || pr.id, 'placement'::text,
    coalesce(p.preferred_name, p.first_name) || ' ' || p.last_name || ' needs a division',
    'Grade ' || coalesce(pr.grade::text, '?') || ', league age ' || coalesce(pr.league_age::text, '?'),
    NULL::timestamptz, pr.id, NULL::numeric
  FROM public.placement_reviews pr JOIN public.players p ON p.id = pr.player_id
  WHERE pr.league_id = v_league AND pr.status = 'open'
  UNION ALL
  SELECT 'offline-' || e.id, 'offline'::text,
    coalesce(h.name, 'A family') || ' is paying by check',
    'Reference ' || e.reference_code || ', due ' || to_char(e.due_on, 'Mon DD'),
    (e.due_on + 1)::timestamp AT TIME ZONE 'America/Chicago', e.cart_id, public.cart_amount_due(e.cart_id)
  FROM public.payment_expectations e JOIN public.carts c ON c.id = e.cart_id LEFT JOIN public.households h ON h.id = e.household_id
  WHERE e.league_id = v_league AND e.kind = 'offline' AND e.cancelled_at IS NULL AND c.status <> 'paid'
  UNION ALL
  SELECT 'call-' || q.id, 'call'::text, 'Call ' || coalesce(h.name, 'this family'),
    q.body_markdown || coalesce(' (' || nr.address || ')', ''), NULL::timestamptz, q.id, NULL::numeric
  FROM public.notification_queue q
  LEFT JOIN public.notification_recipients nr ON nr.queue_id = q.id AND nr.channel = 'call_task'
  LEFT JOIN public.households h ON h.id = public.safe_uuid(q.payload->>'household_id')
  WHERE q.league_id = v_league AND q.event_key = 'registrar.call_task' AND q.status <> 'sent'
  UNION ALL
  SELECT * FROM (
    SELECT DISTINCT ON (g.id) 'phone-' || g.id, 'phone'::text,
      g.first_name || ' ' || g.last_name || ' can only be reached by phone',
      coalesce(g.phone, 'no phone on file') || ', spot saved until ' || to_char(r.on_hold_until AT TIME ZONE 'America/Chicago', 'Mon DD'),
      r.on_hold_until, g.id, NULL::numeric
    FROM public.guardians g
    JOIN public.guardian_households gh ON gh.guardian_id = g.id
    JOIN public.household_players hp ON hp.household_id = gh.household_id
    JOIN public.registrations r ON r.player_id = hp.player_id
    WHERE g.league_id = v_league AND (g.email IS NULL OR g.email = '' OR g.contact_method = 'phone')
      AND r.lifecycle IN ('draft','submitted') AND r.on_hold_until IS NOT NULL AND r.on_hold_until <> 'infinity'
      AND NOT EXISTS (SELECT 1 FROM public.worklist_done w WHERE w.league_id = v_league AND w.item_key = 'phone-' || g.id)
    ORDER BY g.id, r.on_hold_until
  ) ph
  UNION ALL
  SELECT 'waiver-' || r.id, 'waiver'::text,
    coalesce(p.preferred_name, p.first_name) || ' ' || p.last_name || ' has forms to sign',
    fp.signed || ' of ' || fp.required || ' signed', r.on_hold_until, r.id, NULL::numeric
  FROM public.registrations r JOIN public.players p ON p.id = r.player_id
  CROSS JOIN LATERAL public.registration_forms_progress(r.id) fp
  WHERE r.league_id = v_league AND r.waiver_status = 'pending_guardian' AND r.lifecycle IN ('submitted','active')
    AND NOT EXISTS (SELECT 1 FROM public.worklist_done w WHERE w.league_id = v_league AND w.item_key = 'waiver-' || r.id)
  UNION ALL
  SELECT 'hold-' || r.id, 'hold'::text,
    coalesce(p.preferred_name, p.first_name) || ' ' || p.last_name || ' is on hold',
    replace(coalesce(r.hold_reason, 'hold'), '_', ' '), NULLIF(r.on_hold_until, 'infinity'::timestamptz), r.id, NULL::numeric
  FROM public.registrations r JOIN public.players p ON p.id = r.player_id
  WHERE r.league_id = v_league AND r.lifecycle <> 'cancelled' AND r.hold_reason IS NOT NULL
    AND r.hold_reason NOT IN ('checkout','offline_payment','payment_plan','bank_debit_pending')
    AND NOT EXISTS (SELECT 1 FROM public.worklist_done w WHERE w.league_id = v_league AND w.item_key = 'hold-' || r.id);
END $$;
REVOKE EXECUTE ON FUNCTION public.registrar_worklist() FROM PUBLIC, anon;

CREATE OR REPLACE FUNCTION public.list_registrations()
RETURNS TABLE (registration_id uuid, player_id uuid, player_name text, household_id uuid, household_name text,
  program_id uuid, program_name text, program_type text, division_id uuid, division_name text,
  lifecycle text, seat text, forms_signed int, forms_required int, waiver_status text,
  payment text, hold_reason text, on_hold_until timestamptz, amount_due numeric)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_full boolean; v_league uuid := public.current_league_id();
BEGIN
  v_full := public.has_any_role(auth.uid(), ARRAY['admin','registrar']::app_role[]);
  IF NOT v_full AND NOT public.has_role(auth.uid(), 'commissioner') THEN RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501'; END IF;
  RETURN QUERY
  SELECT r.id, p.id, coalesce(p.preferred_name, p.first_name) || ' ' || p.last_name,
    CASE WHEN v_full THEN c.household_id END, CASE WHEN v_full THEN h.name END,
    pr.id, pr.name, pr.type::text, d.id, coalesce(d.display_label, d.name),
    r.lifecycle, r.seat, fp.signed, fp.required, r.waiver_status,
    r.payment, r.hold_reason, r.on_hold_until,
    CASE WHEN v_full AND r.checkout_id IS NOT NULL THEN public.cart_amount_due(r.checkout_id) END
  FROM public.registrations r
  JOIN public.players p ON p.id = r.player_id
  LEFT JOIN public.programs pr ON pr.id = r.program_id
  LEFT JOIN public.divisions d ON d.id = r.division_id
  LEFT JOIN public.carts c ON c.id = r.checkout_id
  LEFT JOIN public.households h ON h.id = c.household_id
  CROSS JOIN LATERAL public.registration_forms_progress(r.id) fp
  WHERE r.league_id = v_league AND r.lifecycle <> 'cancelled'
    AND (v_full OR (r.program_id IS NOT NULL AND public.is_commissioner_for(auth.uid(), r.program_id, r.division_id)))
  ORDER BY pr.name, d.display_order NULLS LAST, p.last_name, p.first_name;
END $$;
REVOKE EXECUTE ON FUNCTION public.list_registrations() FROM PUBLIC, anon;

CREATE TABLE public.ledger_period_closes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL DEFAULT public.current_league_id() REFERENCES public.leagues(id) ON DELETE RESTRICT,
  period date NOT NULL,
  snapshot jsonb NOT NULL,
  closed_by uuid,
  closed_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ledger_period_closes_unique UNIQUE (league_id, period)
);
GRANT SELECT ON public.ledger_period_closes TO authenticated;
GRANT ALL ON public.ledger_period_closes TO service_role;
REVOKE ALL ON public.ledger_period_closes FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.ledger_period_closes FROM authenticated;
ALTER TABLE public.ledger_period_closes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Money staff read period closes" ON public.ledger_period_closes FOR SELECT TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND public.has_any_role(auth.uid(), ARRAY['admin','treasurer','board_member']::app_role[]));
CREATE TRIGGER trg_period_close_insert_only BEFORE UPDATE OR DELETE ON public.ledger_period_closes FOR EACH ROW EXECUTE FUNCTION public.block_signature_changes();

CREATE OR REPLACE FUNCTION public.ledger_period_totals(_period date)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  WITH b AS (SELECT date_trunc('month', _period)::date AS s, (date_trunc('month', _period) + interval '1 month')::date AS e),
  pay AS (
    SELECT p.* FROM public.payments p, b WHERE p.league_id = public.current_league_id() AND p.status = 'succeeded'
      AND (p.occurred_at AT TIME ZONE 'America/Chicago') >= b.s AND (p.occurred_at AT TIME ZONE 'America/Chicago') < b.e
  ),
  ex AS (
    SELECT coalesce(sum(public.cart_expected_amount(c.id)), 0) AS expected FROM public.carts c, b
    WHERE c.league_id = public.current_league_id() AND c.locked_total IS NOT NULL AND c.status <> 'cancelled'
      AND (c.locked_at AT TIME ZONE 'America/Chicago') >= b.s AND (c.locked_at AT TIME ZONE 'America/Chicago') < b.e
  ),
  cp AS (
    SELECT coalesce(sum(amount), 0) AS comps FROM public.comps x, b WHERE x.league_id = public.current_league_id()
      AND (x.approved_at AT TIME ZONE 'America/Chicago') >= b.s AND (x.approved_at AT TIME ZONE 'America/Chicago') < b.e
  )
  SELECT jsonb_build_object(
    'period', (SELECT s FROM b),
    'expected', (SELECT expected FROM ex),
    'provider', coalesce((SELECT sum(amount) FROM pay WHERE provider = 'stripe'), 0),
    'offline', coalesce((SELECT sum(amount) FROM pay WHERE provider = 'offline'), 0),
    'bank', NULL,
    'refunds', coalesce((SELECT sum(amount) FROM pay WHERE kind = 'refund'), 0),
    'disputes', coalesce((SELECT sum(amount) FROM pay WHERE kind IN ('dispute','dispute_reversal')), 0),
    'comps', (SELECT comps FROM cp),
    'variance', (SELECT expected FROM ex) - coalesce((SELECT sum(amount) FROM pay), 0)
  )
$$;
REVOKE EXECUTE ON FUNCTION public.ledger_period_totals(date) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.treasurer_report(_months int DEFAULT 6)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_periods jsonb := '[]'::jsonb; v_m date; v_live jsonb; v_close RECORD; v_programs jsonb;
BEGIN
  IF NOT public.has_any_role(auth.uid(), ARRAY['admin','treasurer','board_member']::app_role[]) THEN RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501'; END IF;
  FOR i IN 0 .. greatest(least(_months, 24), 1) - 1 LOOP
    v_m := (date_trunc('month', (now() AT TIME ZONE 'America/Chicago')) - make_interval(months => i))::date;
    v_live := public.ledger_period_totals(v_m);
    v_close := NULL;
    SELECT * INTO v_close FROM public.ledger_period_closes WHERE league_id = public.current_league_id() AND period = v_m;
    v_periods := v_periods || jsonb_build_array(v_live || jsonb_build_object(
      'closed_at', v_close.closed_at, 'snapshot', v_close.snapshot,
      'changed_since_close', v_close.id IS NOT NULL AND (v_close.snapshot - 'period') IS DISTINCT FROM (v_live - 'period')));
  END LOOP;
  SELECT coalesce(jsonb_agg(jsonb_build_object('program', x.program, 'billed', x.billed, 'registrations', x.n) ORDER BY x.program), '[]'::jsonb)
    INTO v_programs
  FROM (
    SELECT pr.name AS program, sum(ci.amount) AS billed, count(DISTINCT r.id) AS n
    FROM public.carts c
    JOIN public.cart_items ci ON ci.cart_id = c.id AND ci.lock_id = c.lock_id
    JOIN public.registrations r ON r.id = ci.registration_id
    JOIN public.programs pr ON pr.id = r.program_id
    WHERE c.league_id = public.current_league_id() AND c.locked_total IS NOT NULL AND c.status <> 'cancelled'
    GROUP BY pr.name
  ) x;
  RETURN jsonb_build_object('periods', v_periods, 'programs', v_programs,
    'bank_note', 'Bank deposits appear once Stripe payouts are connected. No payout events have been recorded yet.',
    'can_close', public.has_any_role(auth.uid(), ARRAY['admin','treasurer']::app_role[]));
END $$;
REVOKE EXECUTE ON FUNCTION public.treasurer_report(int) FROM PUBLIC, anon;

CREATE OR REPLACE FUNCTION public.close_ledger_period(_period date)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_m date := date_trunc('month', _period)::date; v_snap jsonb;
BEGIN
  IF NOT public.has_any_role(auth.uid(), ARRAY['admin','treasurer']::app_role[]) THEN RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501'; END IF;
  IF v_m > date_trunc('month', (now() AT TIME ZONE 'America/Chicago'))::date THEN RAISE EXCEPTION 'You can''t close a future month' USING ERRCODE = 'check_violation'; END IF;
  IF EXISTS (SELECT 1 FROM public.ledger_period_closes WHERE league_id = public.current_league_id() AND period = v_m) THEN
    RAISE EXCEPTION 'That month is already closed' USING ERRCODE = 'check_violation'; END IF;
  v_snap := public.ledger_period_totals(v_m);
  INSERT INTO public.ledger_period_closes (period, snapshot, closed_by) VALUES (v_m, v_snap, auth.uid());
  RETURN v_snap;
END $$;
REVOKE EXECUTE ON FUNCTION public.close_ledger_period(date) FROM PUBLIC, anon;

CREATE OR REPLACE FUNCTION public.my_team_waiver_badges()
RETURNS TABLE (team_id uuid, team_name text, player_id uuid, player_name text, waiver text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT t.id, t.name, p.id, coalesce(p.preferred_name, p.first_name) || ' ' || p.last_name,
    CASE WHEN EXISTS (SELECT 1 FROM public.registrations r WHERE r.player_id = p.id AND r.waiver_status = 'signed'
      AND r.lifecycle <> 'cancelled' AND (t.division_id IS NULL OR r.division_id = t.division_id)) THEN 'signed' ELSE 'pending' END
  FROM public.teams t
  JOIN public.team_rosters tr ON tr.team_id = t.id AND tr.removed_date IS NULL AND coalesce(tr.status, 'active') = 'active'
  JOIN public.players p ON p.id = tr.player_id
  WHERE public.is_coach_of(t.id)
  ORDER BY t.name, p.last_name, p.first_name
$$;
REVOKE EXECUTE ON FUNCTION public.my_team_waiver_badges() FROM PUBLIC, anon;

CREATE OR REPLACE FUNCTION public.my_registration_status()
RETURNS TABLE (registration_id uuid, player_id uuid, program_name text, division_name text, lifecycle text, seat text,
  on_hold_until timestamptz, hold_reason text, forms_signed int, forms_required int, next_form_title text,
  payment text, amount_due numeric, due_on date, reference_code text, pay_by_check boolean, checkout_id uuid)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT r.id, r.player_id, pr.name, coalesce(d.display_label, d.name), r.lifecycle, r.seat, r.on_hold_until, r.hold_reason,
    fp.signed, fp.required, fp.next_title, r.payment,
    CASE WHEN r.checkout_id IS NOT NULL THEN public.cart_amount_due(r.checkout_id) END,
    ex.due_on, ex.reference_code, coalesce(ex.kind = 'offline', false), r.checkout_id
  FROM public.registrations r
  LEFT JOIN public.programs pr ON pr.id = r.program_id
  LEFT JOIN public.divisions d ON d.id = r.division_id
  CROSS JOIN LATERAL public.registration_forms_progress(r.id) fp
  LEFT JOIN LATERAL (SELECT e.due_on, e.reference_code, e.kind FROM public.payment_expectations e
    WHERE e.cart_id = r.checkout_id AND e.cancelled_at IS NULL ORDER BY (e.due_on < current_date), e.due_on LIMIT 1) ex ON true
  WHERE r.lifecycle <> 'cancelled' AND public.is_guardian_of_player(r.player_id)
  ORDER BY r.created_at
$$;
REVOKE EXECUTE ON FUNCTION public.my_registration_status() FROM PUBLIC, anon;

CREATE OR REPLACE FUNCTION public.registration_readiness()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_season RECORD; v_set RECORD; v_league uuid := public.current_league_id(); v_mail text;
BEGIN
  IF NOT public.has_any_role(auth.uid(), ARRAY['admin','board_member','registrar','treasurer']::app_role[]) THEN RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501'; END IF;
  SELECT * INTO v_season FROM public.seasons WHERE league_id = v_league AND is_current ORDER BY starts_on DESC NULLS LAST LIMIT 1;
  SELECT * INTO v_set FROM public.season_settings WHERE season_id = v_season.id;
  v_mail := pg_get_functiondef('public.choose_offline_payment(uuid)'::regprocedure);
  RETURN jsonb_build_object(
    'season', v_season.label,
    'webhook_seen', EXISTS (SELECT 1 FROM public.payments WHERE league_id = v_league AND provider = 'stripe' AND raw IS NOT NULL AND NOT coalesce((raw->>'simulated')::boolean, false)),
    'placeholder_forms', (SELECT coalesce(jsonb_agg(title ORDER BY display_order), '[]'::jsonb) FROM (
        SELECT DISTINCT ON (form_key) title, is_placeholder, display_order FROM public.form_documents
        WHERE league_id = v_league ORDER BY form_key, version DESC) f WHERE f.is_placeholder),
    'cutoff_confirmed', v_season.dates_confirmed_at IS NOT NULL AND v_season.age_cutoff_date IS NOT NULL,
    'grade_ranges_unconfirmed', (SELECT coalesce(jsonb_agg(coalesce(d.display_label, d.name) ORDER BY d.display_order), '[]'::jsonb)
        FROM public.divisions d JOIN public.programs pr ON pr.id = d.program_id
        WHERE pr.season_id = v_season.id AND pr.type IN ('in_house','ihtt') AND d.eligibility_confirmed_at IS NULL),
    'colt_fee_confirmed', coalesce((SELECT bool_and(d.cost_confirmed_at IS NOT NULL) FROM public.divisions d JOIN public.programs pr ON pr.id = d.program_id
        WHERE pr.season_id = v_season.id AND d.name ILIKE '%colt%'), false),
    'clinic_confirmed', coalesce((SELECT bool_and(d.cost_confirmed_at IS NOT NULL) FROM public.divisions d JOIN public.programs pr ON pr.id = d.program_id
        WHERE pr.season_id = v_season.id AND pr.type = 'clinic'), false),
    'fees_confirmed', v_set.confirmed_at IS NOT NULL,
    'mailing_zip_set', v_mail ~ 'Elgin, IL \d{5}'
  );
END $$;
REVOKE EXECUTE ON FUNCTION public.registration_readiness() FROM PUBLIC, anon;