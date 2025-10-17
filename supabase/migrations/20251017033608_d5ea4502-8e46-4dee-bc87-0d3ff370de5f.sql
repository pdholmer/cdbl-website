-- Add new parent name columns
ALTER TABLE public.players 
  ADD COLUMN parent_first_name TEXT,
  ADD COLUMN parent_last_name TEXT;

-- Migrate existing data (split on first space)
UPDATE public.players 
SET 
  parent_first_name = SPLIT_PART(parent_guardian_name, ' ', 1),
  parent_last_name = CASE 
    WHEN POSITION(' ' IN parent_guardian_name) > 0 
    THEN SUBSTRING(parent_guardian_name FROM POSITION(' ' IN parent_guardian_name) + 1)
    ELSE parent_guardian_name
  END
WHERE parent_guardian_name IS NOT NULL;

-- Make new columns required after migration
ALTER TABLE public.players 
  ALTER COLUMN parent_first_name SET NOT NULL,
  ALTER COLUMN parent_last_name SET NOT NULL;

-- Create player_guardians table for multiple parents/guardians
CREATE TABLE public.player_guardians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT, -- 'mother', 'father', 'guardian', etc.
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.player_guardians ENABLE ROW LEVEL SECURITY;

-- Admin access policy
CREATE POLICY "Admins have full access to player guardians"
  ON public.player_guardians
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Parents can view their children's guardians
CREATE POLICY "Parents can view their children's guardians"
  ON public.player_guardians
  FOR SELECT
  USING (
    player_id IN (
      SELECT id FROM public.players WHERE parent_email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_player_guardians_updated_at
  BEFORE UPDATE ON public.player_guardians
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();