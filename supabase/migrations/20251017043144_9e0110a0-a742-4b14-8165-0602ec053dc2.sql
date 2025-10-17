-- Drop the existing policy that incorrectly accesses auth.users
DROP POLICY IF EXISTS "Parents can view their children's guardians" ON public.player_guardians;

-- Create a corrected policy using the security definer function
CREATE POLICY "Parents can view their children's guardians" 
ON public.player_guardians 
FOR SELECT 
USING (
  player_id IN (
    SELECT id 
    FROM public.players 
    WHERE parent_email = get_user_email()
  )
);