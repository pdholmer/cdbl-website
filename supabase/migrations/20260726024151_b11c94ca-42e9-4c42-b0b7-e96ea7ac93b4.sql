
BEGIN;

-- ============================================================================
-- 1. Add league_id column to the 11 core tables, defaulting to CDBL.
-- ============================================================================

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'seasons','programs','divisions','venues','teams','players',
    'coaches','coach_invitations','team_coaches','team_rosters','households'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS league_id uuid', t);
    EXECUTE format('UPDATE public.%I SET league_id = public.current_league_id() WHERE league_id IS NULL', t);
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN league_id SET NOT NULL', t);
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN league_id SET DEFAULT public.current_league_id()', t);
    EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT IF EXISTS %I', t, t || '_league_id_fkey');
    EXECUTE format('ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY (league_id) REFERENCES public.leagues(id) ON DELETE RESTRICT', t, t || '_league_id_fkey');
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I(league_id)', t || '_league_id_idx', t);
  END LOOP;
END$$;

-- ============================================================================
-- 2. Fix unique constraints that would break a second league.
-- ============================================================================

DROP INDEX IF EXISTS public.seasons_one_current_idx;
CREATE UNIQUE INDEX seasons_one_current_idx
  ON public.seasons (league_id, is_current)
  WHERE is_current = true;

ALTER TABLE public.programs DROP CONSTRAINT IF EXISTS programs_type_key;
DROP INDEX IF EXISTS public.programs_type_key;
CREATE UNIQUE INDEX programs_type_key
  ON public.programs (league_id, type);

-- ============================================================================
-- 3. Rewrite policies with league scoping + scalar subselects.
--    Every function call is wrapped as (SELECT fn(...)) so Postgres evaluates
--    it once as an InitPlan rather than per row.
-- ============================================================================

-- ---------- seasons ----------
DROP POLICY IF EXISTS "Admins manage seasons" ON public.seasons;
DROP POLICY IF EXISTS "Seasons are viewable by everyone" ON public.seasons;

CREATE POLICY "Admins manage seasons" ON public.seasons
FOR ALL
USING (league_id = (SELECT public.current_league_id()) AND (SELECT public.has_admin_access(auth.uid())))
WITH CHECK (league_id = (SELECT public.current_league_id()) AND (SELECT public.has_admin_access(auth.uid())));

CREATE POLICY "Seasons are viewable by everyone" ON public.seasons
FOR SELECT
USING (league_id = (SELECT public.current_league_id()));

-- ---------- programs ----------
DROP POLICY IF EXISTS "Programs are publicly readable" ON public.programs;

CREATE POLICY "Programs are publicly readable" ON public.programs
FOR SELECT
USING (league_id = (SELECT public.current_league_id()));

-- ---------- divisions ----------
DROP POLICY IF EXISTS "Divisions are publicly readable" ON public.divisions;

CREATE POLICY "Divisions are publicly readable" ON public.divisions
FOR SELECT
USING (league_id = (SELECT public.current_league_id()));

-- ---------- venues ----------
DROP POLICY IF EXISTS "Admins have full access to venues" ON public.venues;
DROP POLICY IF EXISTS "Public can view active venues" ON public.venues;

CREATE POLICY "Admins have full access to venues" ON public.venues
FOR ALL
USING (league_id = (SELECT public.current_league_id()) AND (SELECT public.has_role(auth.uid(),'admin'::app_role)));

CREATE POLICY "Public can view active venues" ON public.venues
FOR SELECT
USING (league_id = (SELECT public.current_league_id()) AND status = 'active');

-- ---------- venue_fields (inherits league via venues) ----------
DROP POLICY IF EXISTS "Admins have full access to venue fields" ON public.venue_fields;
DROP POLICY IF EXISTS "Public can view active venue fields" ON public.venue_fields;

CREATE POLICY "Admins have full access to venue fields" ON public.venue_fields
FOR ALL
USING ((SELECT public.has_role(auth.uid(),'admin'::app_role)));

CREATE POLICY "Public can view active venue fields" ON public.venue_fields
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.venues v
  WHERE v.id = venue_fields.venue_id
    AND v.status = 'active'
    AND v.league_id = (SELECT public.current_league_id())
));

-- ---------- teams ----------
DROP POLICY IF EXISTS "Admins have full access to teams" ON public.teams;
DROP POLICY IF EXISTS "Commissioners can manage teams in their programs" ON public.teams;
DROP POLICY IF EXISTS "Commissioners can view teams in their programs" ON public.teams;
DROP POLICY IF EXISTS "Public can view active teams" ON public.teams;

CREATE POLICY "Admins have full access to teams" ON public.teams
FOR ALL
USING (league_id = (SELECT public.current_league_id()) AND (SELECT public.has_role(auth.uid(),'admin'::app_role)));

CREATE POLICY "Commissioners can manage teams in their programs" ON public.teams
FOR ALL
USING (
  league_id = (SELECT public.current_league_id())
  AND EXISTS (
    SELECT 1 FROM public.commissioner_assignments ca
    WHERE ca.user_id = auth.uid()
      AND ca.program_id = teams.program_id
      AND (ca.division_id IS NULL OR ca.division_id = teams.division_id)
  )
);

CREATE POLICY "Commissioners can view teams in their programs" ON public.teams
FOR SELECT
USING (
  league_id = (SELECT public.current_league_id())
  AND EXISTS (
    SELECT 1 FROM public.commissioner_assignments ca
    WHERE ca.user_id = auth.uid()
      AND ca.program_id = teams.program_id
      AND (ca.division_id IS NULL OR ca.division_id = teams.division_id)
  )
);

CREATE POLICY "Public can view active teams" ON public.teams
FOR SELECT
USING (league_id = (SELECT public.current_league_id()) AND status = 'active');

-- ---------- team_rosters (public policy DROPPED, not replaced) ----------
DROP POLICY IF EXISTS "Admins have full access to team rosters" ON public.team_rosters;
DROP POLICY IF EXISTS "Commissioners can manage team rosters in their programs" ON public.team_rosters;
DROP POLICY IF EXISTS "Public can view active team rosters" ON public.team_rosters;

CREATE POLICY "Admins have full access to team rosters" ON public.team_rosters
FOR ALL
USING (league_id = (SELECT public.current_league_id()) AND (SELECT public.has_role(auth.uid(),'admin'::app_role)));

CREATE POLICY "Commissioners can manage team rosters in their programs" ON public.team_rosters
FOR ALL
USING (
  league_id = (SELECT public.current_league_id())
  AND EXISTS (
    SELECT 1 FROM public.commissioner_assignments ca
    JOIN public.teams t ON t.id = team_rosters.team_id
    WHERE ca.user_id = auth.uid()
      AND ca.program_id = t.program_id
      AND (ca.division_id IS NULL OR ca.division_id = t.division_id)
  )
);

-- ---------- team_coaches ----------
DROP POLICY IF EXISTS "Admins have full access to team coaches" ON public.team_coaches;
DROP POLICY IF EXISTS "Commissioners can manage team coaches in their programs" ON public.team_coaches;
DROP POLICY IF EXISTS "Public can view active team coaches" ON public.team_coaches;

CREATE POLICY "Admins have full access to team coaches" ON public.team_coaches
FOR ALL
USING (league_id = (SELECT public.current_league_id()) AND (SELECT public.has_role(auth.uid(),'admin'::app_role)));

CREATE POLICY "Commissioners can manage team coaches in their programs" ON public.team_coaches
FOR ALL
USING (
  league_id = (SELECT public.current_league_id())
  AND EXISTS (
    SELECT 1 FROM public.commissioner_assignments ca
    JOIN public.teams t ON t.id = team_coaches.team_id
    WHERE ca.user_id = auth.uid()
      AND ca.program_id = t.program_id
      AND (ca.division_id IS NULL OR ca.division_id = t.division_id)
  )
);

CREATE POLICY "Public can view active team coaches" ON public.team_coaches
FOR SELECT
USING (league_id = (SELECT public.current_league_id()) AND status = 'active');

-- ---------- coaches ----------
DROP POLICY IF EXISTS "Admins have full access to coaches" ON public.coaches;
DROP POLICY IF EXISTS "Coaches can update their own contact info" ON public.coaches;
DROP POLICY IF EXISTS "Coaches can view their own profile" ON public.coaches;
DROP POLICY IF EXISTS "Commissioners can view coaches" ON public.coaches;

CREATE POLICY "Admins have full access to coaches" ON public.coaches
FOR ALL
USING (league_id = (SELECT public.current_league_id()) AND (SELECT public.has_role(auth.uid(),'admin'::app_role)));

CREATE POLICY "Coaches can update their own contact info" ON public.coaches
FOR UPDATE
USING (league_id = (SELECT public.current_league_id()) AND user_id = auth.uid())
WITH CHECK (league_id = (SELECT public.current_league_id()) AND user_id = auth.uid());

CREATE POLICY "Coaches can view their own profile" ON public.coaches
FOR SELECT
USING (league_id = (SELECT public.current_league_id()) AND user_id = auth.uid());

CREATE POLICY "Commissioners can view coaches" ON public.coaches
FOR SELECT
USING (league_id = (SELECT public.current_league_id()) AND (SELECT public.has_role(auth.uid(),'commissioner'::app_role)));

-- ---------- coach_invitations ----------
DROP POLICY IF EXISTS "Admins have full access to coach invitations" ON public.coach_invitations;
DROP POLICY IF EXISTS "Commissioners can manage invitations for their programs" ON public.coach_invitations;

CREATE POLICY "Admins have full access to coach invitations" ON public.coach_invitations
FOR ALL
USING (league_id = (SELECT public.current_league_id()) AND (SELECT public.has_role(auth.uid(),'admin'::app_role)));

CREATE POLICY "Commissioners can manage invitations for their programs" ON public.coach_invitations
FOR ALL
USING (
  league_id = (SELECT public.current_league_id())
  AND EXISTS (
    SELECT 1 FROM public.commissioner_assignments ca
    WHERE ca.user_id = auth.uid()
      AND ca.program_id = coach_invitations.program_id
      AND (ca.division_id IS NULL OR ca.division_id = coach_invitations.division_id)
  )
);

-- ---------- households ----------
DROP POLICY IF EXISTS "Admins manage all households" ON public.households;
DROP POLICY IF EXISTS "Guardians update their households" ON public.households;
DROP POLICY IF EXISTS "Guardians view their households" ON public.households;

CREATE POLICY "Admins manage all households" ON public.households
FOR ALL
USING (league_id = (SELECT public.current_league_id()) AND (SELECT public.has_role(auth.uid(),'admin'::app_role)))
WITH CHECK (league_id = (SELECT public.current_league_id()) AND (SELECT public.has_role(auth.uid(),'admin'::app_role)));

CREATE POLICY "Guardians update their households" ON public.households
FOR UPDATE
USING (league_id = (SELECT public.current_league_id()) AND (SELECT public.is_guardian_of_household(id)))
WITH CHECK (league_id = (SELECT public.current_league_id()) AND (SELECT public.is_guardian_of_household(id)));

CREATE POLICY "Guardians view their households" ON public.households
FOR SELECT
USING (league_id = (SELECT public.current_league_id()) AND (SELECT public.is_guardian_of_household(id)));

-- ---------- players ----------
DROP POLICY IF EXISTS "Admins have full access to players" ON public.players;
DROP POLICY IF EXISTS "Commissioners can update players in their programs" ON public.players;
DROP POLICY IF EXISTS "Commissioners can view players in their programs" ON public.players;
DROP POLICY IF EXISTS "Parents can view their own children" ON public.players;

CREATE POLICY "Admins have full access to players" ON public.players
FOR ALL
USING (league_id = (SELECT public.current_league_id()) AND (SELECT public.has_role(auth.uid(),'admin'::app_role)));

CREATE POLICY "Commissioners can update players in their programs" ON public.players
FOR UPDATE
USING (
  league_id = (SELECT public.current_league_id())
  AND EXISTS (
    SELECT 1 FROM public.commissioner_assignments ca
    WHERE ca.user_id = auth.uid()
      AND ca.program_id = players.program_id
      AND (ca.division_id IS NULL OR ca.division_id = players.division_id)
  )
);

CREATE POLICY "Commissioners can view players in their programs" ON public.players
FOR SELECT
USING (
  league_id = (SELECT public.current_league_id())
  AND EXISTS (
    SELECT 1 FROM public.commissioner_assignments ca
    WHERE ca.user_id = auth.uid()
      AND ca.program_id = players.program_id
      AND (ca.division_id IS NULL OR ca.division_id = players.division_id)
  )
);

-- Preserved intentionally: still uses parent_email = get_user_email().
-- This is the Critical email-matching finding; replaced next pass by the
-- household_players -> guardian_households path.
CREATE POLICY "Parents can view their own children" ON public.players
FOR SELECT
USING (
  league_id = (SELECT public.current_league_id())
  AND parent_email = (SELECT public.get_user_email())
  AND ((auth.jwt() ->> 'is_anonymous')::boolean IS DISTINCT FROM true)
  AND EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = auth.uid() AND u.email_confirmed_at IS NOT NULL
  )
);

COMMIT;
