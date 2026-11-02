-- ===== Versioned form wording =====
CREATE TABLE public.form_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL DEFAULT public.current_league_id() REFERENCES public.leagues(id) ON DELETE RESTRICT,
  form_key text NOT NULL CHECK (form_key IN ('medical_consent','liability_release','code_of_conduct','concussion_ack','photo_release')),
  version integer NOT NULL CHECK (version >= 1),
  title text NOT NULL,
  body text NOT NULL,
  kind text NOT NULL DEFAULT 'signature' CHECK (kind IN ('signature','choice')),
  required boolean NOT NULL DEFAULT true,
  requires_resign boolean NOT NULL DEFAULT false,
  is_placeholder boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (league_id, form_key, version)
);
COMMENT ON TABLE public.form_documents IS 'Insert-only versioned wording. A new version is a new row; requires_resign = true makes older signatures stop counting.';
GRANT SELECT ON public.form_documents TO authenticated;
GRANT ALL ON public.form_documents TO service_role;
REVOKE ALL ON public.form_documents FROM anon;
ALTER TABLE public.form_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read form wording" ON public.form_documents FOR SELECT TO authenticated
  USING (league_id = (SELECT public.current_league_id()));

-- ===== Signatures and choices (insert-only) =====
CREATE TABLE public.registration_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL DEFAULT public.current_league_id() REFERENCES public.leagues(id) ON DELETE RESTRICT,
  registration_id uuid NOT NULL REFERENCES public.registrations(id) ON DELETE RESTRICT,
  form_document_id uuid NOT NULL REFERENCES public.form_documents(id) ON DELETE RESTRICT,
  form_key text NOT NULL,
  form_version integer NOT NULL,
  guardian_id uuid NOT NULL REFERENCES public.guardians(id) ON DELETE RESTRICT,
  typed_name text,
  attestation_text text,
  attested boolean NOT NULL DEFAULT false,
  photo_release_consent boolean,
  signed_at timestamptz NOT NULL DEFAULT now(),
  locale text,
  user_agent text,
  ip_address text,
  created_by uuid NOT NULL
);
CREATE INDEX registration_forms_reg_idx ON public.registration_forms (registration_id, form_key, signed_at DESC);
COMMENT ON TABLE public.registration_forms IS 'Insert-only signature log. Corrections are new rows. Written only by sign_registration_form.';
GRANT SELECT ON public.registration_forms TO authenticated;
GRANT ALL ON public.registration_forms TO service_role;
REVOKE ALL ON public.registration_forms FROM anon;
ALTER TABLE public.registration_forms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Guardians read their players' signatures" ON public.registration_forms FOR SELECT TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND EXISTS (
    SELECT 1 FROM public.registrations r WHERE r.id = registration_forms.registration_id AND public.is_guardian_of_player(r.player_id)));
CREATE POLICY "Admin and registrar read signatures" ON public.registration_forms FOR SELECT TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND public.has_any_role(auth.uid(), ARRAY['admin','registrar']::app_role[]));

-- Block updates and deletes for everyone except the service role, belt and braces.
CREATE OR REPLACE FUNCTION public.block_signature_changes()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $$ BEGIN RAISE EXCEPTION 'Signatures are insert-only; add a new row instead' USING ERRCODE = '42501'; END $$;
CREATE TRIGGER trg_registration_forms_insert_only BEFORE UPDATE OR DELETE ON public.registration_forms
  FOR EACH ROW EXECUTE FUNCTION public.block_signature_changes();
CREATE TRIGGER trg_form_documents_insert_only BEFORE UPDATE OR DELETE ON public.form_documents
  FOR EACH ROW EXECUTE FUNCTION public.block_signature_changes();

-- ===== Which version must be signed =====
-- The required version per key is the newest version flagged requires_resign (or version 1).
CREATE OR REPLACE FUNCTION public.form_min_valid_version(_form_key text)
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT coalesce(max(version) FILTER (WHERE requires_resign), 1) FROM public.form_documents
  WHERE league_id = public.current_league_id() AND form_key = _form_key
$$;

CREATE OR REPLACE FUNCTION public.refresh_waiver_status(_registration_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_missing int; v_status text;
BEGIN
  SELECT count(*) INTO v_missing
  FROM (SELECT DISTINCT ON (form_key) form_key, required FROM public.form_documents
        WHERE league_id = public.current_league_id() ORDER BY form_key, version DESC) cur
  WHERE cur.required AND NOT EXISTS (
    SELECT 1 FROM public.registration_forms f
    WHERE f.registration_id = _registration_id AND f.form_key = cur.form_key AND f.attested
      AND f.form_version >= public.form_min_valid_version(cur.form_key));
  v_status := CASE WHEN v_missing = 0 THEN 'signed' ELSE 'pending_guardian' END;
  UPDATE public.registrations SET waiver_status = v_status WHERE id = _registration_id AND waiver_status IS DISTINCT FROM v_status;
  RETURN v_status;
END $$;
REVOKE ALL ON FUNCTION public.refresh_waiver_status(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.form_min_valid_version(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.form_min_valid_version(text) TO authenticated;

-- ===== Family signs (or records the photo choice) =====
CREATE OR REPLACE FUNCTION public.sign_registration_form(
  _registration_id uuid, _form_document_id uuid, _typed_name text, _attested boolean,
  _photo_release_consent boolean DEFAULT NULL, _locale text DEFAULT NULL, _user_agent text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_uid uuid := auth.uid(); v_league uuid := public.current_league_id();
  v_reg RECORD; v_doc RECORD; v_guardian RECORD; v_ip text; v_status text; v_latest int;
  c_attest constant text := 'I am this child''s parent or legal guardian';
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Sign in first' USING ERRCODE = '42501'; END IF;
  SELECT * INTO v_reg FROM public.registrations WHERE id = _registration_id AND league_id = v_league;
  IF v_reg.id IS NULL OR v_reg.lifecycle = 'cancelled' THEN RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501'; END IF;

  -- Only a guardian in a household that manages this player may sign. Viewers (delegates) cannot.
  SELECT g.id, g.first_name, g.last_name INTO v_guardian
  FROM public.guardians g
  JOIN public.guardian_households gh ON gh.guardian_id = g.id
  JOIN public.household_players hp ON hp.household_id = gh.household_id AND hp.player_id = v_reg.player_id AND hp.role = 'manager'
  WHERE g.auth_user_id = v_uid AND g.league_id = v_league LIMIT 1;
  IF v_guardian.id IS NULL THEN
    PERFORM public.refresh_waiver_status(_registration_id);
    RAISE EXCEPTION 'Only a parent or legal guardian in this player''s household can sign' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_doc FROM public.form_documents WHERE id = _form_document_id AND league_id = v_league;
  IF v_doc.id IS NULL THEN RAISE EXCEPTION 'Form not found' USING ERRCODE = 'check_violation'; END IF;
  SELECT max(version) INTO v_latest FROM public.form_documents WHERE league_id = v_league AND form_key = v_doc.form_key;
  IF v_doc.version <> v_latest THEN RAISE EXCEPTION 'This form has a newer version; reload and sign that one' USING ERRCODE = 'check_violation'; END IF;

  IF v_doc.kind = 'signature' THEN
    IF NOT coalesce(_attested, false) THEN RAISE EXCEPTION 'Tick the box to confirm you are the parent or legal guardian' USING ERRCODE = 'check_violation'; END IF;
    IF length(trim(coalesce(_typed_name, ''))) < 3 OR position(' ' in trim(_typed_name)) = 0 THEN
      RAISE EXCEPTION 'Type your full name to sign' USING ERRCODE = 'check_violation'; END IF;
  ELSE
    IF _photo_release_consent IS NULL THEN RAISE EXCEPTION 'Choose yes or no' USING ERRCODE = 'check_violation'; END IF;
  END IF;

  BEGIN
    v_ip := split_part(coalesce(current_setting('request.headers', true)::json->>'x-forwarded-for', ''), ',', 1);
  EXCEPTION WHEN others THEN v_ip := NULL; END;

  INSERT INTO public.registration_forms (league_id, registration_id, form_document_id, form_key, form_version, guardian_id,
    typed_name, attestation_text, attested, photo_release_consent, locale, user_agent, ip_address, created_by)
  VALUES (v_league, _registration_id, v_doc.id, v_doc.form_key, v_doc.version, v_guardian.id,
    CASE WHEN v_doc.kind = 'signature' THEN trim(_typed_name) ELSE nullif(trim(coalesce(_typed_name,'')), '') END,
    c_attest, CASE WHEN v_doc.kind = 'signature' THEN true ELSE coalesce(_attested, false) END,
    CASE WHEN v_doc.kind = 'choice' THEN _photo_release_consent END,
    left(_locale, 20), left(_user_agent, 400), nullif(v_ip, ''), v_uid);

  v_status := public.refresh_waiver_status(_registration_id);
  RETURN jsonb_build_object('waiver_status', v_status);
END $$;
REVOKE ALL ON FUNCTION public.sign_registration_form(uuid, uuid, text, boolean, boolean, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sign_registration_form(uuid, uuid, text, boolean, boolean, text, text) TO authenticated;

-- ===== Admin publishes a new version =====
CREATE OR REPLACE FUNCTION public.publish_form_version(_form_key text, _title text, _body text, _require_resign boolean)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_league uuid := public.current_league_id(); v_prev RECORD; v_id uuid; r RECORD;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') OR NOT public.mfa_satisfied() THEN RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501'; END IF;
  IF coalesce(trim(_body), '') = '' OR coalesce(trim(_title), '') = '' THEN RAISE EXCEPTION 'Title and wording are required' USING ERRCODE = 'check_violation'; END IF;
  SELECT * INTO v_prev FROM public.form_documents WHERE league_id = v_league AND form_key = _form_key ORDER BY version DESC LIMIT 1;
  IF v_prev.id IS NULL THEN RAISE EXCEPTION 'Unknown form' USING ERRCODE = 'check_violation'; END IF;
  INSERT INTO public.form_documents (league_id, form_key, version, title, body, kind, required, requires_resign, is_placeholder, display_order, created_by)
  VALUES (v_league, _form_key, v_prev.version + 1, trim(_title), _body, v_prev.kind, v_prev.required, coalesce(_require_resign, false),
          position('PLACEHOLDER' in upper(_body)) > 0, v_prev.display_order, auth.uid())
  RETURNING id INTO v_id;
  IF coalesce(_require_resign, false) THEN
    FOR r IN SELECT id FROM public.registrations WHERE league_id = v_league AND lifecycle <> 'cancelled' LOOP
      PERFORM public.refresh_waiver_status(r.id);
    END LOOP;
  END IF;
  RETURN v_id;
END $$;
REVOKE ALL ON FUNCTION public.publish_form_version(text, text, text, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.publish_form_version(text, text, text, boolean) TO authenticated;