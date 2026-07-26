
-- =========================================================================
-- 1) Helper functions
-- =========================================================================

CREATE OR REPLACE FUNCTION public.is_cleared_coach(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.coaches c
    WHERE c.user_id = _user_id
      AND c.background_check_status = 'cleared'
      AND (c.background_check_expiry IS NULL OR c.background_check_expiry > now())
  )
$$;

-- Delegates the coach-of-team test to the existing is_coach_of() so there is
-- exactly one implementation of "is this user a coach of this team".
CREATE OR REPLACE FUNCTION public.is_coach_of_player(_player_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_rosters tr
    JOIN public.seasons s
      ON s.year = tr.season_year::text
     AND s.league_id = tr.league_id
     AND s.is_current = true
    WHERE tr.player_id = _player_id
      AND COALESCE(tr.status, 'active') = 'active'
      AND public.is_coach_of(tr.team_id)
  )
$$;

-- Unified PII gate. Guardian branch is is_guardian_of_player() ALONE:
-- shares_contact governs cross-household visibility (household A viewing
-- household B), NOT a guardian's view of their own child.
CREATE OR REPLACE FUNCTION public.can_see_player_pii(_player_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1
      FROM public.players p
      WHERE p.id = _player_id
        AND public.is_commissioner_for(auth.uid(), p.program_id, p.division_id)
    )
    OR (public.is_coach_of_player(_player_id) AND public.is_cleared_coach(auth.uid()))
    OR public.is_guardian_of_player(_player_id)
$$;

REVOKE ALL ON FUNCTION public.is_cleared_coach(uuid)     FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_coach_of_player(uuid)   FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_see_player_pii(uuid)   FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_cleared_coach(uuid)     FROM anon;
REVOKE ALL ON FUNCTION public.is_coach_of_player(uuid)   FROM anon;
REVOKE ALL ON FUNCTION public.can_see_player_pii(uuid)   FROM anon;
GRANT EXECUTE ON FUNCTION public.is_cleared_coach(uuid)   TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_coach_of_player(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_see_player_pii(uuid) TO authenticated;

-- =========================================================================
-- 2) Rewrite players SELECT policies
-- =========================================================================

DROP POLICY IF EXISTS "Parents can view their own children" ON public.players;
DROP POLICY IF EXISTS "Admins select players in their league" ON public.players;
DROP POLICY IF EXISTS "Commissioners can view players in their programs" ON public.players;

CREATE POLICY "Players readable by authorized roles"
ON public.players
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.league_players lp
    WHERE lp.player_id = players.id
      AND lp.league_id = (SELECT public.current_league_id())
  )
  AND (
    (SELECT public.has_role(auth.uid(), 'admin'))
    OR public.is_commissioner_for(auth.uid(), players.program_id, players.division_id)
    OR (public.is_coach_of_player(players.id) AND public.is_cleared_coach(auth.uid()))
    OR public.is_guardian_of_player(players.id)
  )
);

-- UPDATE/DELETE unchanged (existing admin + commissioner policies remain).
-- INSERT unchanged (admin-only WITH CHECK + create_player_in_league()).
