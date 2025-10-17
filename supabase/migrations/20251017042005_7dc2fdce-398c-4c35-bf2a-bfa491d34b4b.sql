-- Drop the incorrect policy
DROP POLICY IF EXISTS "Parents can view their children's guardians" ON public.player_guardians;

-- Recreate with correct auth.users reference
CREATE POLICY "Parents can view their children's guardians"
ON public.player_guardians
FOR SELECT
USING (
  player_id IN (
    SELECT id FROM public.players 
    WHERE parent_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);