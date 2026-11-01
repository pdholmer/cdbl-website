INSERT INTO public.seasons (league_id, year, label, starts_on, ends_on, is_current, age_cutoff_date)
VALUES (public.current_league_id(), '2027', '2027 Season', '2027-04-05', '2027-06-28', false, NULL);
COMMENT ON COLUMN public.seasons.age_cutoff_date IS
  'NULL = PLACEHOLDER. 2027 must match the travel cutoff in Sports Connect. Registration cannot open while NULL.';

INSERT INTO public.programs (league_id, type, name, overview, season_start, season_end, registration_open, season_id)
SELECT p.league_id, p.type, p.name, p.overview, DATE '2027-04-05', DATE '2027-06-28', false,
       (SELECT id FROM public.seasons WHERE year = '2027' AND league_id = public.current_league_id())
FROM public.programs p
WHERE p.id IN ('0a379f62-be88-4f89-87fc-03e621b6e786', '09dbe257-e659-4184-b217-fa9a15707bb5');

CREATE OR REPLACE FUNCTION public.guard_program_registration_open()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.registration_open IS TRUE
     AND (TG_OP = 'INSERT' OR OLD.registration_open IS DISTINCT FROM true) THEN
    IF NEW.season_id IS NULL OR EXISTS (
         SELECT 1 FROM public.seasons s WHERE s.id = NEW.season_id AND s.age_cutoff_date IS NULL) THEN
      RAISE EXCEPTION 'Registration cannot open: the season has no age cutoff date set'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_programs_guard_registration_open
  BEFORE INSERT OR UPDATE OF registration_open, season_id ON public.programs
  FOR EACH ROW EXECUTE FUNCTION public.guard_program_registration_open();

CREATE OR REPLACE FUNCTION public.guard_registration_season_cutoff()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF COALESCE(NEW.source, 'platform') = 'platform' AND EXISTS (
       SELECT 1 FROM public.seasons s WHERE s.id = NEW.season_id AND s.age_cutoff_date IS NULL) THEN
    RAISE EXCEPTION 'Registration is not open: the season has no age cutoff date set'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_registrations_guard_season_cutoff
  BEFORE INSERT ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.guard_registration_season_cutoff();