
-- 1. Coaches read their own team's active roster rows.
CREATE POLICY "Coaches view their own team roster"
  ON public.team_rosters
  FOR SELECT
  TO authenticated
  USING (
    league_id = (SELECT public.current_league_id())
    AND COALESCE(status, 'active') = 'active'
    AND public.is_coach_of(team_id)
  );

-- 2. Guardians read their own child's roster row.
CREATE POLICY "Guardians view their own child roster row"
  ON public.team_rosters
  FOR SELECT
  TO authenticated
  USING (
    league_id = (SELECT public.current_league_id())
    AND public.is_guardian_of_player(player_id)
  );

-- 3. Narrow definer function: coach contact for a guardian on that team.
CREATE OR REPLACE FUNCTION public.get_coach_contact_for_guardian(_team_id uuid)
RETURNS TABLE(coach_name text, coach_role text, coach_email text, coach_phone text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    NULLIF(TRIM(COALESCE(c.first_name,'') || ' ' || COALESCE(c.last_name,'')),''),
    tc.role,
    c.email,
    c.phone
  FROM public.team_coaches tc
  JOIN public.coaches c ON c.id = tc.coach_id
  WHERE tc.team_id = _team_id
    AND COALESCE(tc.status,'active') = 'active'
    AND EXISTS (
      SELECT 1
      FROM public.team_rosters tr
      WHERE tr.team_id = _team_id
        AND COALESCE(tr.status,'active') = 'active'
        AND public.is_guardian_of_player(tr.player_id)
    )
$$;

COMMENT ON FUNCTION public.get_coach_contact_for_guardian(uuid) IS
  'Self-authorising: only a guardian of an active-rostered player on the team gets rows. Returns coach contact columns only; never clearance status, certifications or admin notes.';

REVOKE ALL ON FUNCTION public.get_coach_contact_for_guardian(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_coach_contact_for_guardian(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_coach_contact_for_guardian(uuid) TO authenticated;

-- 4. v_roster_coach -- rebuilt. No player_medical join at any depth.
DROP VIEW IF EXISTS public.v_roster_coach;

CREATE VIEW public.v_roster_coach
WITH (security_invoker = on) AS
SELECT
  tr.team_id,
  tr.player_id,
  tr.jersey_number,
  tr.position_primary,
  tr.position_secondary,
  p.first_name,
  p.last_name,
  p.preferred_name,
  CASE WHEN public.can_see_player_pii(tr.player_id)
       THEN NULLIF(TRIM(COALESCE(pg.first_name,'') || ' ' || COALESCE(pg.last_name,'')),'')
  END AS primary_guardian_name,
  CASE WHEN public.can_see_player_pii(tr.player_id) THEN pg.email END AS primary_guardian_email,
  CASE WHEN public.can_see_player_pii(tr.player_id) THEN pg.phone END AS primary_guardian_phone
FROM public.team_rosters tr
LEFT JOIN public.players p ON p.id = tr.player_id
LEFT JOIN LATERAL public.get_primary_guardian_for_player(tr.player_id)
  AS pg(household_id, first_name, last_name, email, phone) ON true
WHERE COALESCE(tr.status,'active') = 'active';

COMMENT ON VIEW public.v_roster_coach IS
  'Coach-facing roster. Deliberately does NOT join player_medical: coaches have no policy on that table and must never receive allergies or medical notes through a roster surface. No date of birth. Contact columns are gated on can_see_player_pii, which requires a coach to be background-check cleared. An assigned but uncleared coach sees jersey numbers and positions with NULL names -- accepted 2026-08-17.';

GRANT SELECT ON public.v_roster_coach TO authenticated;
REVOKE ALL ON public.v_roster_coach FROM anon;

-- 5. v_roster_family -- own child plus coaching staff only.
DROP VIEW IF EXISTS public.v_roster_family;

CREATE VIEW public.v_roster_family
WITH (security_invoker = on) AS
SELECT
  tr.team_id,
  t.name AS team_name,
  tr.player_id,
  p.first_name,
  p.preferred_name,
  tr.jersey_number,
  cc.coach_name,
  cc.coach_role,
  cc.coach_email,
  cc.coach_phone
FROM public.team_rosters tr
LEFT JOIN public.teams t ON t.id = tr.team_id
LEFT JOIN public.players p ON p.id = tr.player_id
LEFT JOIN LATERAL public.get_coach_contact_for_guardian(tr.team_id) cc ON true
WHERE COALESCE(tr.status,'active') = 'active'
  AND public.is_guardian_of_player(tr.player_id);

COMMENT ON VIEW public.v_roster_family IS
  'Guardian-facing. Scoped to the caller''s own child by is_guardian_of_player. Carries no date of birth, no medical data, and no other family''s contact details. Teammate first names are deliberately absent: showing minors'' names to other families is a board decision in the D5 family and has not been made. Coach contact comes from get_coach_contact_for_guardian, which returns contact columns only and never clearance status.';

GRANT SELECT ON public.v_roster_family TO authenticated;
REVOKE ALL ON public.v_roster_family FROM anon;
