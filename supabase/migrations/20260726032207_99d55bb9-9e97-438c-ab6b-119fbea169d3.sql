
BEGIN;

-- =========================================================================
-- 1. league_players (global player <-> per-league membership)
--    NOTE: player_id ON DELETE RESTRICT (not CASCADE) so deleting a global
--    player cannot silently wipe another league's records.
-- =========================================================================
CREATE TABLE public.league_players (
  league_id   uuid NOT NULL DEFAULT public.current_league_id() REFERENCES public.leagues(id) ON DELETE RESTRICT,
  player_id   uuid NOT NULL REFERENCES public.players(id) ON DELETE RESTRICT,
  status      text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','departed')),
  joined_at   timestamptz NOT NULL DEFAULT now(),
  left_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (league_id, player_id)
);
CREATE INDEX league_players_player_id_idx ON public.league_players (player_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.league_players TO authenticated;
GRANT ALL ON public.league_players TO service_role;

ALTER TABLE public.league_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage league_players in their league"
  ON public.league_players FOR ALL
  USING (league_id = (SELECT public.current_league_id()) AND (SELECT public.has_role(auth.uid(),'admin')))
  WITH CHECK (league_id = (SELECT public.current_league_id()) AND (SELECT public.has_role(auth.uid(),'admin')));

CREATE POLICY "Guardians view league_players for their players"
  ON public.league_players FOR SELECT
  USING (league_id = (SELECT public.current_league_id()) AND public.is_guardian_of_player(player_id));

CREATE TRIGGER update_league_players_updated_at
  BEFORE UPDATE ON public.league_players
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Backfill: one membership row per existing player, in that player's current league
INSERT INTO public.league_players (league_id, player_id, status)
SELECT league_id, id, 'active' FROM public.players
ON CONFLICT DO NOTHING;

-- =========================================================================
-- 2. Add league_id to guardians, guardian_households, household_players, player_medical
-- =========================================================================
ALTER TABLE public.guardians ADD COLUMN league_id uuid;
UPDATE public.guardians g SET league_id = COALESCE(
  (SELECT h.league_id FROM public.households h
     JOIN public.guardian_households gh ON gh.household_id = h.id
    WHERE gh.guardian_id = g.id LIMIT 1),
  public.current_league_id()
);
ALTER TABLE public.guardians
  ALTER COLUMN league_id SET NOT NULL,
  ALTER COLUMN league_id SET DEFAULT public.current_league_id(),
  ADD CONSTRAINT guardians_league_id_fkey FOREIGN KEY (league_id) REFERENCES public.leagues(id) ON DELETE RESTRICT;
CREATE INDEX guardians_league_id_idx ON public.guardians (league_id);

ALTER TABLE public.guardian_households ADD COLUMN league_id uuid;
UPDATE public.guardian_households gh
   SET league_id = (SELECT h.league_id FROM public.households h WHERE h.id = gh.household_id);
ALTER TABLE public.guardian_households
  ALTER COLUMN league_id SET NOT NULL,
  ALTER COLUMN league_id SET DEFAULT public.current_league_id(),
  ADD CONSTRAINT guardian_households_league_id_fkey FOREIGN KEY (league_id) REFERENCES public.leagues(id) ON DELETE RESTRICT;
CREATE INDEX guardian_households_league_id_idx ON public.guardian_households (league_id);

ALTER TABLE public.household_players ADD COLUMN league_id uuid;
UPDATE public.household_players hp
   SET league_id = (SELECT h.league_id FROM public.households h WHERE h.id = hp.household_id);
ALTER TABLE public.household_players
  ALTER COLUMN league_id SET NOT NULL,
  ALTER COLUMN league_id SET DEFAULT public.current_league_id(),
  ADD CONSTRAINT household_players_league_id_fkey FOREIGN KEY (league_id) REFERENCES public.leagues(id) ON DELETE RESTRICT;
CREATE INDEX household_players_league_id_idx ON public.household_players (league_id);

ALTER TABLE public.player_medical ADD COLUMN league_id uuid;
UPDATE public.player_medical pm
   SET league_id = (SELECT p.league_id FROM public.players p WHERE p.id = pm.player_id);
ALTER TABLE public.player_medical
  ALTER COLUMN league_id SET NOT NULL,
  ALTER COLUMN league_id SET DEFAULT public.current_league_id(),
  ADD CONSTRAINT player_medical_league_id_fkey FOREIGN KEY (league_id) REFERENCES public.leagues(id) ON DELETE RESTRICT;
CREATE INDEX player_medical_league_id_idx ON public.player_medical (league_id);

DO $$
DECLARE bad int;
BEGIN
  SELECT (SELECT count(*) FROM public.guardians WHERE league_id IS NULL)
       + (SELECT count(*) FROM public.guardian_households WHERE league_id IS NULL)
       + (SELECT count(*) FROM public.household_players WHERE league_id IS NULL)
       + (SELECT count(*) FROM public.player_medical WHERE league_id IS NULL)
       + (SELECT count(*) FROM public.league_players WHERE league_id IS NULL)
    INTO bad;
  IF bad > 0 THEN RAISE EXCEPTION 'league_id backfill left % NULL rows', bad; END IF;
END $$;

-- =========================================================================
-- 3. player_medical PK: (player_id) -> (league_id, player_id)
--    No FK references player_medical (verified), safe to swap.
-- =========================================================================
ALTER TABLE public.player_medical DROP CONSTRAINT player_medical_pkey;
ALTER TABLE public.player_medical ADD PRIMARY KEY (league_id, player_id);

-- =========================================================================
-- 4. Unique indexes on parents (league_id, id)
-- =========================================================================
CREATE UNIQUE INDEX seasons_league_id_id_key    ON public.seasons    (league_id, id);
CREATE UNIQUE INDEX programs_league_id_id_key   ON public.programs   (league_id, id);
CREATE UNIQUE INDEX divisions_league_id_id_key  ON public.divisions  (league_id, id);
CREATE UNIQUE INDEX teams_league_id_id_key      ON public.teams      (league_id, id);
CREATE UNIQUE INDEX households_league_id_id_key ON public.households (league_id, id);
CREATE UNIQUE INDEX guardians_league_id_id_key  ON public.guardians  (league_id, id);

-- =========================================================================
-- 5. Drop single-column FKs
-- =========================================================================
ALTER TABLE public.divisions           DROP CONSTRAINT fk_divisions_program;
ALTER TABLE public.divisions           DROP CONSTRAINT divisions_program_id_fkey;
ALTER TABLE public.programs            DROP CONSTRAINT programs_season_id_fkey;
ALTER TABLE public.teams               DROP CONSTRAINT teams_division_id_fkey;
ALTER TABLE public.teams               DROP CONSTRAINT teams_program_id_fkey;
ALTER TABLE public.guardian_households DROP CONSTRAINT guardian_households_guardian_id_fkey;
ALTER TABLE public.guardian_households DROP CONSTRAINT guardian_households_household_id_fkey;
ALTER TABLE public.household_players   DROP CONSTRAINT household_players_household_id_fkey;
ALTER TABLE public.household_players   DROP CONSTRAINT household_players_player_id_fkey;
ALTER TABLE public.team_rosters        DROP CONSTRAINT team_rosters_team_id_fkey;
ALTER TABLE public.team_rosters        DROP CONSTRAINT team_rosters_player_id_fkey;
ALTER TABLE public.player_medical      DROP CONSTRAINT player_medical_player_id_fkey;

-- =========================================================================
-- 6. Per-pair violation guards, then composite FKs
-- =========================================================================
DO $$
DECLARE v text;
BEGIN
  SELECT string_agg(id::text, ',') INTO v FROM public.programs c
   WHERE season_id IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM public.seasons p WHERE p.league_id=c.league_id AND p.id=c.season_id);
  IF v IS NOT NULL THEN RAISE EXCEPTION 'programs->seasons cross-league rows: %', v; END IF;

  SELECT string_agg(id::text, ',') INTO v FROM public.divisions c
   WHERE program_id IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM public.programs p WHERE p.league_id=c.league_id AND p.id=c.program_id);
  IF v IS NOT NULL THEN RAISE EXCEPTION 'divisions->programs cross-league rows: %', v; END IF;

  SELECT string_agg(id::text, ',') INTO v FROM public.teams c
   WHERE division_id IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM public.divisions p WHERE p.league_id=c.league_id AND p.id=c.division_id);
  IF v IS NOT NULL THEN RAISE EXCEPTION 'teams->divisions cross-league rows: %', v; END IF;

  SELECT string_agg(id::text, ',') INTO v FROM public.teams c
   WHERE program_id IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM public.programs p WHERE p.league_id=c.league_id AND p.id=c.program_id);
  IF v IS NOT NULL THEN RAISE EXCEPTION 'teams->programs cross-league rows: %', v; END IF;

  SELECT string_agg(guardian_id::text||'/'||household_id::text, ',') INTO v FROM public.guardian_households c
   WHERE NOT EXISTS (SELECT 1 FROM public.guardians p WHERE p.league_id=c.league_id AND p.id=c.guardian_id);
  IF v IS NOT NULL THEN RAISE EXCEPTION 'guardian_households->guardians cross-league: %', v; END IF;

  SELECT string_agg(guardian_id::text||'/'||household_id::text, ',') INTO v FROM public.guardian_households c
   WHERE NOT EXISTS (SELECT 1 FROM public.households p WHERE p.league_id=c.league_id AND p.id=c.household_id);
  IF v IS NOT NULL THEN RAISE EXCEPTION 'guardian_households->households cross-league: %', v; END IF;

  SELECT string_agg(household_id::text||'/'||player_id::text, ',') INTO v FROM public.household_players c
   WHERE NOT EXISTS (SELECT 1 FROM public.households p WHERE p.league_id=c.league_id AND p.id=c.household_id);
  IF v IS NOT NULL THEN RAISE EXCEPTION 'household_players->households cross-league: %', v; END IF;

  SELECT string_agg(household_id::text||'/'||player_id::text, ',') INTO v FROM public.household_players c
   WHERE NOT EXISTS (SELECT 1 FROM public.league_players lp WHERE lp.league_id=c.league_id AND lp.player_id=c.player_id);
  IF v IS NOT NULL THEN RAISE EXCEPTION 'household_players->league_players missing membership: %', v; END IF;

  SELECT string_agg(id::text, ',') INTO v FROM public.team_rosters c
   WHERE NOT EXISTS (SELECT 1 FROM public.teams p WHERE p.league_id=c.league_id AND p.id=c.team_id);
  IF v IS NOT NULL THEN RAISE EXCEPTION 'team_rosters->teams cross-league rows: %', v; END IF;

  SELECT string_agg(id::text, ',') INTO v FROM public.team_rosters c
   WHERE NOT EXISTS (SELECT 1 FROM public.league_players lp WHERE lp.league_id=c.league_id AND lp.player_id=c.player_id);
  IF v IS NOT NULL THEN RAISE EXCEPTION 'team_rosters->league_players missing membership: %', v; END IF;

  SELECT string_agg(player_id::text, ',') INTO v FROM public.player_medical c
   WHERE NOT EXISTS (SELECT 1 FROM public.league_players lp WHERE lp.league_id=c.league_id AND lp.player_id=c.player_id);
  IF v IS NOT NULL THEN RAISE EXCEPTION 'player_medical->league_players missing membership: %', v; END IF;
END $$;

ALTER TABLE public.programs
  ADD CONSTRAINT programs_league_season_fkey FOREIGN KEY (league_id, season_id)
    REFERENCES public.seasons (league_id, id) ON DELETE RESTRICT;

ALTER TABLE public.divisions
  ADD CONSTRAINT divisions_league_program_fkey FOREIGN KEY (league_id, program_id)
    REFERENCES public.programs (league_id, id) ON DELETE CASCADE;

ALTER TABLE public.teams
  ADD CONSTRAINT teams_league_division_fkey FOREIGN KEY (league_id, division_id)
    REFERENCES public.divisions (league_id, id) ON DELETE RESTRICT,
  ADD CONSTRAINT teams_league_program_fkey  FOREIGN KEY (league_id, program_id)
    REFERENCES public.programs  (league_id, id) ON DELETE RESTRICT;

ALTER TABLE public.guardian_households
  ADD CONSTRAINT gh_league_guardian_fkey  FOREIGN KEY (league_id, guardian_id)
    REFERENCES public.guardians  (league_id, id) ON DELETE CASCADE,
  ADD CONSTRAINT gh_league_household_fkey FOREIGN KEY (league_id, household_id)
    REFERENCES public.households (league_id, id) ON DELETE CASCADE;

ALTER TABLE public.household_players
  ADD CONSTRAINT hp_league_household_fkey FOREIGN KEY (league_id, household_id)
    REFERENCES public.households      (league_id, id)        ON DELETE CASCADE,
  ADD CONSTRAINT hp_league_player_fkey    FOREIGN KEY (league_id, player_id)
    REFERENCES public.league_players  (league_id, player_id) ON DELETE CASCADE;

ALTER TABLE public.team_rosters
  ADD CONSTRAINT tr_league_team_fkey   FOREIGN KEY (league_id, team_id)
    REFERENCES public.teams           (league_id, id)        ON DELETE CASCADE,
  ADD CONSTRAINT tr_league_player_fkey FOREIGN KEY (league_id, player_id)
    REFERENCES public.league_players  (league_id, player_id) ON DELETE CASCADE;

ALTER TABLE public.player_medical
  ADD CONSTRAINT pm_league_player_fkey FOREIGN KEY (league_id, player_id)
    REFERENCES public.league_players (league_id, player_id) ON DELETE CASCADE;

-- =========================================================================
-- 7. Split players policies (INSERT admin-only w/o membership; SELECT/UPDATE/DELETE require membership).
--    Then drop players.league_id.
-- =========================================================================
DROP POLICY "Admins have full access to players" ON public.players;
DROP POLICY "Commissioners can view players in their programs" ON public.players;
DROP POLICY "Commissioners can update players in their programs" ON public.players;
DROP POLICY "Parents can view their own children" ON public.players;

CREATE POLICY "Admins insert players"
  ON public.players FOR INSERT
  WITH CHECK ((SELECT public.has_role(auth.uid(),'admin')));

CREATE POLICY "Admins select players in their league"
  ON public.players FOR SELECT
  USING (
    (SELECT public.has_role(auth.uid(),'admin'))
    AND EXISTS (SELECT 1 FROM public.league_players lp
                 WHERE lp.player_id = players.id
                   AND lp.league_id = (SELECT public.current_league_id())));

CREATE POLICY "Admins update players in their league"
  ON public.players FOR UPDATE
  USING (
    (SELECT public.has_role(auth.uid(),'admin'))
    AND EXISTS (SELECT 1 FROM public.league_players lp
                 WHERE lp.player_id = players.id
                   AND lp.league_id = (SELECT public.current_league_id())))
  WITH CHECK (
    (SELECT public.has_role(auth.uid(),'admin'))
    AND EXISTS (SELECT 1 FROM public.league_players lp
                 WHERE lp.player_id = players.id
                   AND lp.league_id = (SELECT public.current_league_id())));

CREATE POLICY "Admins delete players in their league"
  ON public.players FOR DELETE
  USING (
    (SELECT public.has_role(auth.uid(),'admin'))
    AND EXISTS (SELECT 1 FROM public.league_players lp
                 WHERE lp.player_id = players.id
                   AND lp.league_id = (SELECT public.current_league_id())));

CREATE POLICY "Commissioners can view players in their programs"
  ON public.players FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.league_players lp
             WHERE lp.player_id = players.id
               AND lp.league_id = (SELECT public.current_league_id()))
    AND EXISTS (SELECT 1 FROM public.commissioner_assignments ca
                 WHERE ca.user_id = auth.uid()
                   AND ca.program_id = players.program_id
                   AND (ca.division_id IS NULL OR ca.division_id = players.division_id)));

CREATE POLICY "Commissioners can update players in their programs"
  ON public.players FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.league_players lp
             WHERE lp.player_id = players.id
               AND lp.league_id = (SELECT public.current_league_id()))
    AND EXISTS (SELECT 1 FROM public.commissioner_assignments ca
                 WHERE ca.user_id = auth.uid()
                   AND ca.program_id = players.program_id
                   AND (ca.division_id IS NULL OR ca.division_id = players.division_id)));

CREATE POLICY "Parents can view their own children"
  ON public.players FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.league_players lp
             WHERE lp.player_id = players.id
               AND lp.league_id = (SELECT public.current_league_id()))
    AND parent_email = (SELECT public.get_user_email())
    AND ((auth.jwt() ->> 'is_anonymous')::boolean IS DISTINCT FROM true)
    AND EXISTS (SELECT 1 FROM auth.users u
                 WHERE u.id = auth.uid() AND u.email_confirmed_at IS NOT NULL));

ALTER TABLE public.players DROP CONSTRAINT players_league_id_fkey;
DROP INDEX public.players_league_id_idx;
ALTER TABLE public.players ALTER COLUMN league_id DROP DEFAULT;
ALTER TABLE public.players DROP COLUMN league_id;

-- =========================================================================
-- 8. create_player_in_league: atomic player + membership insert, admin-only.
--    App code must use this instead of inserting into players directly.
-- =========================================================================
CREATE OR REPLACE FUNCTION public.create_player_in_league(_league_id uuid, _player jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
  payload jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN
    RAISE EXCEPTION 'not authorized: admin role required';
  END IF;
  IF _league_id IS NULL THEN
    RAISE EXCEPTION 'league_id required';
  END IF;

  payload := _player - 'id' - 'created_at' - 'updated_at';
  new_id := gen_random_uuid();
  payload := payload || jsonb_build_object('id', new_id);

  INSERT INTO public.players
  SELECT * FROM jsonb_populate_record(NULL::public.players, payload);

  INSERT INTO public.league_players (league_id, player_id, status)
  VALUES (_league_id, new_id, 'active');

  RETURN new_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_player_in_league(uuid, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_player_in_league(uuid, jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.create_player_in_league(uuid, jsonb) TO authenticated;

COMMIT;
