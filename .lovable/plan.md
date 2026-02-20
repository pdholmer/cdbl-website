
# Remove Rockets Travel Teams Sub-Page

## What's Being Removed

The `/travel/teams` route and its page (`TravelTeams.tsx`) are entirely placeholder content — fake coach names, fabricated records, and stats that don't exist yet. Removing it cleanly requires three coordinated changes.

## Audit of All References

**Route**: `src/App.tsx` line 107 — `<Route path="/travel/teams" element={<TravelTeams />} />`
**Import**: `src/App.tsx` line 27 — `import TravelTeams from "./pages/TravelTeams";`
**File**: `src/pages/TravelTeams.tsx` — the full page component

**Navigation references to `/travel/teams`**:
- `src/components/DropdownNav.tsx` — "Rockets Teams" item links to `/travel/teams`
- `src/pages/Travel.tsx` — "View Rockets Teams" buttons link to `/travel/teams` (2 instances in hero and CTA sections)

The pending Travel page cleanup (from the previous approved plan, not yet implemented) was also going to add a sub-page nav card pointing to `/travel/teams`. That card should point somewhere else or be omitted entirely.

## Changes to Make

### 1. `src/pages/TravelTeams.tsx` — Delete the file
The entire page is placeholder data. It goes away entirely.

### 2. `src/App.tsx` — Remove route and import
- Remove line 27: `import TravelTeams from "./pages/TravelTeams";`
- Remove line 107: `<Route path="/travel/teams" element={<TravelTeams />} />`

### 3. `src/components/DropdownNav.tsx` — Remove "Rockets Teams" menu item
Remove the `<DropdownMenuItem>` block linking to `/travel/teams` from the Travel Program dropdown. The remaining dropdown items (Overview, Tryouts & Registration, Tournament Schedule, Travel FAQ) still provide complete navigation.

### 4. `src/pages/Travel.tsx` — Remove "View Rockets Teams" buttons (2 instances)
- **Hero section**: Remove the "View Rockets Teams" `<Button>` that links to `/travel/teams`
- **CTA section** (bottom of page): Remove the "View Rockets Teams" `<Button>` that links to `/travel/teams`

Both of these are secondary buttons alongside the primary "2027 Season Tryouts" CTA, so removing them leaves the primary CTA intact.

## Note on the Pending Travel Page Plan

The previously approved (but not yet implemented) Travel page plan included a sub-page nav grid with a card for "Rockets Teams → `/travel/teams`". That card will be omitted from the nav grid since the page is being removed. The grid will have 3 cards instead of 4:
- Tryouts & Registration → `/travel#tryouts`
- Tournament Schedule → `/travel/schedule`
- Travel FAQ → `/travel/faq`

## Files to Modify
- `src/pages/TravelTeams.tsx` — **deleted**
- `src/App.tsx` — Remove TravelTeams import and route
- `src/components/DropdownNav.tsx` — Remove "Rockets Teams" dropdown item
- `src/pages/Travel.tsx` — Remove both "View Rockets Teams" buttons + implement all previously approved changes (logos, team cards, nav grid, content fixes) with the 3-card nav grid instead of 4

## New Files
None.
