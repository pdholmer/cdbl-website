## Show Facility Names on Calendar, Street-Only on Event Details

### Background

Synced events from BlueSombrero arrive with verbose raw addresses like:
- `4w400 Stonecrest Drive,,Elgin,IL-60124 US`
- `12N475 Park St ,Burlington,IL-60109 US`
- `41W625 Russell Road,Elgin,IL-60124 US`

Right now those raw strings show everywhere — in the main calendar list, the upcoming-match cards, the featured carousel, and the event detail modal. The Google Maps link uses the same raw string.

### What changes

**Main calendar / list views** — show a short facility/field name instead of the address:
- Anything containing "stonecrest" → **Stonecrest Fields**
- "plato" / "russell rd" → **Plato Fields**
- "burlington fields" / "park st" / "12n475" → **Burlington Fields**
- Anything else → falls back to the street portion only (no city/state/zip)

**Event detail modal** — show only the street address (e.g. `4W400 Stonecrest Drive` or `225 Nesler Rd`). City/state/zip is implied and removed from the visible label. The Maps link still uses the original full string so it resolves accurately on Google Maps.

### Files touched

- **`src/utils/locationFormat.ts` (new)** — two helpers:
  - `getFacilityLabel(raw)` — returns "Stonecrest Fields" / "Plato Fields" / "Burlington Fields" / street-only fallback.
  - `getStreetAddress(raw)` — returns just the first comma-segment (the street).
- **`src/components/CalendarGrid.tsx`** — replace `{event.location}` with `{getFacilityLabel(event.location)}`.
- **`src/components/UpcomingMatchCard.tsx`** — same replacement.
- **`src/components/FeaturedEventsCarousel.tsx`** — same replacement.
- **`src/components/DivisionScheduleTable.tsx`** — same replacement (both display sites at lines 70 and 119).
- **`src/components/EventDetailModal.tsx`** — display `getStreetAddress(event.location)` as the visible button text; the `openInMaps` handler keeps using the original `event.location` for the Google Maps query.

No database, RLS, or sync changes needed — pure presentation.
