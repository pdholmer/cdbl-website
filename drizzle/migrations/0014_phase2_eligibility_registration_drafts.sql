-- ===== A. D301 attestation saved on the household =====
ALTER TABLE public.households
  ADD COLUMN d301_attested_at timestamptz,
  ADD COLUMN d301_attested_by uuid REFERENCES public.guardians(id) ON DELETE SET NULL,
  ADD COLUMN d301_attestation_text text;

-- ===== B. Eligibility fields on divisions; season dates =====
ALTER TABLE public.divisions
  ADD COLUMN eligibility_mode text NOT NULL DEFAULT 'dob',
  ADD COLUMN min_grade integer,
  ADD COLUMN max_grade integer,
  ADD COLUMN min_age integer,
  ADD COLUMN max_age integer,
  ADD COLUMN display_label text,
  ADD COLUMN description text,
  ADD COLUMN typical_ages text,
  ADD COLUMN eligibility_confirmed_at timestamptz,
  ADD COLUMN cost_confirmed_at timestamptz;
ALTER TABLE public.divisions ADD CONSTRAINT divisions_eligibility_mode_check
  CHECK (eligibility_mode IN ('dob','grade','either'));
ALTER TABLE public.divisions ADD CONSTRAINT divisions_grade_range_check
  CHECK ((min_grade IS NULL OR min_grade BETWEEN -1 AND 12) AND (max_grade IS NULL OR max_grade BETWEEN -1 AND 12)
         AND (min_grade IS NULL OR max_grade IS NULL OR min_grade <= max_grade));
ALTER TABLE public.divisions ADD CONSTRAINT divisions_age_range_check
  CHECK (min_age IS NULL OR max_age IS NULL OR min_age <= max_age);
COMMENT ON COLUMN public.divisions.min_grade IS 'School grade, kindergarten = 0, pre-K = -1. Admin-editable.';
COMMENT ON COLUMN public.divisions.min_age IS 'League age (age on the season age_cutoff_date). Birth-date bands are derived at read time.';
COMMENT ON COLUMN public.divisions.eligibility_confirmed_at IS 'NULL = working value, registrar to confirm.';

ALTER TABLE public.seasons
  ADD COLUMN dates_confirmed_at timestamptz,
  ADD COLUMN registration_opens_on date,
  ADD COLUMN registration_closes_on date,
  ADD COLUMN late_registration_until date,
  ADD COLUMN registration_test_mode boolean NOT NULL DEFAULT false;
COMMENT ON COLUMN public.seasons.dates_confirmed_at IS 'NULL = cutoff and school-year start are working values, confirm.';
COMMENT ON COLUMN public.seasons.registration_test_mode IS 'When true, families can start draft registrations before the open date (preview testing).';

-- Working values (backfill of the new columns; admin-editable, unconfirmed)
UPDATE public.divisions d SET eligibility_mode = v.mode, min_grade = v.g1, max_grade = v.g2, min_age = v.a1, max_age = v.a2,
  typical_ages = v.ta, display_label = v.lbl, description = v.descr
FROM (VALUES
  ('T-Ball','dob',-1,0,4,6,'Ages 4 to 6','T-Ball','Placed by age. For pre-K and kindergarten players learning the game off a tee.'),
  ('Pinto','grade',1,2,7,8,'Usually ages 7 to 8','Pinto','Placed by school grade: 1st and 2nd grade. Coach pitch.'),
  ('Mustang','grade',3,4,9,10,'Usually ages 9 to 10','Mustang','Placed by school grade: 3rd and 4th grade.'),
  ('Bronco','grade',5,6,11,12,'Usually ages 11 to 12','Bronco','Placed by school grade: 5th and 6th grade.'),
  ('Pony','grade',7,8,13,14,'Usually ages 13 to 14','Pony','Placed by school grade: 7th and 8th grade.'),
  ('Colt','dob',9,12,15,19,'Ages 15 and up','Colt','Placed by age: 15 and up, high school players.')
) AS v(name,mode,g1,g2,a1,a2,ta,lbl,descr)
JOIN public.programs p ON p.type = 'in_house'
JOIN public.seasons s ON s.id = p.season_id AND s.year = '2027'
WHERE d.program_id = p.id AND d.name = v.name;

UPDATE public.divisions d SET eligibility_mode = 'dob',
  min_age = CASE WHEN n = 8 THEN 6 ELSE n END, max_age = n,
  typical_ages = n || ' and under', display_label = d.name,
  description = 'Placed by age: league age ' || n || (CASE WHEN n = 8 THEN ' and under.' ELSE '.' END)
FROM (SELECT d2.id, substring(d2.name from '^(\d+)U')::int AS n FROM public.divisions d2) x
JOIN public.programs p ON p.type IN ('ihtt','travel')
JOIN public.seasons s ON s.id = p.season_id AND s.year = '2027'
WHERE d.id = x.id AND d.program_id = p.id AND x.n IS NOT NULL;

-- ===== C. Registration kinds: add clinic =====
ALTER TABLE public.registrations DROP CONSTRAINT registrations_kind_check;
ALTER TABLE public.registrations ADD CONSTRAINT registrations_kind_check
  CHECK (kind IN ('division','tryout','ihtt','clinic'));
ALTER TABLE public.registrations ADD CONSTRAINT registrations_grade_check
  CHECK (grade_at_registration IS NULL OR grade_at_registration BETWEEN -1 AND 12);

-- ===== Placement review items =====
CREATE TABLE public.placement_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL DEFAULT public.current_league_id() REFERENCES public.leagues(id) ON DELETE RESTRICT,
  registration_id uuid NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  season_id uuid NOT NULL REFERENCES public.seasons(id),
  program_id uuid NOT NULL REFERENCES public.programs(id),
  league_age integer,
  grade integer,
  grade_division_id uuid REFERENCES public.divisions(id),
  age_division_id uuid REFERENCES public.divisions(id),
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved')),
  resolution_division_id uuid REFERENCES public.divisions(id),
  resolved_by uuid,
  resolved_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX placement_reviews_one_open ON public.placement_reviews (registration_id) WHERE status = 'open';
GRANT SELECT, UPDATE ON public.placement_reviews TO authenticated;
GRANT ALL ON public.placement_reviews TO service_role;
REVOKE ALL ON public.placement_reviews FROM anon;
ALTER TABLE public.placement_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Registrar and admin read placement reviews" ON public.placement_reviews FOR SELECT TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND public.has_any_role(auth.uid(), ARRAY['admin','registrar']::app_role[]));
CREATE POLICY "Registrar and admin resolve placement reviews" ON public.placement_reviews FOR UPDATE TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND public.has_any_role(auth.uid(), ARRAY['admin','registrar']::app_role[]))
  WITH CHECK (league_id = (SELECT public.current_league_id()) AND public.has_any_role(auth.uid(), ARRAY['admin','registrar']::app_role[]));
CREATE POLICY "Guardians see review items for their players" ON public.placement_reviews FOR SELECT TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND public.is_guardian_of_player(player_id));

-- ===== Eligibility engine =====
CREATE OR REPLACE FUNCTION public.division_eligibility(_program_id uuid, _dob date, _grade integer)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_cutoff date; v_age int; gd RECORD; ad RECORD; rec_id uuid; v_conflict boolean := false; v_reason text := null;
  v_has_grade boolean; v_has_age boolean;
BEGIN
  SELECT s.age_cutoff_date INTO v_cutoff FROM public.programs p JOIN public.seasons s ON s.id = p.season_id WHERE p.id = _program_id;
  IF v_cutoff IS NULL THEN
    RETURN jsonb_build_object('error','The season has no age cutoff date yet');
  END IF;
  IF _dob IS NOT NULL THEN v_age := date_part('year', age(v_cutoff, _dob))::int; END IF;

  SELECT bool_or(min_grade IS NOT NULL), bool_or(min_age IS NOT NULL) INTO v_has_grade, v_has_age
    FROM public.divisions WHERE program_id = _program_id AND cost IS NOT NULL;

  IF _grade IS NOT NULL THEN
    SELECT id, eligibility_mode INTO gd FROM public.divisions
     WHERE program_id = _program_id AND cost IS NOT NULL AND _grade BETWEEN min_grade AND max_grade
     ORDER BY display_order, min_grade LIMIT 1;
  END IF;
  IF v_age IS NOT NULL THEN
    SELECT id, eligibility_mode INTO ad FROM public.divisions
     WHERE program_id = _program_id AND cost IS NOT NULL AND v_age BETWEEN min_age AND max_age
     ORDER BY display_order, min_age LIMIT 1;
  END IF;

  IF gd.id IS NOT NULL AND ad.id IS NOT NULL THEN
    IF gd.id = ad.id THEN rec_id := gd.id;
    ELSE
      v_conflict := true; v_reason := 'grade_and_age_disagree';
      rec_id := CASE WHEN gd.eligibility_mode IN ('grade','either') THEN gd.id ELSE ad.id END;
    END IF;
  ELSIF gd.id IS NOT NULL THEN
    rec_id := gd.id;
    IF v_has_age AND v_age IS NOT NULL THEN v_conflict := true; v_reason := 'age_outside_ranges'; END IF;
  ELSIF ad.id IS NOT NULL THEN
    rec_id := ad.id;
    IF v_has_grade AND _grade IS NOT NULL THEN v_conflict := true; v_reason := 'grade_outside_ranges'; END IF;
  END IF;

  -- Never empty: fall back to the nearest division by age, then by grade, then the first open one.
  IF rec_id IS NULL THEN
    v_conflict := true; v_reason := coalesce(v_reason, 'no_exact_match');
    SELECT id INTO rec_id FROM public.divisions
     WHERE program_id = _program_id AND cost IS NOT NULL
     ORDER BY
       CASE WHEN v_age IS NOT NULL AND min_age IS NOT NULL THEN LEAST(abs(v_age - min_age), abs(v_age - max_age)) END NULLS LAST,
       CASE WHEN _grade IS NOT NULL AND min_grade IS NOT NULL THEN LEAST(abs(_grade - min_grade), abs(_grade - max_grade)) END NULLS LAST,
       display_order
     LIMIT 1;
  END IF;

  RETURN jsonb_build_object(
    'league_age', v_age, 'grade', _grade, 'cutoff', v_cutoff,
    'recommended_division_id', rec_id,
    'grade_division_id', gd.id, 'age_division_id', ad.id,
    'conflict', v_conflict, 'reason', v_reason);
END $$;
REVOKE ALL ON FUNCTION public.division_eligibility(uuid, date, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.division_eligibility(uuid, date, integer) TO authenticated;

-- ===== Season validation gate =====
CREATE OR REPLACE FUNCTION public.program_open_issues(_program_id uuid)
RETURNS SETOF text LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_type program_type; v_season RECORD; r RECORD; prev_max int := null; first boolean := true;
BEGIN
  SELECT p.type INTO v_type FROM public.programs p WHERE p.id = _program_id;
  SELECT s.* INTO v_season FROM public.programs p JOIN public.seasons s ON s.id = p.season_id WHERE p.id = _program_id;
  IF v_season.id IS NULL THEN RETURN NEXT 'The program has no season'; RETURN; END IF;
  IF v_season.age_cutoff_date IS NULL THEN RETURN NEXT 'The season has no age cutoff date'; END IF;
  IF v_season.school_year_start IS NULL THEN RETURN NEXT 'The season has no school-year start date'; END IF;
  FOR r IN SELECT name, cost, min_grade, max_grade, min_age FROM public.divisions
            WHERE program_id = _program_id AND cost IS NOT NULL ORDER BY min_grade NULLS LAST, display_order LOOP
    IF r.cost <= 0 THEN RETURN NEXT r.name || ' has no fee above zero'; END IF;
    IF r.min_grade IS NULL AND r.min_age IS NULL THEN RETURN NEXT r.name || ' has no grade or age range'; END IF;
    IF v_type = 'in_house' THEN
      IF r.min_grade IS NULL THEN RETURN NEXT r.name || ' has no grade range';
      ELSIF NOT first AND r.min_grade <= prev_max THEN RETURN NEXT r.name || ' overlaps the grade range of the division before it';
      ELSIF NOT first AND r.min_grade > prev_max + 1 THEN RETURN NEXT 'Grade gap before ' || r.name;
      END IF;
      IF r.max_grade IS NOT NULL THEN prev_max := r.max_grade; first := false; END IF;
    END IF;
  END LOOP;
  IF NOT EXISTS (SELECT 1 FROM public.divisions WHERE program_id = _program_id AND cost IS NOT NULL) THEN
    RETURN NEXT 'The program has no division with a fee';
  END IF;
END $$;
REVOKE ALL ON FUNCTION public.program_open_issues(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.program_open_issues(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.guard_program_registration_open()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $$
DECLARE v_issues text;
BEGIN
  IF NEW.registration_open IS TRUE AND (TG_OP = 'INSERT' OR OLD.registration_open IS DISTINCT FROM true) THEN
    IF NEW.season_id IS NULL OR EXISTS (
         SELECT 1 FROM public.seasons s WHERE s.id = NEW.season_id AND s.age_cutoff_date IS NULL) THEN
      RAISE EXCEPTION 'Registration cannot open: the season has no age cutoff date set' USING ERRCODE = 'check_violation';
    END IF;
    IF TG_OP = 'UPDATE' THEN
      SELECT string_agg(i, '; ') INTO v_issues FROM public.program_open_issues(NEW.id) i;
      IF v_issues IS NOT NULL THEN
        RAISE EXCEPTION 'Registration cannot open: %', v_issues USING ERRCODE = 'check_violation';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END $$;

-- ===== Season cutoff lock with impact report =====
CREATE OR REPLACE FUNCTION public.season_date_change_impact(_season_id uuid, _new_cutoff date)
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT count(*)::int FROM public.registrations r
  JOIN public.players p ON p.id = r.player_id
  JOIN public.seasons s ON s.id = r.season_id
  JOIN public.divisions d ON d.id = r.division_id
  WHERE r.season_id = _season_id AND r.lifecycle <> 'cancelled' AND d.min_age IS NOT NULL
    AND public.has_any_role(auth.uid(), ARRAY['admin','registrar']::app_role[])
    AND ( (date_part('year', age(_new_cutoff, p.date_of_birth))::int BETWEEN d.min_age AND d.max_age)
       <> (date_part('year', age(s.age_cutoff_date, p.date_of_birth))::int BETWEEN d.min_age AND d.max_age) )
$$;
REVOKE ALL ON FUNCTION public.season_date_change_impact(uuid, date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.season_date_change_impact(uuid, date) TO authenticated;

CREATE OR REPLACE FUNCTION public.guard_season_date_change()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $$
DECLARE n int;
BEGIN
  IF (NEW.age_cutoff_date IS DISTINCT FROM OLD.age_cutoff_date OR NEW.school_year_start IS DISTINCT FROM OLD.school_year_start)
     AND EXISTS (SELECT 1 FROM public.registrations r WHERE r.season_id = NEW.id AND r.lifecycle <> 'cancelled')
     AND coalesce(current_setting('cdbl.season_change_ack', true), '') <> 'yes' THEN
    SELECT count(*) INTO n FROM public.registrations r WHERE r.season_id = NEW.id AND r.lifecycle <> 'cancelled';
    RAISE EXCEPTION 'This season has % registrations. Use the change-dates step, which shows how many players would move.', n
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_seasons_guard_date_change BEFORE UPDATE ON public.seasons
  FOR EACH ROW EXECUTE FUNCTION public.guard_season_date_change();

CREATE OR REPLACE FUNCTION public.change_season_dates(_season_id uuid, _cutoff date, _school_year_start date, _acknowledged_moves integer)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE n int;
BEGIN
  IF NOT public.has_any_role(auth.uid(), ARRAY['admin','registrar']::app_role[]) OR NOT public.mfa_satisfied() THEN
    RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501'; END IF;
  n := public.season_date_change_impact(_season_id, _cutoff);
  IF n <> coalesce(_acknowledged_moves, -1) THEN
    RAISE EXCEPTION 'This change re-buckets % players. Review and confirm that number.', n USING ERRCODE = 'check_violation';
  END IF;
  PERFORM set_config('cdbl.season_change_ack', 'yes', true);
  UPDATE public.seasons SET age_cutoff_date = _cutoff, school_year_start = _school_year_start
   WHERE id = _season_id AND league_id = public.current_league_id();
  PERFORM set_config('cdbl.season_change_ack', '', true);
  RETURN n;
END $$;
REVOKE ALL ON FUNCTION public.change_season_dates(uuid, date, date, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.change_season_dates(uuid, date, date, integer) TO authenticated;

-- ===== Family starts a draft registration =====
CREATE OR REPLACE FUNCTION public.start_my_registration(_player_id uuid, _program_id uuid, _grade integer, _choice text DEFAULT 'recommended')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_uid uuid := auth.uid(); v_league uuid := public.current_league_id();
  v_prog RECORD; v_season RECORD; v_dob date; v_first text; v_elig jsonb; v_div uuid; v_kind text;
  v_existing RECORD; v_inhouse RECORD; v_checkout uuid; v_reg uuid; v_review boolean := false;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Sign in first' USING ERRCODE = '42501'; END IF;
  IF NOT public.is_guardian_of_player(_player_id) THEN RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501'; END IF;
  IF _choice NOT IN ('recommended','grade','age','review') THEN RAISE EXCEPTION 'Unknown choice' USING ERRCODE = 'check_violation'; END IF;
  IF _grade IS NOT NULL AND (_grade < -1 OR _grade > 12) THEN RAISE EXCEPTION 'Choose a school grade' USING ERRCODE = 'check_violation'; END IF;

  SELECT * INTO v_prog FROM public.programs WHERE id = _program_id AND league_id = v_league;
  IF v_prog.id IS NULL OR v_prog.type NOT IN ('in_house','ihtt','clinic') THEN
    RAISE EXCEPTION 'Families can register here for In-House, IHTT or a clinic only' USING ERRCODE = 'check_violation'; END IF;
  SELECT * INTO v_season FROM public.seasons WHERE id = v_prog.season_id;
  IF NOT v_season.registration_test_mode AND NOT (
       v_prog.registration_open AND v_season.registration_opens_on IS NOT NULL AND current_date >= v_season.registration_opens_on
       AND current_date <= coalesce(v_season.late_registration_until, v_season.registration_closes_on)) THEN
    RAISE EXCEPTION 'Registration opens %', coalesce(to_char(v_season.registration_opens_on, 'FMMonth FMDD, YYYY'), 'soon')
      USING ERRCODE = 'check_violation'; END IF;

  SELECT date_of_birth, coalesce(preferred_name, first_name) INTO v_dob, v_first FROM public.players WHERE id = _player_id;
  v_kind := CASE v_prog.type WHEN 'ihtt' THEN 'ihtt' WHEN 'clinic' THEN 'clinic' ELSE 'division' END;

  IF v_kind = 'ihtt' THEN
    SELECT r.* INTO v_inhouse FROM public.registrations r JOIN public.programs p ON p.id = r.program_id AND p.type = 'in_house'
     WHERE r.player_id = _player_id AND r.season_id = v_season.id AND r.league_id = v_league AND r.lifecycle <> 'cancelled' AND r.kind = 'division'
     LIMIT 1;
    IF v_inhouse.id IS NULL THEN
      RAISE EXCEPTION 'IHTT is an add-on to In-House. Register % for In-House first.', v_first USING ERRCODE = 'check_violation'; END IF;
    v_checkout := coalesce(v_inhouse.checkout_id, gen_random_uuid());
    IF v_inhouse.checkout_id IS NULL THEN UPDATE public.registrations SET checkout_id = v_checkout WHERE id = v_inhouse.id; END IF;
  END IF;

  v_elig := public.division_eligibility(_program_id, v_dob, _grade);
  IF v_elig ? 'error' THEN RAISE EXCEPTION '%', v_elig->>'error' USING ERRCODE = 'check_violation'; END IF;
  v_div := CASE _choice
    WHEN 'grade' THEN coalesce((v_elig->>'grade_division_id')::uuid, (v_elig->>'recommended_division_id')::uuid)
    WHEN 'age' THEN coalesce((v_elig->>'age_division_id')::uuid, (v_elig->>'recommended_division_id')::uuid)
    ELSE (v_elig->>'recommended_division_id')::uuid END;
  v_review := _choice = 'review';

  SELECT * INTO v_existing FROM public.registrations
   WHERE league_id = v_league AND player_id = _player_id AND season_id = v_season.id AND kind = v_kind;
  IF v_existing.id IS NOT NULL AND v_existing.lifecycle <> 'draft' THEN
    RAISE EXCEPTION '% already has a % registration this season', v_first, v_prog.name USING ERRCODE = 'unique_violation'; END IF;

  IF v_existing.id IS NULL THEN
    INSERT INTO public.registrations (league_id, player_id, season_id, program_id, division_id, kind, grade_at_registration,
      baseball_age, source, lifecycle, seat, payment, offer, submitted_at, checkout_id, hold_reason)
    VALUES (v_league, _player_id, v_season.id, _program_id, v_div, v_kind, _grade, (v_elig->>'league_age')::int,
      'platform', 'draft', 'none', 'unpaid', 'na', NULL, v_checkout, CASE WHEN v_review THEN 'placement_review' END)
    RETURNING id INTO v_reg;
  ELSE
    UPDATE public.registrations SET program_id = _program_id, division_id = v_div, grade_at_registration = _grade,
      baseball_age = (v_elig->>'league_age')::int, checkout_id = coalesce(v_checkout, checkout_id),
      hold_reason = CASE WHEN v_review THEN 'placement_review' ELSE NULL END
     WHERE id = v_existing.id RETURNING id INTO v_reg;
  END IF;

  IF v_review THEN
    INSERT INTO public.placement_reviews (league_id, registration_id, player_id, season_id, program_id, league_age, grade,
      grade_division_id, age_division_id, reason, created_by)
    VALUES (v_league, v_reg, _player_id, v_season.id, _program_id, (v_elig->>'league_age')::int, _grade,
      (v_elig->>'grade_division_id')::uuid, (v_elig->>'age_division_id')::uuid, coalesce(v_elig->>'reason','family_asked'), v_uid)
    ON CONFLICT (registration_id) WHERE status = 'open' DO NOTHING;
  END IF;

  IF v_season.locked_at IS NULL THEN UPDATE public.seasons SET locked_at = now() WHERE id = v_season.id; END IF;

  RETURN v_elig || jsonb_build_object('registration_id', v_reg, 'division_id', v_div, 'review_requested', v_review);
END $$;
REVOKE ALL ON FUNCTION public.start_my_registration(uuid, uuid, integer, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.start_my_registration(uuid, uuid, integer, text) TO authenticated;

-- ===== A (cont.). Household setup now saves the attestation =====
CREATE OR REPLACE FUNCTION public.create_my_household(
  _first_name text, _last_name text, _phone text, _relationship text,
  _address_line1 text, _address_line2 text, _city text, _state text, _zip_code text,
  _d301_attestation text
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_uid uuid := auth.uid(); v_league uuid := public.current_league_id();
  v_email text; v_guardian uuid; v_household uuid;
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
  SELECT g.id INTO v_guardian FROM public.guardians g WHERE g.auth_user_id = v_uid AND g.league_id = v_league LIMIT 1;
  IF v_guardian IS NOT NULL AND EXISTS (SELECT 1 FROM public.guardian_households gh WHERE gh.guardian_id = v_guardian) THEN
    RAISE EXCEPTION 'You already have a household' USING ERRCODE = 'unique_violation'; END IF;

  IF v_guardian IS NULL THEN
    INSERT INTO public.guardians (auth_user_id, first_name, last_name, email, phone, relationship, league_id)
    VALUES (v_uid, trim(_first_name), trim(_last_name), v_email, nullif(trim(_phone),''), nullif(trim(_relationship),''), v_league)
    RETURNING id INTO v_guardian;
  ELSE
    UPDATE public.guardians SET first_name = trim(_first_name), last_name = trim(_last_name),
      phone = coalesce(nullif(trim(_phone),''), phone), relationship = coalesce(nullif(trim(_relationship),''), relationship)
    WHERE id = v_guardian;
  END IF;

  INSERT INTO public.households (name, address_line1, address_line2, city, state, zip_code, league_id,
    d301_attested_at, d301_attested_by, d301_attestation_text)
  VALUES (trim(_last_name) || ' household', trim(_address_line1), nullif(trim(_address_line2),''), trim(_city),
          coalesce(nullif(upper(trim(_state)),''),'IL'), trim(_zip_code), v_league, now(), v_guardian, trim(_d301_attestation))
  RETURNING id INTO v_household;

  INSERT INTO public.guardian_households (guardian_id, household_id, is_primary, receives_comms, league_id)
  VALUES (v_guardian, v_household, true, true, v_league);
  RETURN v_household;
END $$;

-- ===== D. Split households =====
CREATE OR REPLACE FUNCTION public.can_see_household_contact(_household_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT public.is_guardian_of_household(_household_id) OR EXISTS (
    SELECT 1 FROM public.household_players theirs
    JOIN public.household_players mine ON mine.player_id = theirs.player_id AND mine.household_id <> theirs.household_id
    WHERE theirs.household_id = _household_id AND theirs.shares_contact = true
      AND public.is_guardian_of_household(mine.household_id))
$$;
CREATE OR REPLACE FUNCTION public.can_see_player_medical_as_guardian(_player_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.household_players hp
    WHERE hp.player_id = _player_id AND hp.can_edit_medical = true AND public.is_guardian_of_household(hp.household_id))
$$;
REVOKE ALL ON FUNCTION public.can_see_household_contact(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.can_see_player_medical_as_guardian(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_see_household_contact(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_see_player_medical_as_guardian(uuid) TO authenticated;

CREATE POLICY "Linked households see shared contact" ON public.households FOR SELECT TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND public.can_see_household_contact(id));
CREATE POLICY "Linked households see shared guardian contact" ON public.guardians FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.guardian_households gh WHERE gh.guardian_id = guardians.id
                 AND public.can_see_household_contact(gh.household_id)));

DROP POLICY "Guardians view medical for their players" ON public.player_medical;
CREATE POLICY "Guardians view medical for their players" ON public.player_medical FOR SELECT TO authenticated
  USING (public.can_see_player_medical_as_guardian(player_id));
DROP POLICY "Guardians insert medical for their players" ON public.player_medical;
CREATE POLICY "Guardians insert medical for their players" ON public.player_medical FOR INSERT TO authenticated
  WITH CHECK (league_id = (SELECT public.current_league_id()) AND public.can_see_player_medical_as_guardian(player_id));