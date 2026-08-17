-- Change 2 (partial): division roster bounds, no seeding
ALTER TABLE public.divisions
  ADD COLUMN IF NOT EXISTS default_min_roster_size integer,
  ADD COLUMN IF NOT EXISTS default_max_roster_size integer;

COMMENT ON COLUMN public.divisions.default_min_roster_size IS 'Division roster floor. Unseeded until real numbers are supplied.';
COMMENT ON COLUMN public.divisions.default_max_roster_size IS 'Division roster cap. teams.max_roster_size NULL means use this default. Unseeded until real numbers are supplied.';

ALTER TABLE public.teams ALTER COLUMN max_roster_size DROP NOT NULL;
ALTER TABLE public.teams ALTER COLUMN max_roster_size DROP DEFAULT;
COMMENT ON COLUMN public.teams.max_roster_size IS 'Per-team override. NULL means use divisions.default_max_roster_size.';

-- Change 1 (stage 1): derived counts view
CREATE OR REPLACE VIEW public.team_roster_counts
WITH (security_invoker = on) AS
SELECT t.id AS team_id,
       count(tr.id) FILTER (WHERE tr.status = 'active') AS active_count,
       COALESCE(t.max_roster_size, d.default_max_roster_size) AS effective_max,
       d.default_min_roster_size AS effective_min
FROM public.teams t
LEFT JOIN public.divisions d ON d.id = t.division_id
LEFT JOIN public.team_rosters tr ON tr.team_id = t.id
GROUP BY t.id, t.max_roster_size, d.default_max_roster_size, d.default_min_roster_size;

REVOKE ALL ON public.team_roster_counts FROM anon;
GRANT SELECT ON public.team_roster_counts TO authenticated;

-- Change 3: display-name cleanup (team_aliases untouched)
UPDATE public.teams t
SET name = btrim(regexp_replace(t.name, '^' || d.name || '\s+', ''))
FROM public.divisions d
WHERE d.id = t.division_id
  AND d.name IN ('T-Ball', 'Pinto', 'Mustang')
  AND t.name ~ ('^' || d.name || '\s+\S')
  AND btrim(regexp_replace(t.name, '^' || d.name || '\s+', '')) <> '';

UPDATE public.teams SET name = 'Marauders' WHERE name = 'Maurauders';