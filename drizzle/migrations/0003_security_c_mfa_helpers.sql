CREATE OR REPLACE FUNCTION public.requires_mfa(_user_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin','registrar','treasurer','background_checks'))
$$;
CREATE OR REPLACE FUNCTION public.mfa_satisfied() RETURNS boolean
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT NOT public.requires_mfa(auth.uid()) OR coalesce(auth.jwt()->>'aal','aal1') = 'aal2'
$$;
REVOKE EXECUTE ON FUNCTION public.requires_mfa(uuid), public.mfa_satisfied() FROM anon, public;
GRANT  EXECUTE ON FUNCTION public.requires_mfa(uuid), public.mfa_satisfied() TO authenticated;