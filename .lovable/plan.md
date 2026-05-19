## 1. Pets policy (Fields page)

In `src/pages/Fields.tsx`, the "Visitor Information" card currently says:
> Pets must be leashed at all times

Replace that single bullet with a clearer, facility-specific policy:

- **No pets at Plato Fields** (per facility rules).
- **Pets allowed at Stonecrest and Burlington Central**, leashed at all times.
- **No pets at any facility during tournaments**, regardless of location.

Implemented as three short bullets inside the existing Visitor Information list (same styling, no layout changes).

## 2. Remove "Registration Now Open" messaging (mid-season)

We're mid-season, so anywhere the site advertises 2026 registration as currently open needs to be removed or rephrased to future-tense / "check back later".

### Pages to update

**`src/pages/InHouseTeams.tsx`** (top of the page, lines ~26-37)
- Remove the entire blue "2026 Registration Now Open!" banner (heading + Early/Regular/Late dates + "Register for In-House" button).
- Replace with a short neutral mid-season note: *"The 2026 season is underway. Registration for 2027 will open later this year — check back for dates."*

**`src/pages/Teams.tsx`** (lines ~29-37)
- Same banner exists here. Apply the same removal + neutral note replacement.

**`src/pages/InHouseTeams.tsx`** (bottom MLB section, line ~208)
- The CTA `Register for In-House Baseball` implies open registration. Change to `View All Teams` linking to `/teams`, or remove the button entirely. (Will go with relabel → `Learn About In-House` linking to `/in-house`.)

**`src/pages/NewToCDBL.tsx`**
- Line 49 hidden print checklist: keep (it's a 2026-season checklist artifact, dates are historical reference).
- Line 106 timeline copy "Early registration opens December 1st" — this is the timeline page describing the annual cycle; leave as written (forward-looking, generic).
- Line 347 `Register Now` button → relabel to `Registration Info` (page itself is evergreen).

**`src/pages/Schedule.tsx`** line 458
- Calendar item "Registration Opens — Dec 1, 2025" is a past date in a future-events list. Remove that item.

**`src/data/contentIndex.ts`** lines 54 and 72
- Remove the phrase "2026 Registration Now Open" / "2026 Registration Now Open" from the search index content strings so site search stops surfacing it.

### Not touched
- `RegistrationSection` on the homepage: cards say "Learn More" / "View Tryout Info" — no claim that registration is open. Leave as-is.
- Admin pages (`ProgramEdit`, `Programs`) — these are the toggle controls for the `registration_open` flag; admins should flip those in the backend separately. Out of scope for this content fix.
- `ChatAssistant` suggested prompt "When does registration open?" — still a valid question, leave.

## Technical notes
- All edits are content-only in `.tsx` and `.ts` data files. No schema, no new components, no styling system changes.
- Will use `code--line_replace` for surgical edits on each file.
