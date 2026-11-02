-- Migration A: email two-step sign-in (service-role-only tables + helpers). No policy changes.
CREATE TABLE public.mfa_email_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL REFERENCES public.leagues(id),
  user_id uuid NOT NULL,
  code_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  superseded_at timestamptz
);
CREATE INDEX mfa_email_challenges_user_created_idx ON public.mfa_email_challenges (user_id, created_at DESC);

CREATE TABLE public.mfa_verified_sessions (
  session_id uuid PRIMARY KEY,
  league_id uuid NOT NULL REFERENCES public.leagues(id),
  user_id uuid NOT NULL,
  method text NOT NULL CHECK (method IN ('email_code','trusted_device')),
  verified_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);
CREATE INDEX mfa_verified_sessions_user_idx ON public.mfa_verified_sessions (user_id);

CREATE TABLE public.mfa_trusted_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL REFERENCES public.leagues(id),
  user_id uuid NOT NULL,
  token_hash text NOT NULL UNIQUE,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  last_used_at timestamptz,
  revoked_at timestamptz
);
CREATE INDEX mfa_trusted_devices_user_idx ON public.mfa_trusted_devices (user_id);

CREATE TABLE public.mfa_email_lockouts (
  user_id uuid PRIMARY KEY,
  league_id uuid NOT NULL REFERENCES public.leagues(id),
  failed_count integer NOT NULL DEFAULT 0,
  first_failed_at timestamptz,
  locked_until timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

REVOKE ALL ON public.mfa_email_challenges, public.mfa_verified_sessions, public.mfa_trusted_devices, public.mfa_email_lockouts FROM anon, authenticated, public;
GRANT ALL ON public.mfa_email_challenges, public.mfa_verified_sessions, public.mfa_trusted_devices, public.mfa_email_lockouts TO service_role;

ALTER TABLE public.mfa_email_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_verified_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_trusted_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_email_lockouts ENABLE ROW LEVEL SECURITY;
-- Intentionally no policies: only the service role (backend function) can read or write.

-- Caller-only fact: has THIS signed-in session passed the email code (or a trusted device)?
CREATE OR REPLACE FUNCTION public.email_mfa_session_valid()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL
    AND (auth.jwt()->>'session_id') IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.mfa_verified_sessions v
      JOIN auth.sessions s ON s.id = v.session_id AND s.user_id = v.user_id
      WHERE v.session_id = public.safe_uuid(auth.jwt()->>'session_id')
        AND v.user_id = auth.uid()
        AND v.expires_at > now()
    )
$$;
REVOKE ALL ON FUNCTION public.email_mfa_session_valid() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.email_mfa_session_valid() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.mfa_satisfied()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT NOT public.requires_mfa(auth.uid())
      OR coalesce(auth.jwt()->>'aal','aal1') = 'aal2'
      OR public.email_mfa_session_valid()
$$;