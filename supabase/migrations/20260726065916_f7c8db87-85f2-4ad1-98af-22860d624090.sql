-- 1) Align is_cleared_coach() to the CHECK constraint's vocabulary.
--    coaches.background_check_status allows: pending | approved | expired | rejected.
--    The prior function tested = 'cleared', which the constraint forbids, so the gate
--    could never open. 'approved' is the value that means "background check passed".
CREATE OR REPLACE FUNCTION public.is_cleared_coach(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.coaches c
    WHERE c.user_id = _user_id
      AND c.background_check_status = 'approved'
      AND (c.background_check_expiry IS NULL OR c.background_check_expiry > now())
  )
$function$;

COMMENT ON FUNCTION public.is_cleared_coach(uuid) IS
  'Returns true when the caller-linked coach row has background_check_status = ''approved'' and (expiry IS NULL OR expiry > now()). Vocabulary must match coaches_background_check_status_check.';

-- 2) Grant hygiene: remove anon read from coaches. RLS already denies it (all policies
--    are auth.uid()-dependent), but the base grant should say what we mean.
REVOKE ALL ON public.coaches FROM anon;