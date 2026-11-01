ALTER TABLE public.leagues ADD COLUMN ihtt_includes_in_house boolean NOT NULL DEFAULT false;
COMMENT ON COLUMN public.leagues.ihtt_includes_in_house IS
  'PLACEHOLDER pending board. true = in-house fee waived for IHTT players; false = family pays both.';

ALTER TABLE public.divisions ADD COLUMN capacity integer NULL CHECK (capacity IS NULL OR capacity >= 0);
ALTER TABLE public.divisions ADD COLUMN waitlist_enabled boolean NOT NULL DEFAULT true;

ALTER TABLE public.registrations ADD COLUMN checkout_id uuid NULL;
CREATE INDEX registrations_checkout_idx ON public.registrations (checkout_id) WHERE checkout_id IS NOT NULL;

INSERT INTO public.programs (league_id, type, name, overview, season_start, season_end, registration_open, season_id)
VALUES (public.current_league_id(), 'ihtt', 'CDBL In-House Travel Team (IHTT)', NULL,
        '2027-04-05', '2027-06-28', false,
        (SELECT id FROM public.seasons WHERE year='2027' AND league_id = public.current_league_id()));

INSERT INTO public.divisions (league_id, program_id, name, age_range, cost, display_order)
SELECT d.league_id,
       (SELECT id FROM public.programs WHERE type='ihtt' AND season_id =
          (SELECT id FROM public.seasons WHERE year='2027' AND league_id = public.current_league_id())),
       replace(d.name, 'Travel', 'IHTT'), d.age_range, v.fee, d.display_order
FROM public.divisions d
JOIN (VALUES ('8U Travel',1500::numeric),('9U Travel',1625),('10U Travel',1750),('11U Travel',1875),
             ('12U Travel',2000),('13U Travel',2125),('14U Travel',2250)) v(name, fee) ON v.name = d.name
WHERE d.program_id = '09dbe257-e659-4184-b217-fa9a15707bb5';

INSERT INTO public.divisions (league_id, program_id, name, age_range, cost, season_length, features,
                              schedule_notes, display_order, default_min_roster_size, default_max_roster_size)
SELECT d.league_id,
       (SELECT id FROM public.programs WHERE type='in_house' AND season_id=(SELECT id FROM public.seasons WHERE year='2027' AND league_id = public.current_league_id())),
       d.name, d.age_range, v.fee, d.season_length, d.features, d.schedule_notes, d.display_order,
       d.default_min_roster_size, d.default_max_roster_size
FROM public.divisions d
JOIN (VALUES ('T-Ball',195::numeric),('Pinto',250),('Mustang',275),('Bronco',290),('Pony',335),('Colt',NULL))
     v(name, fee) ON v.name = d.name
WHERE d.program_id = '0a379f62-be88-4f89-87fc-03e621b6e786';

INSERT INTO public.divisions (league_id, program_id, name, age_range, cost, season_length, features,
                              schedule_notes, display_order, default_min_roster_size, default_max_roster_size)
SELECT d.league_id,
       (SELECT id FROM public.programs WHERE type='travel' AND season_id=(SELECT id FROM public.seasons WHERE year='2027' AND league_id = public.current_league_id())),
       d.name, d.age_range, CASE WHEN d.name='15U Travel' THEN NULL ELSE d.cost END,
       d.season_length, d.features, d.schedule_notes, d.display_order,
       d.default_min_roster_size, d.default_max_roster_size
FROM public.divisions d
WHERE d.program_id = '09dbe257-e659-4184-b217-fa9a15707bb5';

CREATE OR REPLACE FUNCTION public.guard_registration_division_fee()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.division_id IS NOT NULL AND COALESCE(NEW.source,'platform') = 'platform'
     AND EXISTS (SELECT 1 FROM public.divisions WHERE id = NEW.division_id AND cost IS NULL) THEN
    RAISE EXCEPTION 'This division is not open for registration yet (no fee set)' USING ERRCODE='check_violation';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_registrations_guard_division_fee
  BEFORE INSERT ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.guard_registration_division_fee();

CREATE OR REPLACE FUNCTION public.guard_ihtt_requires_in_house()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.programs WHERE id = NEW.program_id AND type = 'ihtt') THEN
    RETURN NEW;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.registrations r
    JOIN public.programs p ON p.id = r.program_id AND p.type = 'in_house'
    WHERE r.player_id = NEW.player_id AND r.season_id = NEW.season_id
      AND r.league_id = NEW.league_id AND r.lifecycle <> 'cancelled'
      AND ( (NEW.checkout_id IS NOT NULL AND r.checkout_id = NEW.checkout_id)
            OR r.payment IN ('paid','waived') )
  ) THEN
    RAISE EXCEPTION 'IHTT registration needs an in-house registration for the same player and season in the same checkout'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.guard_ihtt_requires_in_house() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER trg_registrations_ihtt_requires_in_house
  BEFORE INSERT OR UPDATE OF program_id, checkout_id, season_id, player_id ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.guard_ihtt_requires_in_house();

CREATE TABLE public.division_fee_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL DEFAULT public.current_league_id() REFERENCES public.leagues(id),
  division_id uuid NOT NULL REFERENCES public.divisions(id),
  old_cost numeric NULL,
  new_cost numeric NULL,
  changed_by uuid NULL,
  changed_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.division_fee_changes TO authenticated;
GRANT ALL ON public.division_fee_changes TO service_role;
REVOKE ALL ON public.division_fee_changes FROM anon;
ALTER TABLE public.division_fee_changes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read fee changes in their league" ON public.division_fee_changes
  FOR SELECT TO authenticated
  USING (league_id = public.current_league_id() AND public.has_admin_access(auth.uid()));

CREATE OR REPLACE FUNCTION public.log_division_fee_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.cost IS DISTINCT FROM OLD.cost THEN
    INSERT INTO public.division_fee_changes (league_id, division_id, old_cost, new_cost, changed_by)
    VALUES (NEW.league_id, NEW.id, OLD.cost, NEW.cost, auth.uid());
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.log_division_fee_change() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER trg_divisions_log_fee_change
  AFTER UPDATE OF cost ON public.divisions
  FOR EACH ROW EXECUTE FUNCTION public.log_division_fee_change();

CREATE POLICY "Admins update divisions in their league" ON public.divisions
  FOR UPDATE TO authenticated
  USING (league_id = public.current_league_id() AND public.has_admin_access(auth.uid()))
  WITH CHECK (league_id = public.current_league_id() AND public.has_admin_access(auth.uid()));