# Email architecture

- Authentication emails use the scaffolded `createAuthEmailHandler` and version-pinned email SDK; keep the scaffolded hook unchanged so signature verification and dispatch remain compatible.
- The existing family notification digest and Resend webhook are outside the legacy Lovable email queue and remain unchanged; preserve their independent approval, digest, and recipient tracking behavior.
- Do not add an email events receiver unless replacing a legacy suppression/unsubscribe handler or implementing a requested outcome reaction; this update removes neither handler.
- Two-step sign-in: which roles need it is decided only by the database function `requires_mfa`; `ProtectedRoute` sends those users to /two-step/setup or /two-step/verify. Why: one source of truth that the database rules can also enforce.
- Where a user lands after sign-in is decided only in `src/lib/landing.ts` (staff roles -> /admin, coach -> /coach, else /household). Why: one place to change routing; /admin and /coach guards still run the two-step check.
- Which admin sections a role may open is decided only in `src/lib/adminAccess.ts`; the database policies are the real enforcement and the UI map must never grant more than they do. Why: hidden menus are not security.
- Public program lists come only from the `programs` function, filtered to the current season. Why: next season's programs must never show beside this season's.
- Site assistant conversations and help requests are written only by the ai-assistant and submit-assistant-request backend functions (service role) and read only by admin and board_member. Why: signed-out visitors use the assistant, so the browser must never write or read these logs directly.
