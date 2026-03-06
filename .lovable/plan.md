

## Seed Static Calendar Events into the Database

The problem: The public schedule page shows dozens of events from the hardcoded `calendarEvents.ts` file, but the admin Events tab only queries the `league_events` database table, which is currently empty. So admins see "No events found" even though the public site is full of events.

### Solution

**1. Database migration — seed all static events into `league_events`**

Create a migration that inserts every event from `calendarEvents.ts` (the ones with `category: "event"` and `category: "practice"` that are static milestones) into the `league_events` table. This is approximately 50+ rows covering board meetings, tournaments, registration dates, clinics, ceremonies, field days, etc. from Oct 2025 through Oct 2026.

**2. Remove static fallback from `useScheduleEvents.ts`**

Once the data lives in the database, remove the merge logic that pulls from the static `calendarEvents` array. The hook should rely solely on DB data (games, practices, league_events).

**3. Optionally keep `calendarEvents.ts` as a reference** but it will no longer be imported by active code. Can be deleted in a follow-up.

### Files to change
- New migration SQL — bulk INSERT of all static events into `league_events`
- `src/hooks/useScheduleEvents.ts` — remove static event fallback
- `src/components/admin/schedule/EventsTab.tsx` — no changes needed (already queries `league_events`)

This way, when admins open the Events tab, they'll see every event that appears on the public schedule, and can edit/delete/add from there.

