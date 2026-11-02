-- Phase 1: signed-in families create their own household and add players.

CREATE OR REPLACE FUNCTION public.create_my_household(
  _first_name text, _last_name text, _phone text, _relationship text,
  _address_line1 text, _address_line2 text, _city text, _state text, _zip_code text,
  _d301_attestation text
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_league uuid := public.current_league_id();
  v_email text;
  v_guardian uuid;
  v_household uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Sign in first' USING ERRCODE = '42501'; END IF;
  IF coalesce(trim(_first_name),'') = '' OR coalesce(trim(_last_name),'') = '' THEN
    RAISE EXCEPTION 'First and last name are required' USING ERRCODE = 'check_violation'; END IF;
  IF coalesce(trim(_address_line1),'') = '' OR coalesce(trim(_city),'') = '' OR coalesce(trim(_zip_code),'') = '' THEN
    RAISE EXCEPTION 'Street address, city and ZIP are required' USING ERRCODE = 'check_violation'; END IF;
  IF trim(coalesce(_zip_code,'')) !~ '^[0-9]{5}(-[0-9]{4})?$' THEN
    RAISE EXCEPTION 'ZIP code must be 5 digits' USING ERRCODE = 'check_violation'; END IF;
  IF upper(trim(coalesce(_d301_attestation,''))) <> 'D301' THEN
    RAISE EXCEPTION 'Type D301 to confirm you live in School District 301' USING ERRCODE = 'check_violation'; END IF;

  SELECT email::text INTO v_email FROM auth.users WHERE id = v_uid;

  SELECT g.id INTO v_guardian FROM public.guardians g
   WHERE g.auth_user_id = v_uid AND g.league_id = v_league LIMIT 1;

  IF v_guardian IS NOT NULL AND EXISTS (
       SELECT 1 FROM public.guardian_households gh WHERE gh.guardian_id = v_guardian) THEN
    RAISE EXCEPTION 'You already have a household' USING ERRCODE = 'unique_violation';
  END IF;

  IF v_guardian IS NULL THEN
    INSERT INTO public.guardians (auth_user_id, first_name, last_name, email, phone, relationship, league_id)
    VALUES (v_uid, trim(_first_name), trim(_last_name), v_email, nullif(trim(_phone),''), nullif(trim(_relationship),''), v_league)
    RETURNING id INTO v_guardian;
  ELSE
    UPDATE public.guardians SET first_name = trim(_first_name), last_name = trim(_last_name),
      phone = coalesce(nullif(trim(_phone),''), phone), relationship = coalesce(nullif(trim(_relationship),''), relationship)
    WHERE id = v_guardian;
  END IF;

  INSERT INTO public.households (name, address_line1, address_line2, city, state, zip_code, league_id)
  VALUES (trim(_last_name) || ' household', trim(_address_line1), nullif(trim(_address_line2),''), trim(_city),
          coalesce(nullif(upper(trim(_state)),''),'IL'), trim(_zip_code), v_league)
  RETURNING id INTO v_household;

  INSERT INTO public.guardian_households (guardian_id, household_id, is_primary, receives_comms, league_id)
  VALUES (v_guardian, v_household, true, true, v_league);

  RETURN v_household;
END $$;

CREATE OR REPLACE FUNCTION public.add_my_player(
  _household_id uuid, _first_name text, _last_name text, _date_of_birth date,
  _gender text, _preferred_name text, _school text, _jersey_size text,
  _conditions text, _allergies text, _medications text, _medical_notes text
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_league uuid := public.current_league_id();
  v_g RECORD;
  v_player uuid := gen_random_uuid();
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Sign in first' USING ERRCODE = '42501'; END IF;
  IF NOT public.is_guardian_of_household(_household_id) OR NOT EXISTS (
       SELECT 1 FROM public.households h WHERE h.id = _household_id AND h.league_id = v_league) THEN
    RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501'; END IF;
  IF coalesce(trim(_first_name),'') = '' OR coalesce(trim(_last_name),'') = '' THEN
    RAISE EXCEPTION 'Player first and last name are required' USING ERRCODE = 'check_violation'; END IF;
  IF _date_of_birth IS NULL OR _date_of_birth > current_date OR _date_of_birth < current_date - interval '20 years' THEN
    RAISE EXCEPTION 'Enter a valid date of birth' USING ERRCODE = 'check_violation'; END IF;
  IF _gender IS NOT NULL AND _gender NOT IN ('male','female','other','prefer_not_to_say') THEN
    RAISE EXCEPTION 'Invalid gender value' USING ERRCODE = 'check_violation'; END IF;

  SELECT g.first_name, g.last_name, g.email, g.phone, g.relationship INTO v_g
    FROM public.guardians g WHERE g.auth_user_id = v_uid AND g.league_id = v_league LIMIT 1;

  -- Legacy parent_* columns are NOT NULL; filled from the guardian record (deprecated copies).
  INSERT INTO public.players (id, first_name, last_name, date_of_birth, gender, preferred_name, school, jersey_size,
    parent_first_name, parent_last_name, parent_guardian_name, parent_email, parent_phone, parent_relationship, created_by)
  VALUES (v_player, trim(_first_name), trim(_last_name), _date_of_birth, _gender, nullif(trim(_preferred_name),''),
    nullif(trim(_school),''), nullif(trim(_jersey_size),''),
    coalesce(v_g.first_name,''), coalesce(v_g.last_name,''), trim(coalesce(v_g.first_name,'') || ' ' || coalesce(v_g.last_name,'')),
    coalesce(v_g.email,''), coalesce(v_g.phone,''), v_g.relationship, v_uid);

  INSERT INTO public.league_players (league_id, player_id, status) VALUES (v_league, v_player, 'active');

  INSERT INTO public.household_players (household_id, player_id, role, can_edit_medical, league_id)
  VALUES (_household_id, v_player, 'manager', true, v_league);

  IF coalesce(nullif(trim(_conditions),''), nullif(trim(_allergies),''), nullif(trim(_medications),''), nullif(trim(_medical_notes),'')) IS NOT NULL THEN
    INSERT INTO public.player_medical (player_id, conditions, allergies, medications, notes, updated_by, league_id)
    VALUES (v_player, nullif(trim(_conditions),''), nullif(trim(_allergies),''), nullif(trim(_medications),''),
            nullif(trim(_medical_notes),''), v_uid, v_league);
  END IF;

  RETURN v_player;
END $$;

REVOKE ALL ON FUNCTION public.create_my_household(text,text,text,text,text,text,text,text,text,text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.add_my_player(uuid,text,text,date,text,text,text,text,text,text,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_my_household(text,text,text,text,text,text,text,text,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_my_player(uuid,text,text,date,text,text,text,text,text,text,text,text) TO authenticated;

-- Family write policy on player_medical: insert for their own players only.
CREATE POLICY "Guardians insert medical for their players"
ON public.player_medical FOR INSERT TO authenticated
WITH CHECK (league_id = (SELECT public.current_league_id()) AND public.is_guardian_of_player(player_id));

-- Anonymous gets nothing on family, player or old submission tables.
REVOKE ALL ON public.registration_submissions FROM anon;
REVOKE ALL ON public.households, public.guardians, public.guardian_households,
  public.household_players, public.player_medical, public.players FROM anon;
COMMENT ON TABLE public.registration_submissions IS 'DEPRECATED: old public registration path; no new writes. Replaced by signed-in registrations flow.';