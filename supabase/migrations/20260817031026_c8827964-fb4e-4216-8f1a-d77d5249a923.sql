CREATE POLICY "Coaches view league_players for their players"
ON public.league_players
FOR SELECT
TO authenticated
USING (
  league_id = (SELECT public.current_league_id())
  AND public.is_coach_of_player(player_id)
);

CREATE POLICY "Commissioners view league_players in their scope"
ON public.league_players
FOR SELECT
TO authenticated
USING (
  league_id = (SELECT public.current_league_id())
  AND EXISTS (
    SELECT 1 FROM public.registrations r
    WHERE r.player_id = league_players.player_id
      AND public.is_commissioner_for(auth.uid(), r.program_id, r.division_id)
  )
);

REVOKE ALL ON public.league_players FROM anon;
GRANT SELECT ON public.league_players TO authenticated;