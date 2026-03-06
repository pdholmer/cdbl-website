

## Admin Schedule Page Overhaul

The current admin schedule page is titled "Game Schedule" and only manages games. It needs to become a broader "Schedule & Events" management hub, support adding events (not just games), allow Excel/CSV schedule imports, and link to the public schedule page.

### Changes

**1. Rename and rebrand — `src/pages/admin/Schedule.tsx`**
- Title: "Game Schedule" → "Schedule & Events"
- Subtitle: "Manage game schedules and facilities" → "Manage games, practices, events, and league calendar"
- Add a link/button to view the public schedule page (`/schedule`)

**2. Add "Add Event" capability — `src/pages/admin/Schedule.tsx`**
- Add a tabbed interface: **Games** | **Practices** | **Events**
- Games tab: keep existing game table (mostly as-is)
- Practices tab: list practices from `usePractices()` with ability to add/edit
- Events tab: manage the static calendar events — since these are currently hardcoded in `calendarEvents.ts`, create a new `league_events` database table to make them dynamic and admin-editable
- Add "Add Event" button that opens a dialog/form for creating league events (title, date, time, location, type, description)

**3. New database table: `league_events`**

| Column | Type | Default |
|--------|------|---------|
| id | uuid | gen_random_uuid() |
| title | text | required |
| event_date | date | required |
| end_date | date | null |
| event_time | text | null |
| location | text | null |
| event_type | text | 'special-event' |
| description | text | null |
| category | text | 'event' |
| created_by | uuid | null |
| created_at | timestamptz | now() |
| updated_at | timestamptz | now() |

RLS: Public SELECT, board_member+ INSERT/UPDATE/DELETE.

**4. Excel/CSV import — `src/pages/admin/Schedule.tsx`**
- Add an "Import Schedule" button that accepts `.csv` or `.xlsx` files
- Parse the file client-side (use a lightweight CSV parser; for Excel, use the `xlsx` npm package or stick to CSV-only to avoid a new dependency)
- Show a preview table of parsed rows with column mapping (date, time, home team, away team, venue)
- On confirm, bulk-insert games via `useGameMutations`
- Support both game schedule imports and event imports

**5. Update `useScheduleEvents` hook — `src/hooks/useScheduleEvents.ts`**
- Replace static `calendarEvents` import with data from the new `league_events` table
- Keep backward compatibility: merge DB events with any remaining static events during transition

**6. New hook: `src/hooks/useLeagueEvents.ts`**
- CRUD operations for `league_events` table

**7. Link public schedule to admin — `src/pages/Schedule.tsx`**
- No changes needed; it already uses `useScheduleEvents` which will automatically pick up DB events

**8. Route updates — `src/App.tsx`**
- Add route for `/admin/schedule/new` (game creation form) — currently missing
- Keep existing `/admin/schedule` route

### Files to create
- `src/hooks/useLeagueEvents.ts` — query + mutations for league_events
- Migration for `league_events` table

### Files to modify
- `src/pages/admin/Schedule.tsx` — full overhaul (rename, tabs, import, event management)
- `src/hooks/useScheduleEvents.ts` — pull from league_events instead of static data
- `src/App.tsx` — add missing schedule sub-routes if needed

