# Prompt 3 cleanup and Night Game Builder Prompt 4 (sign-in screens)

Styling and layout only. No change to auth behavior, the mfa-email-code function, guards (ProtectedRoute), RLS or the database. Sign-in, sign-up, reset, resend, code send/verify, 60-second resend lock, trust-device and authenticator switch keep their current logic line for line; only the markup around them changes.

## Part 1: cleanup from Prompt 3

a) Duplicate headlines. Remove a page's own big title only where it repeats the lit-header title:
- Account: remove "Account" H1 (header says ACCOUNT).
- Training list: removed with the banner (b).
- Coach dashboard: header headline becomes "Coach dashboard"; remove its "Coach Dashboard" H1, keep the subtitle.
- Household: "Hi, Paul" is a greeting, not a repeat, so it stays. The error-state title stays.
- Situation detail: the situation's own title stays (header says TRAINING).
- Admin pages: the header shows the group ("Run the season"), and page H1s ("Players") are different words, so they stay. No admin page files change.
The lit-header headline becomes the page's heading for screen readers on Account, Training and Coach (it is already marked as a level-1 heading).

b) Training list: delete the full-width blue gradient banner. Header label becomes "CDBL TRAINING", headline "SITUATIONS TRAINER". The banner's sentence ("Know where to go before the ball is hit...") moves to a plain subtitle line at the top of the content. Uses a new optional `label` and `title` already supported by AppShell.

c) Coach "My Team" tab unchanged. Roadmap gets an open item: "Coach My Team tab: waiting on a real team section".

## Part 2: sign-in screens

### New frame
`AuthShell` is rebuilt: the shell's lit header (seal 36px as home link, label "CENTRAL DISTRICT BASEBALL LEAGUE", headline per screen) and the piping line, then one centered card (max 440px, full width on phone with 16px gutters). No sidebar, no tabs, no blue half-panel, no slogan. Card uses the card surface, mesh texture and 1px border; no flood (the Sign in button is the only blue).

To get the Night Game Builder colors and fonts, /login, /reset-password and /two-step/* are added to the signed-in look path list (theme.ts and the matching pre-paint list in index.html). This is a look-only switch; it does not change who can open those pages. Light/Dark/Device follows the saved device choice.

The lit header and piping styles move out of AppShell into a shared `LitHeader` component so both shells use the same one.

### /login (sign in)
Headline "SIGN IN". One card: email, password with show toggle (eye icon, kept), "Forgot password?" link (44px target), full-width CDBL Blue pill "Sign in". Below the card: "New to CDBL? Create account".
Other modes of the same page, same card:
- Create account: headline "CREATE ACCOUNT"; existing fields and 10-character rule unchanged.
- Forgot password / link sent: headline "RESET PASSWORD".
- Signup sent: "Check your email to confirm your account."
- Unconfirmed: "Check your email to confirm your account" with the existing resend button as a full-width outline pill.
- "Couldn't check your access" notice: plain text in the card with a "Try again" pill.

### /reset-password
Headline "NEW PASSWORD". Same card, existing fields, blue pill "Save password".

### /two-step/verify (emailed code)
Headline "CHECK YOUR EMAIL".
- "We emailed a 6-digit code to p•••@gmail.com". Masking is done on screen only: first letter of the name, three dots, then the domain. Whatever the function returns today is shown masked; the function itself is not touched.
- Six large digit boxes (56px tall, 48px wide on phone), paste fills all six (existing behavior of the code input, verified in testing).
- "The code expires in 10 minutes." on its own line.
- "Trust this device for 30 days" checkbox row, 44px.
- Blue pill "Continue" (unchanged logic, including auto-continue on the sixth digit).
- "Send a new code" text link, disabled with "Send a new code in 42s" until the existing 60-second timer ends.
- "Use authenticator app instead" link when the account has one (unchanged switch), and "Sign out".
Who sees this screen is still decided only by the database's `requires_mfa` list, which today covers admin, board member, commissioner, registrar, treasurer and background checks. Families never reach it. Your note says "admins and board only"; narrowing the list would be a database change, so it is not in this plan.

### /two-step/setup (optional authenticator)
Headline "AUTHENTICATOR APP". Same card: QR code on a white tile (so it scans in dark mode), manual key, code boxes, blue pill "Turn on", "Skip for now" link. Logic unchanged.

### /admin/login retired
The /admin/login route already renders the same sign-in page. It becomes a redirect to /login that keeps any `?next=` value. The few places that link to /admin/login (account menu on public pages, OAuth consent page) are pointed at /login. The guard file (ProtectedRoute) still redirects to /admin/login and is not edited; the redirect forwards those users to /login. After sign-in, landing stays as today (staff to /admin, coach to /coach, others to /household).

### Errors and icons
Errors are destructive-token text inside the card (dark mode uses the lighter red already measured at 10.3:1), no icons, no tinted boxes; the MFA help sentence stays below in muted text. Only the show-password eye, a back arrow (Situation-style "Back to sign in" in forgot mode) and the loading spinner on buttons remain.

## Acceptance checks
Light and dark at 390, 768 and 1280 for: sign in, create account, forgot, unconfirmed, reset, two-step verify, two-step setup, Account, Training, Coach. No sideways scroll, contrast at least 4.5:1 (including the lit-header label and muted text), every tap target at least 44px (scripted size check), no edge accent bars (scripted scan), paste of a 6-digit code fills all boxes, /admin/login?next=/admin lands on /login?next=/admin. Seal file unchanged.

## Files to change
- `src/components/AuthShell.tsx` (rebuilt frame)
- `src/components/shell/LitHeader.tsx` (new, shared header and piping)
- `src/components/shell/AppShell.tsx` (use LitHeader)
- `src/pages/Login.tsx` (markup only)
- `src/pages/ResetPassword.tsx` (markup only)
- `src/pages/TwoStepVerify.tsx` (markup and on-screen masking only)
- `src/pages/TwoStepSetup.tsx` (markup only)
- `src/pages/admin/Login.tsx` (already a redirect; kept) and `src/App.tsx` (/admin/login route uses it)
- `src/components/UserMenu.tsx`, `src/pages/OAuthConsent.tsx` (link target /login)
- `src/lib/theme.ts` and `index.html` (add /login, /reset-password to the look path list)
- `src/pages/Account.tsx`, `src/pages/Training.tsx`, `src/pages/coach/Dashboard.tsx` (Part 1)
- `src/index.css` (code boxes size, QR tile)
- `roadmap.md`, `AGENTS.md` (sign-in screens use AuthShell with the shared LitHeader)

Not changed: ProtectedRoute, mfa-email-code, `src/lib/mfa.ts` logic, landing rules, database.

Undo: revert these files.
