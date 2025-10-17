-- Create security definer function to get user email
CREATE OR REPLACE FUNCTION public.get_user_email()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email::text FROM auth.users WHERE id = auth.uid();
$$;

-- Drop and recreate the problematic policy
DROP POLICY IF EXISTS "Parents can view their own children" ON public.players;

CREATE POLICY "Parents can view their own children"
ON public.players
FOR SELECT
TO authenticated
USING (parent_email = public.get_user_email());