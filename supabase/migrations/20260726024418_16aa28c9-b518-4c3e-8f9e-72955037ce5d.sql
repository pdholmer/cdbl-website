ALTER TABLE public.seasons DROP CONSTRAINT IF EXISTS seasons_year_key;
CREATE UNIQUE INDEX IF NOT EXISTS seasons_league_year_key ON public.seasons (league_id, year);