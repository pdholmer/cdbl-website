

## Sync External iCal Calendar into League Schedule

Yes — I can pull events from that TeamApp `.ics` subscription URL and display them on the league `/schedule` page alongside games, practices, and existing league events. Updates will sync automatically on a schedule.

### How it works

```text
TeamApp .ics URL ──► Edge Function (fetch + parse)
                          │
                          ▼
                  external_calendar_events table
                          │
                          ▼
                useScheduleEvents hook (merge)
                          │
                          ▼
              /schedule page (calendar + list)
```

### Implementation

**1. Database (migration)**
- New table `external_calendars`: `id`, `name`, `ical_url`, `source` (e.g. "teamapp"), `color`, `is_active`, `last_synced_at`, `created_by`, timestamps.
- New table `external_calendar_events`: `id`, `calendar_id` (FK), `external_uid` (unique per calendar — used for upsert), `title`, `description`, `location`, `start_date`, `start_time`, `end_date`, `end_time`, `all_day`, `raw_data` (jsonb), timestamps.
- RLS: public can `SELECT` (events show on public schedule); only admins/board can manage calendars and trigger sync.
- Seed one row in `external_calendars` with the provided TeamApp URL.

**2. Edge function — `sync-external-calendar`**
- Fetches the `.ics` URL server-side (avoids browser CORS).
- Parses VEVENTs (UID, SUMMARY, DTSTART, DTEND, LOCATION, DESCRIPTION; handles all-day vs timed; expands basic RRULE recurrences within a 1-year window).
- Upserts into `external_calendar_events` keyed on `(calendar_id, external_uid)`; deletes events no longer present in the feed.
- Updates `last_synced_at`. Returns sync summary.
- Callable manually (admin button) and via scheduled cron.

**3. Scheduled sync (pg_cron + pg_net)**
- Runs `sync-external-calendar` every 60 minutes so the league calendar stays current automatically.

**4. Frontend integration**
- New hook `useExternalCalendarEvents.ts` — queries `external_calendar_events` joined with `external_calendars`.
- Update `src/hooks/useScheduleEvents.ts` to merge external events into the unified `CalendarEvent[]` with `category: "event"` and a distinct icon/color so users can tell them apart from games, practices, and league-created events.
- Existing `/schedule` page, `CalendarGrid`, and `EventDetailModal` work without changes since they consume `CalendarEvent[]`.

**5. Admin management — `src/components/admin/schedule/EventsTab.tsx` (or new "Calendars" sub-section)**
- List of connected external calendars with name, URL, last sync time, active toggle.
- "Sync Now" button → invokes the edge function.
- "Add Calendar" dialog (name, iCal URL, color) for future feeds.

### Notes & caveats

- TeamApp `.ics` feeds use a long-lived `secret` token in the URL. We'll store it server-side in the `external_calendars` table — never exposed to the browser.
- Recurring events: standard `RRULE FREQ=WEEKLY/DAILY/MONTHLY` with `COUNT`/`UNTIL` are supported; exotic rules fall back to the first occurrence.
- Sync interval: 60 min by default — easy to change. Manual "Sync Now" available anytime.
- External events are read-only in our admin (edits should happen in TeamApp); they can be hidden by toggling the calendar inactive.

