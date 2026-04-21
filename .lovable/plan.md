

## Fix UTC → Local Time Conversion for Synced Events

### Problem

The BlueSombrero iCal feed publishes times in UTC (e.g. `DTSTART:20260421T223000Z`). The sync function is storing those raw UTC values as if they were already local — so a 5:30 PM Central practice gets saved as `22:30:00` and displayed as **10:30 PM**. End times that cross midnight UTC are also being saved with the wrong date.

### Fix

**1. Convert UTC to America/Chicago in the edge function** (`supabase/functions/sync-external-calendar/index.ts`)

Update `parseDateTime` so that whenever the value ends in `Z` (UTC), it converts to the league's local timezone (`America/Chicago`) before splitting into `date` + `time`. This:
- Correctly shifts `22:30 UTC` → `17:30` local (5:30 PM)
- Correctly rolls the date back when the UTC time is past midnight but the local time is the previous day (e.g. `20260422T013000Z` → `2026-04-21` `20:30`)
- Handles DST automatically using `Intl.DateTimeFormat` with `timeZone: "America/Chicago"`

Floating times (no `Z`, no TZID) and explicit `VALUE=DATE` all-day events keep their current behavior.

**2. Re-sync to backfill existing rows**

Invoke `sync-external-calendar` after deploying so all 385 events are re-parsed with the corrected times. Existing rows are upserted by `(calendar_id, external_uid)` so no duplicates.

### Files touched
- `supabase/functions/sync-external-calendar/index.ts` — UTC→Central conversion in `parseDateTime`
- One-shot: invoke the sync function to backfill

### Notes
- Hardcoding `America/Chicago` is correct for CDBL; no config needed.
- The existing frontend `formatTime` helper already renders in 12-hour format, so no client changes are needed once the stored times are right.

