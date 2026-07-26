
-- Helpers: SECURITY DEFINER, pinned search_path, authenticated-only.
-- Each returns a fact ("does this exist?", "what's the current assignment?",
-- "who is the primary guardian?") without ever leaking underlying identifiers
-- like storage_path.

CREATE OR REPLACE FUNCTION public.has_document_on_file(_player_id uuid, _doc_type text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.player_documents
    WHERE player_id = _player_id
      AND doc_type = _doc_type
      AND storage_path IS NOT NULL
  )
$$;
REVOKE ALL ON FUNCTION public.has_document_on_file(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_document_on_file(uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_document_on_file(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_current_roster_assignment(_player_id uuid)
RETURNS TABLE(team_id uuid, team_name text, jersey_number text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT t.id, t.name, tr.jersey_number
  FROM public.team_rosters tr
  JOIN public.seasons s
    ON s.year = tr.season_year::text
   AND s.league_id = tr.league_id
   AND s.is_current = true
  JOIN public.teams t ON t.id = tr.team_id
  WHERE tr.player_id = _player_id
    AND COALESCE(tr.status, 'active') = 'active'
  ORDER BY tr.joined_date DESC NULLS LAST
  LIMIT 1
$$;
REVOKE ALL ON FUNCTION public.get_current_roster_assignment(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_current_roster_assignment(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_current_roster_assignment(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_primary_guardian_for_player(_player_id uuid)
RETURNS TABLE(household_id uuid, first_name text, last_name text, email text, phone text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT h.id, g.first_name, g.last_name, g.email, g.phone
  FROM public.household_players hp
  JOIN public.households h ON h.id = hp.household_id
  JOIN public.guardian_households gh
    ON gh.household_id = hp.household_id
   AND gh.is_primary = true
  JOIN public.guardians g ON g.id = gh.guardian_id
  WHERE hp.player_id = _player_id
  ORDER BY gh.created_at ASC
  LIMIT 1
$$;
REVOKE ALL ON FUNCTION public.get_primary_guardian_for_player(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_primary_guardian_for_player(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_primary_guardian_for_player(uuid) TO authenticated;

-- v_player_current: one row per player with a current-season registration.
-- security_invoker = on so base-table RLS applies to the caller. Every join
-- is LEFT so callers who cannot see a fact get NULL for that fact, never a
-- silently-dropped row. Permission-artifact columns (team assignment,
-- primary guardian, birth cert) route through security-definer helpers so
-- their answers are facts, not visibility shadows.
DROP VIEW IF EXISTS public.v_player_current CASCADE;
CREATE VIEW public.v_player_current
WITH (security_invoker = on) AS
SELECT
  p.id                        AS player_id,
  p.first_name,
  p.last_name,
  p.preferred_name,
  p.date_of_birth,
  CASE
    WHEN p.date_of_birth IS NOT NULL AND s.age_cutoff_date IS NOT NULL
      THEN EXTRACT(YEAR FROM age(s.age_cutoff_date, p.date_of_birth))::int
    ELSE NULL
  END                         AS baseball_age,
  r.grade_at_registration,
  pr.name                     AS program_name,
  d.name                      AS division_name,
  r.id                        AS registration_id,
  r.kind,
  r.lifecycle,
  r.seat,
  r.payment,
  r.offer,
  r.waiver_status,
  (r.payment IN ('paid','waived','partial')) AS paid,
  public.has_document_on_file(r.player_id, 'birth_certificate') AS birth_cert_on_file,
  ra.team_id,
  ra.team_name,
  ra.jersey_number,
  pg.household_id,
  NULLIF(TRIM(COALESCE(pg.first_name,'') || ' ' || COALESCE(pg.last_name,'')), '') AS primary_guardian_name,
  pg.email                    AS primary_guardian_email,
  pg.phone                    AS primary_guardian_phone
FROM public.registrations r
LEFT JOIN public.seasons  s  ON s.id  = r.season_id
LEFT JOIN public.players  p  ON p.id  = r.player_id
LEFT JOIN public.programs pr ON pr.id = r.program_id
LEFT JOIN public.divisions d ON d.id  = r.division_id
LEFT JOIN LATERAL public.get_current_roster_assignment(r.player_id)  ra ON true
LEFT JOIN LATERAL public.get_primary_guardian_for_player(r.player_id) pg ON true
WHERE r.season_id = (
  SELECT s2.id FROM public.seasons s2
  WHERE s2.is_current = true AND s2.league_id = r.league_id
  LIMIT 1
);

REVOKE ALL ON public.v_player_current FROM PUBLIC;
REVOKE ALL ON public.v_player_current FROM anon;
GRANT SELECT ON public.v_player_current TO authenticated;

-- v_roster_coach: coach-facing minimum. can_see_player_pii filter plus
-- underlying RLS on player_medical/players is the authorization; view just
-- shapes the data. LEFT JOINs so a missing medical row or missing guardian
-- still returns the roster line.
DROP VIEW IF EXISTS public.v_roster_coach CASCADE;
CREATE VIEW public.v_roster_coach
WITH (security_invoker = on) AS
SELECT
  p.id                AS player_id,
  p.first_name,
  p.last_name,
  tr.jersey_number,
  tr.position_primary,
  tr.position_secondary,
  NULLIF(TRIM(COALESCE(pg.first_name,'') || ' ' || COALESCE(pg.last_name,'')), '') AS primary_guardian_name,
  pg.email            AS primary_guardian_email,
  pg.phone            AS primary_guardian_phone,
  pm.allergies,
  pm.notes,
  tr.team_id
FROM public.team_rosters tr
LEFT JOIN public.players p         ON p.id = tr.player_id
LEFT JOIN public.player_medical pm ON pm.player_id = tr.player_id
LEFT JOIN LATERAL public.get_primary_guardian_for_player(tr.player_id) pg ON true
WHERE public.can_see_player_pii(tr.player_id);

REVOKE ALL ON public.v_roster_coach FROM PUBLIC;
REVOKE ALL ON public.v_roster_coach FROM anon;
GRANT SELECT ON public.v_roster_coach TO authenticated;

-- v_roster_social_export: NOT a public roster.
-- D5 (2026-07-25): board ruled no player names on the public site. The
-- approved use for names + numbers is CDBL-run social channels only, which
-- reach followers who opted in. This view exists to feed that admin export
-- and nothing else. Do not grant to anon. Do not surface on public routes.
DROP VIEW IF EXISTS public.v_roster_social_export CASCADE;
CREATE VIEW public.v_roster_social_export
WITH (security_invoker = on) AS
SELECT
  p.first_name,
  p.last_name,
  tr.jersey_number,
  t.name AS team_name,
  d.name AS division_name
FROM public.team_rosters tr
JOIN public.teams t     ON t.id = tr.team_id
LEFT JOIN public.players p    ON p.id = tr.player_id
LEFT JOIN public.divisions d  ON d.id = t.division_id
WHERE has_role(auth.uid(), 'admin'::app_role);

COMMENT ON VIEW public.v_roster_social_export IS
  'D5 (2026-07-25): board ruled no player names on the public website. This view is the admin-only export for CDBL social channels (names + jersey numbers). Do NOT grant to anon. Do NOT surface publicly.';

REVOKE ALL ON public.v_roster_social_export FROM PUBLIC;
REVOKE ALL ON public.v_roster_social_export FROM anon;
GRANT SELECT ON public.v_roster_social_export TO authenticated;
