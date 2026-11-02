# Plan: email code replaces the authenticator app for two-step sign-in

Plan only. Nothing below runs until Paul writes "approved" in chat. Clicking Approve on this card does not count.

## What I checked first (read-only)

- `requires_mfa(user)` is true for admin, registrar, treasurer, background_checks, commissioner, board_member. Commissioner is on that list too.
- `mfa_satisfied()` = "role doesn't need two-step, OR the sign-in token says aal2".
- **No database rule calls `mfa_satisfied()` today.** Two-step is currently enforced only by the screen guard. Admin data is protected by roles, not by the second step. That is the same on preview and live.
- One verified authenticator-app enrollment exists. There are no email factors, because the sign-in system has no email factor.
- The sender domain `notify.cdbaseball.org` is verified and app email is set up.

## 1. What users will see

```text
Password  ->  "We emailed a 6-digit code to p•••@gmail.com"
              [ 6 boxes ]  [ ] Trust this device for 30 days
              Send a new code (works after 60 s)
              Use authenticator app instead   (only shown if one is enrolled)
          ->  role-aware landing (unchanged)
```

Rules, all checked on the server:
- A code expires 10 minutes after it is sent.
- Only the latest code is valid. Sending a new code cancels the old one.
- 5 wrong tries cancel the code and lock that account's email codes for 15 minutes, matching the existing 15-minute sign-in lockout.
- You can ask for a new code once every 60 seconds, and at most 10 times an hour.
- "Trust this device" stores a random device token in the browser. For 30 days, signing in on that browser skips the code. Signing out does not clear it. "Forget this device" and an admin "revoke all devices" do.

## 2. How the database keeps admin data protected

Every sign-in token already carries a `session_id`. The sign-in system signs the token, so the browser cannot change it.

- New table `mfa_verified_sessions(session_id, user_id, method, expires_at)`. Only the backend function (service role) can write to it. Signed-in users can't insert, update or read it.
- The function adds a row only after the code checks out. It takes `session_id` and `user_id` from the caller's verified token, never from the request body.
- `mfa_satisfied()` becomes: role doesn't need it, OR the token is aal2 (authenticator app), OR a row exists for this exact `session_id` and user that hasn't expired **and** that session is still live in the sign-in system. Signing out or a revoked session ends it at once.

Can someone forge or skip it?
- Edit the token's session_id: no. The token is signed, and a changed token is rejected.
- Insert a row themselves: no. They have no write grant and there is no policy that allows it.
- Reuse a verified session after signing out: no, because of the live-session check.
- Guess codes: 5 tries per code, 10 sends an hour. That works out to about 50 guesses an hour against 1,000,000 possible codes.
- Steal a trusted-device token: together with the password, that skips the code for up to 30 days. This is the trade-off of "trust this device." The token is stored hashed, and admins can revoke it.
- **Skipping the screen:** today that only skips a check in the screen, because no database rule requires two-step yet. Step 6 below adds the `mfa_satisfied()` requirement to admin-only data. It is a separate approval because it touches existing rules. Your 2027 rules say not to change a policy unless the prompt names it, so I will list each one by name first.

## 3. How codes are stored

- Stored as HMAC-SHA256 of the code plus a server-only secret ("pepper"), never as plain text. A plain hash of a 6-digit code can be cracked in under a second, so the secret matters.
- The code and trusted-device tables have RLS on, no policies, and all access revoked from anon and authenticated. Only the service role can read them.
- Codes are compared in constant time. Used and expired rows are cleared by the existing daily cleanup job pattern after 7 days.

## 4. Email delivery, preview vs live

- Preview and the live site share one backend, and the code is sent by a backend function. So sending works from both. It doesn't depend on which website you're on. I'll confirm with a real test to Paul's inbox in the build step.
- **Important limit:** app emails always carry an unsubscribe footer. If an admin ever unsubscribes, every app email to that address stops, including sign-in codes. Mitigation: the function reports "this address can't receive codes", the screen offers the authenticator app if one is enrolled, and an admin can clear the block. Password-reset emails use a separate path and keep working.
- If email fails while you are on preview, an admin who has the authenticator app can still use it. That is a reason to keep it (point 5).

## 5. Existing authenticator enrollments

Recommended: keep the authenticator app as an optional alternative.
- The one existing enrollment keeps working: aal2 still passes `mfa_satisfied()`.
- `/two-step/setup` is no longer forced. It moves to an optional "Set up an authenticator app" link on the code screen and in account settings.
- `/two-step/verify` becomes the email-code screen, with "Use authenticator app instead" shown when the account has one.

## 6. Exact SQL (to be applied only after "approved")

### Migration A: tables, helper, new `mfa_satisfied`

```sql
CREATE TABLE public.mfa_email_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL REFERENCES public.leagues(id),
  user_id uuid NOT NULL,
  session_id uuid NOT NULL,
  code_hash text NOT NULL,
  attempts int NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.mfa_email_challenges (user_id, created_at DESC);

CREATE TABLE public.mfa_verified_sessions (
  session_id uuid PRIMARY KEY,
  league_id uuid NOT NULL REFERENCES public.leagues(id),
  user_id uuid NOT NULL,
  method text NOT NULL CHECK (method IN ('email_code','trusted_device')),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.mfa_trusted_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL REFERENCES public.leagues(id),
  user_id uuid NOT NULL,
  token_hash text NOT NULL UNIQUE,
  label text,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.mfa_email_lockouts (
  user_id uuid PRIMARY KEY,
  league_id uuid NOT NULL REFERENCES public.leagues(id),
  locked_until timestamptz NOT NULL
);

REVOKE ALL ON public.mfa_email_challenges, public.mfa_verified_sessions,
  public.mfa_trusted_devices, public.mfa_email_lockouts FROM anon, authenticated;
GRANT ALL ON public.mfa_email_challenges, public.mfa_verified_sessions,
  public.mfa_trusted_devices, public.mfa_email_lockouts TO service_role;
ALTER TABLE public.mfa_email_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_verified_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_trusted_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_email_lockouts ENABLE ROW LEVEL SECURITY;
-- No policies on purpose: service role only.

-- Caller-scoped: reads only the caller's own session from the signed token.
CREATE OR REPLACE FUNCTION public.email_mfa_session_valid()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.mfa_verified_sessions v
    JOIN auth.sessions s ON s.id = v.session_id AND s.user_id = v.user_id
    WHERE v.session_id = nullif(auth.jwt()->>'session_id','')::uuid
      AND v.user_id = auth.uid()
      AND v.expires_at > now())
$$;
REVOKE ALL ON FUNCTION public.email_mfa_session_valid() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.email_mfa_session_valid() TO authenticated;

CREATE OR REPLACE FUNCTION public.mfa_satisfied()
RETURNS boolean LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT NOT public.requires_mfa(auth.uid())
      OR coalesce(auth.jwt()->>'aal','aal1') = 'aal2'
      OR public.email_mfa_session_valid()
$$;
```

`league_id` is filled from `current_league_id()` by the function, as your 2027 rules require. A verified session lasts 12 hours, or until sign-out, whichever comes first.

### Migration B (separate approval): enforce on admin data

For each admin-only policy, add `AND public.mfa_satisfied()`. I will list every policy by name and show its before and after SQL. Nothing changes without its name on the approved list.

### Secret

Generate `MFA_CODE_PEPPER`: a random server-only secret. It is never shown and never stored in code.

## Undo

- Code: restore `mfa.ts`, `ProtectedRoute`, the two-step pages and the login screen. Delete the function and the email template, then redeploy.
- Migration A, rolled back in this order:
  - restore the old `mfa_satisfied()` body (shown above under "What I checked first")
  - `DROP FUNCTION email_mfa_session_valid()`
  - drop the 4 new tables
- Migration B: put back the original policy text, which will be captured before the change.
- Secret: delete `MFA_CODE_PEPPER`.

## Files that would change

- New backend function `supabase/functions/mfa-email-code/` with actions `send`, `verify`, `trust_check` and `forget_device`, plus `deno.json` and its `config.toml` entry
- New email template `supabase/functions/_shared/transactional-email-templates/sign-in-code.tsx` and its entry in `registry.ts`
- `src/lib/mfa.ts`: the status also counts the email session and checks the trusted device
- `src/components/ProtectedRoute.tsx`: sends everyone needing two-step to `/two-step/verify`, never forced to setup
- `src/pages/TwoStepVerify.tsx`: rebuilt as the email-code screen at 390/768/1440, with an authenticator fallback
- `src/pages/TwoStepSetup.tsx`: becomes an optional authenticator-app setup
- `src/pages/Login.tsx`: sign-out also clears this session's verification
- `src/lib/mfa.test.ts`: tests for the 10-minute expiry, the 5-try lockout, the 60-second resend and latest-code-only
- `AGENTS.md`: one rule saying two-step is passed by an aal2 token or a server-verified email session

## Risks

1. **The email inbox becomes the single point of failure.** A password reset and the sign-in code go to the same inbox, so whoever controls the inbox controls the account. Mitigations:
   - ask staff to protect their own email account with two-step
   - keep the authenticator app as an optional stronger path
   - an admin alert email when a trusted device is added
   - no "trust this device" checkbox on shared computers, shown as a hint on screen
2. An unsubscribe or bounce blocks codes for that address. See point 4.
3. Stolen device token plus password skips the code for 30 days. Admins can revoke it, and it expires on its own.
4. Email delays: codes can arrive late or land in spam. The 10-minute window and the resend button help.
5. Until Migration B is approved, two-step protects the screens, not the data. That is true today too.
6. Reading `auth.sessions` from a helper depends on how the sign-in system stores sessions. I'll test it with a rolled-back sign-out in the build step.

## Verification during the build

- Rolled-back tests as an admin:
  - no session row: `mfa_satisfied` is false
  - row present: true
  - session deleted: false
  - aal2 token: true
  - signed-in users can't select from or insert into the new tables
  - anon gets permission denied
- Run the function against all four rules: expiry, latest code only, 5-try lockout, 60-second resend.
- Send a real code to Paul's inbox from preview.
- Screens checked at 390, 768 and 1440 px wide.

## Questions for Paul

1. Is a 12-hour verified session OK, or should it be shorter?
2. Keep the authenticator app as an optional alternative? Recommended: yes.
3. Should commissioners also get the email code? They are on the two-step list today.
