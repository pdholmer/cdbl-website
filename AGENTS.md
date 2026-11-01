# Email architecture

- Authentication emails use the scaffolded `createAuthEmailHandler` and version-pinned email SDK; keep the scaffolded hook unchanged so signature verification and dispatch remain compatible.
- The existing family notification digest and Resend webhook are outside the legacy Lovable email queue and remain unchanged; preserve their independent approval, digest, and recipient tracking behavior.
- Do not add an email events receiver unless replacing a legacy suppression/unsubscribe handler or implementing a requested outcome reaction; this update removes neither handler.
- Two-step sign-in: which roles need it is decided only by the database function `requires_mfa`; `ProtectedRoute` sends those users to /two-step/setup or /two-step/verify. Why: one source of truth that the database rules can also enforce.
