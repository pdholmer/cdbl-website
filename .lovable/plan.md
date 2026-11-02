# Prompt 6: registration "builder" — findings and plan

## What the registration flow is today

**Files**
- `src/pages/Registration.tsx` (/registration, public, behind the page-visibility switch)
- `src/pages/TravelRegistration.tsx` (/travel/registration, public)
- `src/components/RegistrationSection.tsx` (home page teaser)
- `/in-house/registration` only redirects to /registration

**Real steps:** none. /registration is an information page that says "2026 Registration is Closed". It shows season dates, a per-division fee list (read from the programs and divisions tables), a "what's included" list, an In-House vs Travel comparison table, FAQs, and links to Schedule, Teams and Volunteer. Travel tryouts and travel coach sign-up are outside links to Sports Connect (bluesombrero.com).

**Signed-in user or household:** not used at all. No form, no player picker, no validation, no fee calculation, no forms/waivers, no payment step. A backend sign-up function (`register-player`) exists, but no page calls it.

## Where the brief does not match

| Brief | Reality | What I'd do instead |
|---|---|---|
| Steps Player, Program, Forms, Pay | No steps exist | Build nothing step-based now (it needs list B) |
| "Keep every validation, fee calculation, payment step" | There are none to keep | Nothing to preserve; fees are display-only |
| Player round pickers | Page has no access to the family's players | Needs sign-in and household (list B) |
| Program chips from the programs table | Table exists; types are in_house, travel, ihtt, travel_tryout, clinic | Usable read-only (list A) |
| Forms rows, next form as flood | No forms or waiver data or table in use | Needs a forms source (list B) |
| "3 OF 4" counter and "Sign the medical waiver" action | No step state | Needs list B |
| Phone action bar above the tab bar | /registration is public, so there is no tab bar | Fixed above the bottom edge instead, if built |

## List A: layout only (can build without touching data, auth, routes, guards, RLS or fees)

1. Restyle /registration in the builder look as a **season info stage**, using only what the page already reads:
   - Left (desktop/iPad) or top (phone): a stage with "2027 SEASON" label in blue, a big "REGISTRATION" headline in Big Shoulders 900, the status line from existing copy ("Closed" today), and a faint oversized "27" behind it. No progress bar, since there are no steps.
   - Right: program pill chips from the programs table. Choosing one only switches which fee list and details are shown below (local, on-screen choice, nothing saved). Selected chip is a blue flood.
   - Division fees as textured rows with the existing "TBD" fallback.
   - Travel tryout and coach links shown as the single flood card only when those links are set (as today).
   - FAQs and comparison kept, restyled as textured rows; the comparison table gets its own scroll on phones so the page never scrolls sideways.
2. Remove the gradient hero and the gradient travel banner (retired tokens), the pulsing green dot, and decorative icons (calendar, dollar, people, arrows on buttons).
3. Keep the public Header and Footer; the page stays public, same address, same page-visibility switch.
4. Decision for you: this page keeps the public look today. Making it use the Night Game Builder look needs its path added to the theme list, which is still visual only. I'd add it unless you want public pages untouched until Stage 3.

## List B: data or flow (not built until you approve separately)

1. Require sign-in for an actual registration and attach it to the user's household.
2. A parent add-player step (Household "+ Add" currently lands on the info page).
3. Reading the household's players for the round pickers.
4. Registration records per player, program and season, and a real step state for the progress bar and counter.
5. A forms/waivers source (medical waiver, etc.) with signed status.
6. Payment step (Stripe test mode per the Oct 31 decision) and paid/unpaid status.
7. Wiring or retiring the unused `register-player` backend function.
8. Opening/closing by date (Dec 21 2026 to Mar 6 2027) instead of the fixed "Closed" text.

Once B exists, the full builder (player stage, 4-segment progress, forms flood row, action bar) drops onto it.

## Acceptance for list A
Light and dark at 390, 768, 1280; no sideways scroll; 4.5:1 contrast; 44px tap targets; at most one flood card; no edge accent bars; no decorative icons; seal unaltered.

## Technical details
- Files changed in A: `src/pages/Registration.tsx`; possibly `src/lib/theme.ts` and `index.html` path lists (only if item A4 is approved); `roadmap.md` to log list B.
- Reuse existing `usePrograms`, `useAllPrograms`, `useFAQs`; no new queries. Program chips read `useAllPrograms` data already loaded.
- No changes to TravelRegistration in this pass unless you want it matched.
