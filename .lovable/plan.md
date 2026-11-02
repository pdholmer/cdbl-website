# Prompt 4 follow-ups and Prompt 5: parent Home (/household)

Layout and styling only. No data queries, auth, guards, RLS, functions, payments or database changes.

## Stop-and-say items (please decide before approval)

1. **The page has no registration, forms or payment data.** The Household page loads only: the household record, guardians, linked players (name, birth date), team placement, coaches and upcoming events. It loads nothing about registrations, signed forms, balances or payments. So "Sign now", "Due", "Unpaid" and "Paid" cannot be shown truthfully without a new data query. Building those would need a data change, which this step forbids. The plan below uses only what the page already loads, and lists the unknowable steps.
2. **There is no add-player flow for parents.** Players reach a household only when staff process a registration (the current empty state says so). The only "add" screens are admin tools. Option A (default): the dashed "+ Add" circle opens the public /registration page, which is how a child gets added today. Option B: leave the "+ Add" circle out until a real flow exists.

## Part 1: Prompt 4 follow-ups

- a) Measure the contrast of the light underlined links in dark mode on /login, /reset-password and the two-step screens. Report the ratio. If it falls below 4.5:1, lighten only the dark-mode link token.
- b) On /login, show the sign-in errors (wrong password, invalid email, missing password, email not confirmed, and resend/reset/sign-up failures) as destructive-token text inside the card, under the button, with `role="alert"`. The wording stays the same. The sign-in calls and branching stay exactly as they are; only the display changes from popup to inline text. Success messages ("Confirmation email sent") stay as popups. The error clears when the person edits a field.
- c) Re-run the edge-bar scan across signed-in pages (border-l/border-t accent classes, left/top accent pseudo-elements, inset box-shadow bars) and report any hits by file.

## Part 2: /household rebuild

### Header
- **Label:** "2027 season, In-House". Fixed text: the page loads no program per player, so it cannot be read from data.
- **Headline:** a count of open to-dos, for example "TWO THINGS TO DO". There is no deadline field in loaded data, so the headline won't name a date. Using the board's Dec 21 opening date would need it written into the page as fixed text, so tell me if you want "BEFORE DEC 21".
- **Fallback when nothing is open:** if there are players but no to-dos, the headline reads "YOU'RE ALL SET". If no players are linked yet, it reads "HI, {FIRST NAME}".

### To-dos (only from loaded data)

| To-do | Shows when | Source | Chip |
|---|---|---|---|
| Link your player | the household has no linked players | household_players (via the page's existing query) | Due (warning) |
| Add your address | household has no address line | households record | Due (warning) |
| Waiting for team placement | a player has no team | v_roster_family | Pending (neutral) |

Payment and form to-dos aren't shown (see stop item 1). "Paid" and "Unpaid" chip styles get built and tested, but nothing uses them yet.

### How "most important" is chosen
It's the first match in this fixed order: Link your player, then Add your address, then Waiting for team placement for the oldest player. That card gets the one `.card-flood` on the page: a small "MOST IMPORTANT" label, the task in Big Shoulders 24px, one sentence on why it matters, and a white pill button ("Add address" opens the existing edit sheet; "Start registration" opens /registration). A waiting-only card has no button. If there are no to-dos, the page has no flood card. The current blue next-event card becomes a normal textured card, so there's still at most one flood.

### Players row
- Each player is a 48px circle with initials in Big Shoulders and the name below in Barlow Semi Condensed, with a 44px or larger tap area. The selected player gets a CDBL Blue flood and a 2px ring. The first player is selected by default. The row scrolls sideways inside itself if it's too wide, never the page.
- The dashed "+ Add" circle follows stop item 2.
- Under the selected player, the numbered steps:
  1. Player info: Done (success) when the player is linked with a name and birth date.
  2. Program: Placed (success) with the team name when the player is on a team. Otherwise Not yet (neutral).
  3. Forms: **can't be known yet.** It shows a neutral "Not tracked yet" chip.
  4. Pay: **can't be known yet.** It shows a neutral "Not tracked yet" chip.

### Sections kept
Family (#family), Guardians, team and coach (#team, on the first player), and Upcoming (#upcoming). The ids, contact buttons, edit sheet, loading skeleton, error card and Try again button stay unchanged. The page's own "Hi, name" heading moves into the shell headline, so the title isn't repeated.

### Empty states (one specific sentence)
- No players: "No players are linked yet; they appear here once a registration is processed."
- No events: "No games or practices are scheduled for your players yet."
- No coach: unchanged.

## Acceptance checks
- Light and dark at 390, 768 and 1280 widths.
- No sideways scroll.
- Text contrast of 4.5:1 or better, including the links from a).
- Tap targets of 44px or larger.
- At most one flood card.
- No edge accent bars.
- The #upcoming, #family and #team tab links still scroll to their sections.

## Technical details
Files changed:
- `src/pages/Login.tsx`: inline error state.
- `src/index.css`: dark link token (only if needed), player-picker styles and the dashed add circle.
- `src/pages/Household.tsx`: new layout and a to-do list built from the existing `useHouseholdOverview` data.
- `src/components/family/StatusChip.tsx`: warning, destructive and success tones, if they're missing.
- `src/components/family/PlayerPicker.tsx`: new, display only.
- `roadmap.md`: note that forms and payment status are waiting on a data source.

`useHouseholdOverview.ts`, `AppShell` logic, the routes and all backend files stay untouched.
