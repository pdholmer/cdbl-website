

## Add Location Filter to Schedule Page

Add a fifth dropdown — **Location** — alongside the existing Program / Division / Team filters on `/schedule`. It filters all event sources (games, practices, league events, external synced events) by the venue/location string shown on each event card.

### Approach

Locations come from a mix of sources:
- Native games/practices use `venue.name` from the `venues` table.
- League events and external synced events store free-form `location` strings (e.g. `"Prairie Knolls - Field 2"`).

Rather than restrict to the `venues` table only (which would miss external feed locations), the dropdown is built dynamically from the **distinct `location` values present in the currently loaded events**. This guarantees every option in the dropdown produces results, and it picks up new venues from the synced feed automatically.

### Changes

**1. `src/pages/Schedule.tsx`**
- Add `locationFilter` state (`string | 'all'`, default `'all'`).
- Derive `availableLocations` via `useMemo` over `allEvents`: collect unique non-empty `event.location` values, sort alphabetically.
- Add `locationFilter` to the `filteredEvents` filter chain (case-insensitive exact match against `event.location`).
- Include in `hasActiveFilters`, `handleClearAllFilters`, and `activeFilterText` (`📍 <location>`).
- Pass `selectedLocation`, `onLocationChange`, `availableLocations` props into `UnifiedScheduleToolbar`.

**2. `src/components/UnifiedScheduleToolbar.tsx`**
- Extend props with `selectedLocation`, `onLocationChange`, `availableLocations: string[]`.
- **Desktop**: Add a Location `Select` after the Team dropdown, same `rounded-2xl border-2` styling, width `w-[200px]`, with a `MapPin` icon-style placeholder "All Locations". Trigger label shows the selected location truncated.
- **Mobile**: Add a fourth row below the Team dropdown with a full-width Location select (or pair it with Team in a 2-col grid — chosen layout: keep Team full-width, add Location full-width below to avoid cramping long facility names).
- Location filter does NOT cascade — it's independent, so all program/division/team selections remain valid.

### Behavior
- Selecting a location narrows the visible events to ones at that exact location string, combined with any other active filters (AND logic).
- Clearing filters resets location to `'all'`.
- "Now viewing" badge appends the location chosen.
- Empty state copy already references "filters" so no change needed.

### Files touched
- `src/pages/Schedule.tsx`
- `src/components/UnifiedScheduleToolbar.tsx`

