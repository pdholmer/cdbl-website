DROP INDEX public.programs_type_key;
CREATE UNIQUE INDEX programs_league_type_season_key
  ON public.programs (league_id, type, season_id) NULLS NOT DISTINCT;