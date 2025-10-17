-- Add team_name field to players table for storing team designations
ALTER TABLE public.players
ADD COLUMN team_name TEXT;

COMMENT ON COLUMN public.players.team_name IS 'Team designation: MLB team names for In-House, Blue/White/Gray for Travel';
