# Phase A, steps 1 and 2: 2027 season, programs, fees, capacity (plan only)

Additive only. No 2026 row is edited or deleted. Nothing below is applied until Paul says "approved".

## What I found first (read from the live database)

- `seasons` has `year` (text), `label`, `is_current`, `age_cutoff_date`, `starts_on`, `ends_on`, `locked_at`. One row today: 2026, current, and `age_cutoff_date` is NULL.
- `programs.type` is a Postgres enum (`program_type`: in_house, travel). Registration opens per program (`programs.registration_open`), not per season.
- The 2026 in-house program has `season_id` NULL. The 2026 travel program points at the 2026 season. I will not fix the in-house one (that would be a 2026 edit). Say so if you want it fixed as a separate step.
- 2026 divisions: in-house T-Ball 195, Pinto 250, Mustang 275, Bronco 290, Pony 335, Colt NULL. Travel 8U–14U 1500–2250, 15U NULL. Your fee list matches these.
- There is no "checkout" concept in the schema yet. `registrations` has a `payment` text field but nothing that ties two registrations into one checkout.
- Admins already edit fees on the division edit page (cost field). There is no fee history.

## Points that need your answer before I build

1. **Same checkout.** Nothing groups registrations into one checkout today. I propose a nullable `checkout_id uuid` on `registrations`. The IHTT rule then says: an in-house registration for the same player and season must exist, and must share the IHTT row's `checkout_id` or already be paid or waived. When Stripe arrives (test mode), the checkout fills that column. The alternative is to wait for the Stripe step. I recommend the column now.
2. **Bronco in 2027.** Project memory says Bronco was not offered in 2026 and its copy was removed. You listed Bronco 290 for 2027. I will create it. Should it be visible to families, or hidden like Colt until the board confirms?
3. **Which registrations the age-cutoff block applies to.** The 2026 season also has no cutoff. If the block applied to every new registration, it would stop 2026 imports. I propose it applies only to registrations entered on this site (`source = 'platform'`) and to programs being switched to open. Imports from Sports Connect still go through.
4. **IHTT division names.** I propose "8U IHTT" … "14U IHTT", with the same age ranges as the travel divisions.

## Step 1: 2027 season

### Migration 1a: season row, programs, cutoff guard

```sql
-- 2027 season (data row, part of this additive step)
INSERT INTO public.seasons (league_id, year, label, starts_on, ends_on, is_current, age_cutoff_date)
VALUES (public.current_league_id(), '2027', '2027 Season', '2027-04-05', '2027-06-28', false, NULL);
COMMENT ON COLUMN public.seasons.age_cutoff_date IS
  'NULL = PLACEHOLDER. 2027 must match the travel cutoff in Sports Connect. Registration cannot open while NULL.';

-- 2027 in-house and travel programs, copied from 2026
INSERT INTO public.programs (league_id, type, name, overview, season_start, season_end,
                             registration_open, season_id)
SELECT p.league_id, p.type, p.name, p.overview, DATE '2027-04-05', DATE '2027-06-28', false,
       (SELECT id FROM public.seasons WHERE year = '2027' AND league_id = public.current_league_id())
FROM public.programs p
WHERE p.id IN ('0a379f62-be88-4f89-87fc-03e621b6e786',   -- 2026 in-house
               '09dbe257-e659-4184-b217-fa9a15707bb5');  -- 2026 travel
-- registration URLs are left NULL on purpose (2026 links point at Sports Connect).

-- Guard 1: a program cannot be opened for a season with no age cutoff
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

-- Guard 2: no on-site registration for a season with no age cutoff
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
```

Both triggers are not SECURITY DEFINER: they read `seasons`, which every signed-in user can already read. No new table, no RLS change.

### Code: admin warning banner

- New `src/components/admin/SeasonCutoffBanner.tsx`: reads seasons where `starts_on >= today` (or `is_current`) and `age_cutoff_date IS NULL`. Shows a warning card: "The 2027 season has no age cutoff date. Registration can't open until it's set." with a link to where seasons are edited.
- Mounted once at the top of the admin layout so it shows on every admin page. Query errors show nothing rather than a false warning, and the error is logged.

### Verify step 1

- Read back the season row and the two 2027 programs; confirm 2026 rows are byte-identical (compare `row_to_json` before and after).
- In a rolled-back transaction: `UPDATE programs SET registration_open = true` on a 2027 program raises the error; set the 2027 cutoff to a date and the same update succeeds.
- In a rolled-back transaction: insert a `source='platform'` registration for 2027 and confirm it is rejected; an `import` source row for 2026 still inserts.
- Banner shows on the admin dashboard in the browser at 390px and desktop.

### Undo step 1

```sql
DROP TRIGGER trg_registrations_guard_season_cutoff ON public.registrations;
DROP TRIGGER trg_programs_guard_registration_open ON public.programs;
DROP FUNCTION public.guard_registration_season_cutoff();
DROP FUNCTION public.guard_program_registration_open();
DELETE FROM public.programs WHERE season_id = (SELECT id FROM public.seasons WHERE year='2027');
DELETE FROM public.seasons WHERE year = '2027';
```
Remove the banner file and its one mount line.

## Step 2: programs, fees, capacity

### Migration 2a: new program types (must run on its own)

Postgres cannot use a new enum value in the same transaction that adds it, so this is its own migration.

```sql
ALTER TYPE public.program_type ADD VALUE IF NOT EXISTS 'ihtt';
ALTER TYPE public.program_type ADD VALUE IF NOT EXISTS 'travel_tryout';
ALTER TYPE public.program_type ADD VALUE IF NOT EXISTS 'clinic';
```
in_house and travel stay valid. Undo: enum values cannot be removed without rebuilding the type; leaving unused values in place is harmless.

### Migration 2b: columns, settings, IHTT program, divisions, rule, fee log

```sql
-- League setting (PLACEHOLDER pending board)
ALTER TABLE public.leagues ADD COLUMN ihtt_includes_in_house boolean NOT NULL DEFAULT false;
COMMENT ON COLUMN public.leagues.ihtt_includes_in_house IS
  'PLACEHOLDER pending board. true = in-house fee waived for IHTT players; false = family pays both.';

-- Capacity
ALTER TABLE public.divisions ADD COLUMN capacity integer NULL CHECK (capacity IS NULL OR capacity >= 0);
ALTER TABLE public.divisions ADD COLUMN waitlist_enabled boolean NOT NULL DEFAULT true;

-- Checkout grouping (see question 1)
ALTER TABLE public.registrations ADD COLUMN checkout_id uuid NULL;
CREATE INDEX registrations_checkout_idx ON public.registrations (checkout_id) WHERE checkout_id IS NOT NULL;

-- 2027 IHTT program
INSERT INTO public.programs (league_id, type, name, overview, season_start, season_end, registration_open, season_id)
VALUES (public.current_league_id(), 'ihtt', 'CDBL In-House Travel Team (IHTT)', NULL,
        '2027-04-05', '2027-06-28', false,
        (SELECT id FROM public.seasons WHERE year='2027' AND league_id = public.current_league_id()));
-- overview left NULL: no approved IHTT copy exists; Paul/Notion to supply.

-- IHTT divisions 8U-14U, fee = travel fee for the same age, age_range copied from 2026 travel
INSERT INTO public.divisions (league_id, program_id, name, age_range, cost, display_order)
SELECT d.league_id,
       (SELECT id FROM public.programs WHERE type='ihtt' AND season_id =
          (SELECT id FROM public.seasons WHERE year='2027')),
       replace(d.name, 'Travel', 'IHTT'), d.age_range, v.fee, d.display_order
FROM public.divisions d
JOIN (VALUES ('8U Travel',1500),('9U Travel',1625),('10U Travel',1750),('11U Travel',1875),
             ('12U Travel',2000),('13U Travel',2125),('14U Travel',2250)) v(name, fee) ON v.name = d.name
WHERE d.program_id = '09dbe257-e659-4184-b217-fa9a15707bb5';

-- 2027 in-house divisions (copy 2026, explicit fees; Colt cost NULL)
INSERT INTO public.divisions (league_id, program_id, name, age_range, cost, season_length, features,
                              schedule_notes, display_order, default_min_roster_size, default_max_roster_size)
SELECT d.league_id,
       (SELECT id FROM public.programs WHERE type='in_house' AND season_id=(SELECT id FROM public.seasons WHERE year='2027')),
       d.name, d.age_range, v.fee, d.season_length, d.features, d.schedule_notes, d.display_order,
       d.default_min_roster_size, d.default_max_roster_size
FROM public.divisions d
JOIN (VALUES ('T-Ball',195::numeric),('Pinto',250),('Mustang',275),('Bronco',290),('Pony',335),('Colt',NULL))
     v(name, fee) ON v.name = d.name
WHERE d.program_id = '0a379f62-be88-4f89-87fc-03e621b6e786';

-- 2027 travel divisions (copy 2026 fees; 15U cost NULL)
INSERT INTO public.divisions (league_id, program_id, name, age_range, cost, season_length, features,
                              schedule_notes, display_order, default_min_roster_size, default_max_roster_size)
SELECT d.league_id,
       (SELECT id FROM public.programs WHERE type='travel' AND season_id=(SELECT id FROM public.seasons WHERE year='2027')),
       d.name, d.age_range, CASE WHEN d.name='15U Travel' THEN NULL ELSE d.cost END,
       d.season_length, d.features, d.schedule_notes, d.display_order,
       d.default_min_roster_size, d.default_max_roster_size
FROM public.divisions d
WHERE d.program_id = '09dbe257-e659-4184-b217-fa9a15707bb5';

-- Rule: no registration into a division with no fee (keeps Colt and 15U hidden in the database, not just the UI)
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

-- Rule: IHTT requires an in-house registration, same player and season, same checkout (or already paid/waived)
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
      AND r.league_id = NEW.league_id AND r.lifecycle <> 'withdrawn'
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
```

This trigger is SECURITY DEFINER so a family's check sees the in-house row regardless of their read rights. It is a trigger function, returns nothing to the caller, and EXECUTE is revoked from every role, so it is not an RPC endpoint (our standing rule). The value of `lifecycle` for withdrawn rows will be confirmed against the live check constraint before applying. Whether the in-house fee is charged or waived (`ihtt_includes_in_house`) is a pricing step at checkout; this migration only stores the setting.

```sql
-- Fee change log: insert-only, league-scoped, admin-readable
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
-- no INSERT/UPDATE/DELETE policies: only the trigger writes, nobody edits or deletes

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
```

No existing RLS policy is changed. Who may edit a fee stays exactly as the current `divisions` policy allows.

### Code changes for step 2

- `src/pages/admin/ProgramEdit.tsx` / `Programs.tsx`: add the three new types to the type picker and labels (IHTT, Travel tryout, Clinic).
- `src/pages/admin/DivisionEdit.tsx`: fee field accepts blank (saves NULL instead of `NaN`); add Capacity (blank = no limit) and "Waitlist when full" switch; add a "Fee history" list under the fee (date, who, old, new) read from the new log, names resolved through `profiles`.
- `src/pages/admin/Divisions.tsx`: show "No fee set, hidden from registration" instead of `$null`.
- Public registration and division-finder lists: filter out divisions with `cost IS NULL` (database trigger is the real gate).
- No IHTT checkout UI this turn.

### Verify step 2

- Read back: 1 IHTT program, 7 IHTT divisions with the exact fees; 2027 in-house fees 195/250/275/290/335/NULL; 2027 travel 1500–2250 and 15U NULL. 2026 rows unchanged (before/after `row_to_json` comparison).
- Rolled-back transactions:
  - IHTT registration with no in-house row is rejected; with an in-house row sharing `checkout_id` it passes; with a paid in-house row and no checkout it passes.
  - Registration into 2027 Colt or 15U is rejected.
  - Updating a division fee as an admin writes one log row with old, new, who; updating name only writes none; an authenticated non-admin reads zero log rows; anon gets permission denied.
  - `guard_ihtt_requires_in_house` and `log_division_fee_change` are not executable by `anon` or `authenticated`.
- Browser: edit a fee on the admin division page and see the history line appear.

### Undo step 2

```sql
DROP TRIGGER trg_divisions_log_fee_change ON public.divisions;
DROP FUNCTION public.log_division_fee_change();
DROP TABLE public.division_fee_changes;           -- log only; empty until fees are edited
DROP TRIGGER trg_registrations_ihtt_requires_in_house ON public.registrations;
DROP FUNCTION public.guard_ihtt_requires_in_house();
DROP TRIGGER trg_registrations_guard_division_fee ON public.registrations;
DROP FUNCTION public.guard_registration_division_fee();
DELETE FROM public.divisions WHERE program_id IN
  (SELECT id FROM public.programs WHERE season_id = (SELECT id FROM public.seasons WHERE year='2027'));
DELETE FROM public.programs WHERE type = 'ihtt';
ALTER TABLE public.registrations DROP COLUMN checkout_id;
ALTER TABLE public.divisions DROP COLUMN waitlist_enabled, DROP COLUMN capacity;
ALTER TABLE public.leagues DROP COLUMN ihtt_includes_in_house;
```
Undo is safe only while these columns hold no real data; after registrations open, columns are deprecated instead of dropped. Revert the four admin/public files.

## Order of application

1. Migration 1a, verify, banner code, verify.
2. Migration 2a (enum), verify.
3. Migration 2b, verify, code changes, verify.
After each: list of what changed and the undo above.
