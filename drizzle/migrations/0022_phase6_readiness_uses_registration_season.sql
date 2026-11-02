CREATE OR REPLACE FUNCTION public.registration_readiness()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_season RECORD; v_set RECORD; v_league uuid := public.current_league_id(); v_mail text;
BEGIN
  IF NOT public.has_any_role(auth.uid(), ARRAY['admin','board_member','registrar','treasurer']::app_role[]) THEN RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501'; END IF;
  SELECT * INTO v_season FROM public.seasons WHERE league_id = v_league AND registration_opens_on IS NOT NULL
    ORDER BY registration_opens_on DESC LIMIT 1;
  SELECT * INTO v_set FROM public.season_settings WHERE season_id = v_season.id;
  v_mail := pg_get_functiondef('public.choose_offline_payment(uuid)'::regprocedure);
  RETURN jsonb_build_object(
    'season', v_season.label,
    'opens_on', v_season.registration_opens_on,
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