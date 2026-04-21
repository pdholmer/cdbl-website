

## Fix External Calendar Display + Add Filter Metadata

### Problem 1 — Events not appearing on `/schedule`

The 28 synced events ARE in the database, but they're invisible because of how the schedule page filters work. External events have no `category` matching the active "game/practice" tab and no `programId/divisionId/teamId` — combined with the upcoming/past filter and the way the cards look, they get lost.

Root cause: in `useScheduleEvents.ts`, every external event is hardcoded to `category: "event"`. So when a parent filters to "Games" or "Practices" they vanish. We also have no metadata to match them to a Program / Division / Team.

### Problem 2 — No filter metadata

The TeamApp `.ics` data is rich enough to infer what we need:

| Field in feed | Example | Maps to |
|---|---|---|
| Title prefix `Mustang …` / `CDBL Rockets 10u IHTT` | "Mustang Pirates vs Mustang Cardinals" | Division (`Mustang`) + Teams (`Pirates`, `Cardinals`) |
| Title contains "vs Practice" | "CDBL Rockets 10u IHTT vs Practice" | Category = **practice** |
| Title contains "vs <team>" | "Mustang Pirates vs Mustang Brewers" | Category = **game** |
| Description | "10u IHTT Games 2026", "Mustang Practice 2026" | Confirms division + Travel vs In-House |
| Location prefix | "Mustang - Field 2, …" | Field number |

### Plan

**1. Add metadata columns** (migration on `external_calendar_events`):
- `program_id uuid` (nullable, FK to programs)
- `division_id uuid` (nullable, FK to divisions)
- `home_team_id uuid` (nullable, FK to teams)
- `away_team_id uuid` (nullable, FK to teams)
- `event_category text` — `'game' | 'practice' | 'event'` (defaults to `'event'`)
- `field_number text` (parsed from location)

**2. Update the sync edge function** (`sync-external-calendar/index.ts`):

Add a classifier that runs per parsed event:

- **Category detection**
  - Title contains `vs Practice` (case-insensitive) → `practice`
  - Title contains ` vs ` and both sides look like team names → `game`
  - Description contains "Practice" → `practice`
  - Otherwise → `event`

- **Division matching**: substring/keyword match against existing `divisions` table — `Mustang`, `Pinto`, `Pony`, `Bronco`, `T-Ball`, plus travel codes (`8U`, `9U`, `10U`, `11U`, `12U`, `13U`, `14U`, `15U`) parsed from title/description (e.g. `10u White`, `10u IHTT` → `10U White`).

- **Program matching**: `Travel` if division is travel-style (`10U`, `11U`, etc.) OR description/title mentions "Travel" / "IHTT" / "Rockets"; else `In-House`.

- **Team matching**: split title on ` vs `, strip division prefix (`Mustang Pirates` → `Pirates`), match against `teams` table within the resolved division. Store as `home_team_id` (left of "vs") and `away_team_id` (right). Practices store the team in `home_team_id` only.

- **Field number**: regex `/Field\s+(\d+)/i` against location → `field_number`.

The function caches lookups (programs, divisions, teams) per run, then writes the resolved IDs into the upsert payload. Re-running sync re-classifies all events so existing rows backfill on the next manual sync.

**3. Update `useScheduleEvents.ts`**:
- Map external event `event_category` → `CalendarEvent.category` (`game` | `practice` | `event`).
- Pass through `programId`, `divisionId`, `homeTeamId`, `awayTeamId` so the existing filter logic on `/schedule` "just works".
- Use `Trophy` icon for game, `Users` for practice, keep `CalendarDays` for unclassified.
- For games/practices, build a nicer title (e.g. "Pirates vs Cardinals" instead of "Mustang Pirates vs Mustang Cardinals") when both teams resolve.

**4. Update `useExternalCalendarEvents` hook** to select the new columns.

**5. Run sync immediately** after the migration + function deploy so existing 28 events get classified.

**6. Admin UX (small)**: in `CalendarsTab.tsx`, after sync show a quick summary (`X games, Y practices, Z events; N unmatched`) so admins know if any titles failed to map.

### What this delivers
- All synced events show up in the unified `/schedule`, in the right tab (Games / Practices).
- Parents using "Find My Team" or program/division/team filters see external events filtered correctly alongside native games & practices.
- Admins can see at a glance how many events were auto-classified.
- No manual data entry needed for future syncs — classification re-runs every hour.

### Files / objects touched
- DB migration: add columns + FKs to `external_calendar_events`
- `supabase/functions/sync-external-calendar/index.ts` — add classifier + lookups + populate new columns
- `src/hooks/useExternalCalendars.ts` — extend `ExternalCalendarEvent` type + select
- `src/hooks/useScheduleEvents.ts` — map metadata + dynamic category/icon/title
- `src/components/admin/schedule/CalendarsTab.tsx` — show classification summary
- One-shot: invoke `sync-external-calendar` to backfill

