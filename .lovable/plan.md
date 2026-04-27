## Update Schedule Source + Exclude Bronco Games

### Heads up about the link

The link you shared (`https://leagues.bluesombrero.com/Default.aspx?tabid=2204766#/gameScheduleCalendar`) is the **public webpage** version of the schedule, not the iCal feed our sync system reads. Our current calendar pulls from a different format:

```
https://calendar.bluesombrero.com/api/v1/Calendar?instancekey=leagues&portalId=...&id=...&key=...
```

I'll handle this in two ways:

1. **Save the new public URL** as the calendar's `source_url` (a new field) so admins/users can click through to view the live source on BlueSombrero.
2. **Refresh the iCal feed** — when you open the new tab on BlueSombrero, there's typically an "Export / Subscribe" button that gives the actual iCal/.ics URL for that specific schedule view. If the new tab represents a different team/portal than what we sync today, I'll need that exported iCal URL to swap in. For now, the plan keeps the existing iCal feed (which is currently syncing 395 events successfully) and just updates the visible source link — unless you provide the new .ics export URL, in which case I'll swap `ical_url` too.

### Exclude Bronco games

Bronco games will be filtered out at sync time so they never enter the database (and therefore never appear on `/schedule`, `Featured Events`, division views, or anywhere else). Practices and non-game events for Bronco will still be allowed unless you want those gone too.

**Logic:** in `supabase/functions/sync-external-calendar/index.ts`, after each event is classified, drop any row where `event_category === "game"` AND the detected division name is "Bronco". The deletion step at the end of sync (which removes events no longer in the feed) will also clean out any previously-synced Bronco games on the next run.

### Files touched

- `supabase/functions/sync-external-calendar/index.ts` — add Bronco-game filter inside the `parsed.map(...)` step (skip the row instead of returning it); update sync stats so skipped rows are reported in `last_sync_message` (e.g. "skipped 12 Bronco games").
- `src/pages/admin/Schedule.tsx` / `src/components/admin/schedule/CalendarsTab.tsx` — surface a clickable "View source" link to the new BlueSombrero page so admins can verify the upstream schedule.
- Database migration — update the `external_calendars` row for "BlueSombrero League Calendar" to store the new public page URL (add a `source_url` column if it doesn't exist; current schema only has `ical_url`).

### Question before I build

Do you want me to:
- (a) Keep the existing iCal feed and just record the new public URL as the source link (safe, no sync disruption), **or**
- (b) Replace the iCal feed entirely — in which case please grab the new .ics/Export URL from the BlueSombrero "Subscribe" button on that page and paste it here.

Either way, the Bronco-game exclusion is included.
