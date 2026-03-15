
-- Fix: Replace the overly permissive "Public can view invitation by token" policy
-- with one that only allows viewing a specific invitation by its token
DROP POLICY IF EXISTS "Public can view invitation by token" ON public.coach_invitations;

-- Create a security definer function to look up an invitation by token
CREATE OR REPLACE FUNCTION public.get_invitation_by_token(_token uuid)
RETURNS SETOF public.coach_invitations
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT * FROM public.coach_invitations
  WHERE token = _token
    AND status = 'pending'
    AND expires_at > now();
$$;
