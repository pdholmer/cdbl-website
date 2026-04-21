

## Switch Calendar Source + Cleaner Team Naming

### Changes

**1. Replace the calendar feed**
- Update the existing `external_calendars` row: swap the TeamApp `.ics` URL for the new BlueSombrero feed.
- Convert the `webcal://` scheme to `https://` before fetching (servers don't speak `webcal`; it's just a hint to open in a calendar app). Final URL:
  `https://calendar.bluesombrero.com/api/v1/Calendar?instancekey=leagues&portalId=84830&id=46965016&key=79C9LD6T`
- Set `source = "bluesombrero"` and update the display name.
- Trigger a manual sync after the swap to repopulate `external_calendar_events` with the new feed (old TeamApp events get removed by the existing "delete events not in feed" step since they share the same calendar_id).

**2. Smarter title formatting in `useScheduleEvents.ts`**

When external events have classified team metadata, build display titles like this so parents/coaches always see the division and never see "CDBL Rockets":

| Category | Both teams resolved | Only one team resolved | No teams resolved |
|---|---|---|---|
| Game (In-House) | `Mustang: Pirates vs Cardinals` | fall back to cleaned raw title | cleaned raw title |
| Game (Travel) | `10U White vs 10U IHTT` (use division name as the team label since travel team names are the division code) | cleaned raw title | cleaned raw title |
| Practice (In-House) | `Mustang Pirates Practice` | — | cleaned raw title |
| Practice (Travel) | `10U White Practice` | — | cleaned raw title |

Cleaning rules applied to any fallback title:
- Strip leading `CDBL Rockets ` / `CDBL ` prefixes
- Strip trailing ` IHTT` token only when it duplicates the division (keep "10U IHTT" as a team label when that IS the team name)
- Collapse extra whitespace

**3. Tighten the edge-function classifier (`sync-external-calendar/index.ts`)**

BlueSombrero feeds use a slightly different title convention than TeamApp, so:
- Keep existing keyword division detection (Mustang/Pinto/Pony/Bronco/T-Ball + `\d{1,2}U` codes).
- Add handling for BlueSombrero-style titles which often look like `10U White @ 10U IHTT` or `Mustang Pirates @ Mustang Cardinals` — accept both ` vs ` and ` @ ` (and ` at `) as the home/away separator.
- Improve travel team matching: when the parsed team string equals or contains the division code (e.g. `10U White`), match the team whose name is `White` (or full `10U White`) within the `10U` division.
- Strip `CDBL Rockets` / `CDBL` prefixes before team lookup so name-matching against the `teams` table still works.
- Keep the existing per-event raw fallback in `raw_data` so we can debug any mismatches.

**4. Admin UX**
- The Calendars tab already shows the sync summary (games / practices / events / unmatched). No structural changes — admins will see the new counts after the first sync of the new feed.

### Files touched
- DB (data update via insert tool): update the existing `external_calendars` row's `ical_url`, `name`, `source`.
- `supabase/functions/sync-external-calendar/index.ts` — add `@`/`at` separator support, tighten travel team matching, strip `CDBL Rockets` before lookup.
- `src/hooks/useScheduleEvents.ts` — new title-builder that always includes the division label and never shows `CDBL Rockets`.
- One-shot: invoke the sync function to backfill events from the new feed.

### Notes
- `webcal://` → `https://` conversion is server-side only; the URL stored in DB will be `https://…` so future syncs work without special-casing.
- Old TeamApp events are removed automatically by the existing "delete events no longer in feed" step.
- If any titles fail to classify after the first sync, the unmatched count in the Calendars tab will tell us, and we can iterate on the parser without further schema changes.

