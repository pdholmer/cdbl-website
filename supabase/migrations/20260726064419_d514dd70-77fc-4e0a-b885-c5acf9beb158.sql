
BEGIN;

-- 1. Seed Colt division
INSERT INTO public.divisions (id, program_id, name, age_range, display_order)
VALUES (
  gen_random_uuid(),
  '0a379f62-be88-4f89-87fc-03e621b6e786',
  'Colt',
  'High School & Up Ages 15+',
  100
);

CREATE TEMP TABLE _colt AS
SELECT id FROM public.divisions
WHERE name = 'Colt'
  AND program_id = '0a379f62-be88-4f89-87fc-03e621b6e786';

-- 2. Rename 14 in place, tenant-scoped
UPDATE public.teams t SET name='CDBL Rockets 10u Blue'  FROM public.divisions d WHERE d.id=t.division_id AND d.name='10U Travel' AND t.name='10U Blue'  AND t.league_id=public.current_league_id();
UPDATE public.teams t SET name='CDBL Rockets 10u White' FROM public.divisions d WHERE d.id=t.division_id AND d.name='10U Travel' AND t.name='10U White' AND t.league_id=public.current_league_id();
UPDATE public.teams t SET name='CDBL Rockets 11u Blue'  FROM public.divisions d WHERE d.id=t.division_id AND d.name='11U Travel' AND t.name='11U Blue'  AND t.league_id=public.current_league_id();
UPDATE public.teams t SET name='CDBL Rockets 11u White' FROM public.divisions d WHERE d.id=t.division_id AND d.name='11U Travel' AND t.name='11U White' AND t.league_id=public.current_league_id();
UPDATE public.teams t SET name='CDBL Rockets 12u Blue'  FROM public.divisions d WHERE d.id=t.division_id AND d.name='12U Travel' AND t.name='12U Blue'  AND t.league_id=public.current_league_id();
UPDATE public.teams t SET name='CDBL Rockets 12u White' FROM public.divisions d WHERE d.id=t.division_id AND d.name='12U Travel' AND t.name='12U White' AND t.league_id=public.current_league_id();
UPDATE public.teams t SET name='CDBL Rockets 13u Blue'  FROM public.divisions d WHERE d.id=t.division_id AND d.name='13U Travel' AND t.name='13U Blue'  AND t.league_id=public.current_league_id();
UPDATE public.teams t SET name='CDBL Rockets 14u Blue'  FROM public.divisions d WHERE d.id=t.division_id AND d.name='14U Travel' AND t.name='14U Blue'  AND t.league_id=public.current_league_id();
UPDATE public.teams t SET name='CDBL Rockets 8u Blue'   FROM public.divisions d WHERE d.id=t.division_id AND d.name='8U Travel'  AND t.name='8U Blue'   AND t.league_id=public.current_league_id();
UPDATE public.teams t SET name='CDBL Rockets 9u Blue'   FROM public.divisions d WHERE d.id=t.division_id AND d.name='9U Travel'  AND t.name='9U Blue'   AND t.league_id=public.current_league_id();
UPDATE public.teams t SET name='Pinto Cardinals'        FROM public.divisions d WHERE d.id=t.division_id AND d.name='Pinto'      AND t.name='Cardinals' AND t.league_id=public.current_league_id();
UPDATE public.teams t SET name='Pinto Cubs'             FROM public.divisions d WHERE d.id=t.division_id AND d.name='Pinto'      AND t.name='Cubs'      AND t.league_id=public.current_league_id();
UPDATE public.teams t SET name='Mustang Pirates'        FROM public.divisions d WHERE d.id=t.division_id AND d.name='Mustang'    AND t.name='Pirates'   AND t.league_id=public.current_league_id();
UPDATE public.teams t SET name='Mustang White Sox'      FROM public.divisions d WHERE d.id=t.division_id AND d.name='Mustang'    AND t.name='White Sox' AND t.league_id=public.current_league_id();

DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM public.teams
   WHERE league_id=public.current_league_id()
     AND name ~ '^(CDBL Rockets |Pinto |Mustang )';
  IF n <> 14 THEN
    RAISE EXCEPTION 'rename step produced % rows, expected 14', n;
  END IF;
END $$;

-- 3. Create 30 new teams
INSERT INTO public.teams (name, division_id, program_id, season_year, status)
SELECT v.name, d.id, d.program_id, 2026, 'active'
FROM (VALUES
  ('CDBL Rockets 10u IHTT',  '10U Travel'),
  ('CDBL Rockets 11u Gray',  '11U Travel'),
  ('CDBL Rockets 13u Gray',  '13U Travel'),
  ('CDBL Rockets 13u White', '13U Travel'),
  ('CDBL Rockets 15u Blue',  '15U Travel')
) AS v(name, div)
JOIN public.divisions d ON d.name = v.div
JOIN public.programs  p ON p.id   = d.program_id AND p.type='travel';

INSERT INTO public.teams (name, division_id, program_id, season_year, status)
SELECT v.name, d.id, d.program_id, 2026, 'active'
FROM (VALUES
  ('T-Ball Bulls'),('T-Ball Grasshoppers'),('T-Ball Hooks'),('T-Ball Hot Rods'),
  ('T-Ball Iron Pigs'),('T-Ball Lugnuts'),('T-Ball Maurauders'),('T-Ball Mud Cats'),
  ('T-Ball River Dogs'),('T-Ball Yard Goats')
) AS v(name)
JOIN public.divisions d ON d.name='T-Ball';

INSERT INTO public.teams (name, division_id, program_id, season_year, status)
SELECT v.name, d.id, d.program_id, 2026, 'active'
FROM (VALUES
  ('Pinto Brewers'),('Pinto Orioles'),('Pinto Pirates'),('Pinto Rays'),('Pinto White Sox')
) AS v(name)
JOIN public.divisions d ON d.name='Pinto';

INSERT INTO public.teams (name, division_id, program_id, season_year, status)
SELECT v.name, d.id, d.program_id, 2026, 'active'
FROM (VALUES
  ('Mustang Brewers'),('Mustang Cardinals'),('Mustang Cubs'),('Mustang Orioles'),('Mustang Rays')
) AS v(name)
JOIN public.divisions d ON d.name='Mustang';

INSERT INTO public.teams (name, division_id, program_id, season_year, status)
SELECT 'Bronco', d.id, d.program_id, 2026, 'active'
FROM public.divisions d WHERE d.name='Bronco';

INSERT INTO public.teams (name, division_id, program_id, season_year, status)
SELECT 'CDBL Pony 14u', d.id, d.program_id, 2026, 'active'
FROM public.divisions d WHERE d.name='Pony';

INSERT INTO public.teams (name, division_id, program_id, season_year, status)
SELECT 'Colt 17O', c.id, '0a379f62-be88-4f89-87fc-03e621b6e786', 2026, 'active' FROM _colt c;
INSERT INTO public.teams (name, division_id, program_id, season_year, status)
SELECT 'Colt 17U', c.id, '0a379f62-be88-4f89-87fc-03e621b6e786', 2026, 'active' FROM _colt c;
INSERT INTO public.teams (name, division_id, program_id, season_year, status)
SELECT 'Colt Carte', c.id, '0a379f62-be88-4f89-87fc-03e621b6e786', 2026, 'forming' FROM _colt c;

-- 4. Write 44 aliases (external_name verbatim, including trailing space in program string)
INSERT INTO public.team_aliases
  (team_id, source, external_id, external_name, source_program, source_division, match_method, matched_at)
SELECT
  t.id, 'sportsconnect', NULL, i.source_team, i.source_program, i.source_division,
  'reviewed_name', now()
FROM public.import_sc_teams i
JOIN public.teams t ON t.name = i.source_team
WHERE t.league_id = public.current_league_id();

-- 5. Delete orphans, tenant-scoped
DELETE FROM public.teams t
WHERE t.league_id = public.current_league_id()
  AND NOT EXISTS (SELECT 1 FROM public.team_aliases a WHERE a.team_id = t.id);

-- 6. Post-conditions
DO $$
DECLARE
  v_league uuid := public.current_league_id();
  v_teams int; v_aliases int; v_null_aliases int;
BEGIN
  SELECT count(*) INTO v_teams        FROM public.teams        WHERE league_id = v_league;
  SELECT count(*) INTO v_aliases      FROM public.team_aliases WHERE league_id = v_league;
  SELECT count(*) INTO v_null_aliases FROM public.team_aliases WHERE league_id = v_league AND team_id IS NULL;
  IF v_teams        <> 44 THEN RAISE EXCEPTION 'teams count = %, expected 44', v_teams; END IF;
  IF v_aliases      <> 44 THEN RAISE EXCEPTION 'team_aliases count = %, expected 44', v_aliases; END IF;
  IF v_null_aliases <> 0  THEN RAISE EXCEPTION '% aliases have null team_id, expected 0', v_null_aliases; END IF;
END $$;

COMMIT;
