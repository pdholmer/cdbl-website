-- Add parent_relationship column to players table
ALTER TABLE public.players 
ADD COLUMN parent_relationship text;

-- Add a comment for documentation
COMMENT ON COLUMN public.players.parent_relationship IS 'Relationship of the primary parent/guardian to the player (e.g., Mother, Father, Grandmother, Legal Guardian)';