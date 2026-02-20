
## Create a Dedicated `/travel/registration` Page

### Overview
Extract all tryout/registration content from `Travel.tsx` into a new standalone `TravelRegistration.tsx` page, clean up the overview page, update all internal links and navigation, and register the new route.

### Files to Create
**`src/pages/TravelRegistration.tsx`** — new page containing:
- Hero section (gradient, matching the TravelFAQ style) titled "Tryouts & Registration"
- Sub-page navigation grid (linking back to Overview, Tournament Schedule, Travel FAQ) — same 3-card grid pattern as Travel.tsx
- All 4 tryout cards (2027 Season dates, What to Bring, Evaluation Process, Commitment Requirements)
- "Is Your Child Ready for Travel?" checklist block
- Contact footer (email Travel Coordinator)
- Header + Footer wrappers

### Files to Modify

**`src/pages/Travel.tsx`**
- Remove the entire `#tryouts` section (lines 151–255) — the Tryout Information section
- Remove the hero button `<a href="#tryouts">2027 Season Tryouts (Fall 2026)</a>` and replace with a `<Link to="/travel/registration">` button
- Update the sub-page navigation grid: change the "Tryouts & Registration" card link from `/travel#tryouts` → `/travel/registration`
- Update the CTA section at the bottom: change "View Tryout Information" button from `href="#tryouts"` → `<Link to="/travel/registration">`

**`src/App.tsx`**
- Import `TravelRegistration` from `./pages/TravelRegistration`
- Add route: `<Route path="/travel/registration" element={<TravelRegistration />} />`

**`src/components/DropdownNav.tsx`**
- Update the "Tryouts & Registration" link from `/travel#tryouts` → `/travel/registration`

### Technical Notes
- The new page will follow the exact same structural pattern as `TravelFAQ.tsx` (gradient hero, max-w-4xl content container, Card components for each section)
- All content is moved, not duplicated — the overview page will have no orphaned `#tryouts` anchor
- The `TravelFAQ.tsx` already has a "Register for Tryouts" button linking to `/travel/registration` (line 231) — this will now resolve correctly
