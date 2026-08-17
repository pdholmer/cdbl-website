# Durable identity for imported calendar events

## What I found

**1. The importer** — edge function `sync-external-calendar` (`supabase/functions/sync-external-calendar/index.ts`), invoked from the admin Schedule screen (Calendars tab). In plain language, per active calendar it:

1. Downloads the Sports Connect `.ics` feed and parses every `VEVENT` (UID, summary, description, location, start/end, all-day), converting UTC times to America/Chicago.
2. Classifies each event by reading the title and description: game / practice / other, division, program, home and away team, field number. It skips Bronco games.
3. Upserts rows into `external_calendar_events` on `(calendar_id, external_uid)`.
4. **Hard-deletes** every row for that calendar whose `external_uid` is not in the batch it just wrote.
5. Stamps `last_synced_at`, `last_sync_status`, `last_sync_message` on `external_calendars`.

So the code *intends* to upsert. The reason it behaves as a wipe-and-reload is finding 3.

**2. Current schema**

`external_calendar_events`: `id` (uuid pk), `calendar_id`, `external_uid`, `title`, `description`, `location`, `start_date`, `start_time`, `end_date`, `end_time`, `all_day`, `raw_data` (jsonb), `program_id`, `division_id`, `home_team_id`, `away_team_id`, `event_category`, `field_number`, `calendar_name`, `calendar_color`, `created_at`, `updated_at`. Unique index on `(calendar_id, external_uid)`. **No status column and no facility-path column.**

`external_calendars`: `id`, `name`, `ical_url`, `source`, `source_url`, `color`, `is_active`, `last_synced_at`, `last_sync_status`, `last_sync_message`, `created_by`, `created_at`, `updated_at`.

**3. The UIDs are not stable.** Five samples:

```text
20260817T02000286766881
20260817T02000287068059
20260817T02000287100162
20260817T02000286938379
20260817T02000286426183
```

Every one is `<sync run timestamp>T<HHMMSS><counter>`. All 536 rows carry `created_at = 2026-08-17 02:00:03`. The feed's UID is being stamped with the moment of the sync run, so no UID from one run ever matches the next: the upsert always inserts 536 new rows and step 4 then deletes all 536 old ones. Identity is destroyed on every sync.

Also confirmed: 528 of 536 descriptions carry a facility path such as `Plato > T-Ball - Field 4`, currently stored only as free text in `description`; 55 titles begin `CANCELED-`, and nothing in the codebase reads that prefix today — cancelled events render as ordinary events with an ugly title.

## What I propose

**Stable key.** The raw ICS UID cannot be used. I will store a derived `event_key`: a SHA-256 over `calendar_id` + normalized title + start date + start time. Normalization strips a leading `CANCELED-`, lowercases, and collapses whitespace — so a cancellation keeps the same identity as the event it cancels, which is the whole point.

Tradeoff, stated plainly: if the league **moves** an event to a different date or time, the key changes. The old row is marked `removed` and a new row appears rather than the existing row being edited. Title and time are the only stable-ish facts this feed gives us, and time is the one that actually identifies "this game". A reschedule is genuinely a different slot, so this is the behaviour I would want anyway — but it means "reschedule" and "cancel + add" look the same to us. Documented in a column comment.

**Importer changes.** Same file, no change to team/division matching:

- New `normalizeTitle()` and `eventKey()` helpers.
- One isolated `detectCancellation(summary)` function — the only place the `CANCELED-` prefix is known — returning the clean display title plus a boolean. When the feed one day gains a real `STATUS:CANCELLED` property, that function is the single edit.
- New `parseFacilityPath(description)` storing the raw path plus its parsed site / area / field parts, for Field Management's resolver to match later.
- Upsert on `(calendar_id, event_key)` — new events insert, existing ones update in place, keeping `id` and `created_at` and touching `updated_at`.
- Events missing from the feed get `status = 'removed'` and `removed_at = now()`. **No DELETE anywhere in the function.** A row that comes back in a later feed flips back to `active`.
- `?dry_run=true` (or `{"dry_run": true}`) runs the whole pipeline against the live feed and writes nothing, returning would-insert / would-update / would-remove / unchanged counts per calendar.

**Backfill.** The 536 existing rows get an `event_key` computed in SQL by the same rule, so the first real sync after the migration matches them instead of duplicating them.

## Technical detail

### Migration SQL (not applied)

```sql
-- 1. New columns
ALTER TABLE public.external_calendar_events
  ADD COLUMN event_key text,
  ADD COLUMN status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','removed')),
  ADD COLUMN is_cancelled boolean NOT NULL DEFAULT false,
  ADD COLUMN removed_at timestamptz,
  ADD COLUMN last_seen_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN facility_path text,
  ADD COLUMN facility_site text,
  ADD COLUMN facility_area text,
  ADD COLUMN facility_field text;

COMMENT ON COLUMN public.external_calendar_events.event_key IS
  'Deterministic identity: sha256(calendar_id || lower(collapsed title with leading CANCELED- stripped) || start_date || coalesce(start_time,'''')). The Sports Connect feed stamps its ICS UID with the sync run time, so the raw UID is not stable. Tradeoff: moving an event to a new date/time yields a new key — the old row is marked removed and a new row is inserted.';
COMMENT ON COLUMN public.external_calendar_events.status IS
  'active = present in the most recent successful sync; removed = soft-deleted, no longer in the feed. Rows are never hard-deleted so other tables may safely reference id.';
COMMENT ON COLUMN public.external_calendar_events.is_cancelled IS
  'Feed carries no STATUS property; cancellation is detected solely from the CANCELED- title prefix in detectCancellation().';
COMMENT ON COLUMN public.external_calendar_events.facility_path IS
  'Raw DESCRIPTION facility path, e.g. "Burlington > Burlington Upper - Mustang/Pinto". Reserved for the Field Management resolver.';

-- 2. Backfill event_key for the 536 existing rows, using the same rule the importer uses
UPDATE public.external_calendar_events
SET event_key = encode(digest(
      calendar_id::text || '|' ||
      regexp_replace(lower(regexp_replace(title, '^\s*CANCELED-\s*', '', 'i')), '\s+', ' ', 'g') || '|' ||
      start_date::text || '|' ||
      coalesce(start_time::text, ''),
      'sha256'), 'hex')
WHERE event_key IS NULL;

-- 3. Backfill cancellation flag, clean titles, and facility path from existing data
UPDATE public.external_calendar_events
SET is_cancelled = true,
    title = regexp_replace(title, '^\s*CANCELED-\s*', '', 'i')
WHERE title ~* '^\s*CANCELED-';

UPDATE public.external_calendar_events
SET facility_path = split_part(description, E'\n', 1)
WHERE description LIKE '%>%' AND facility_path IS NULL;

UPDATE public.external_calendar_events
SET facility_site  = btrim(split_part(facility_path, '>', 1)),
    facility_area  = btrim(split_part(split_part(facility_path, '>', 2), '-', 1)),
    facility_field = nullif(btrim(regexp_replace(facility_path, '^.*-\s*', '')), '')
WHERE facility_path IS NOT NULL;

-- 4. Enforce the key
ALTER TABLE public.external_calendar_events ALTER COLUMN event_key SET NOT NULL;

CREATE UNIQUE INDEX external_calendar_events_event_key_uidx
  ON public.external_calendar_events (calendar_id, event_key);

CREATE INDEX idx_ext_cal_events_status ON public.external_calendar_events (status);
CREATE INDEX idx_ext_cal_events_facility_path ON public.external_calendar_events (facility_path);

-- 5. FK readiness: id is already the primary key, so future tables can reference it.
--    Nothing to add here beyond guaranteeing rows are never hard-deleted (status='removed'),
--    which the rewritten importer enforces. Future references should use
--    REFERENCES public.external_calendar_events(id) ON DELETE RESTRICT.

-- 6. The old (calendar_id, external_uid) unique index is left in place for one sync
--    cycle so a rollback is possible, then dropped in a follow-up:
--    DROP INDEX public.external_calendar_events_calendar_id_external_uid_key;
```

`digest()` requires `pgcrypto`; the migration will `CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;` and qualify the call if it is not already installed — I will confirm before applying.

### Importer diff (sketch, not applied)

```ts
// --- NEW: the ONLY place the feed's cancellation convention lives ---
function detectCancellation(summary: string): { title: string; isCancelled: boolean } {
  const m = summary.match(/^\s*CANCELED-\s*(.*)$/i);
  return m ? { title: m[1].trim(), isCancelled: true }
           : { title: summary.trim(), isCancelled: false };
}

// --- NEW: deterministic identity ---
function normalizeTitle(t: string): string {
  return detectCancellation(t).title.toLowerCase().replace(/\s+/g, " ").trim();
}
async function eventKey(calendarId: string, title: string, date: string, time?: string) {
  const raw = `${calendarId}|${normalizeTitle(title)}|${date}|${time ?? ""}`;
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// --- NEW: facility path out of DESCRIPTION ---
function parseFacilityPath(description?: string) {
  const line = description?.split("\n").find((l) => l.includes(">"))?.trim();
  if (!line) return { facility_path: null, facility_site: null, facility_area: null, facility_field: null };
  const [site, rest = ""] = line.split(">").map((s) => s.trim());
  const [area, field] = rest.split(/\s-\s/).map((s) => s?.trim() ?? null);
  return { facility_path: line, facility_site: site, facility_area: area ?? null, facility_field: field ?? null };
}
```

Row construction gains `event_key`, `is_cancelled`, `title` (cleaned), the four facility columns, `status: 'active'`, `last_seen_at: now`, and keeps `external_uid` as feed provenance only.

Write phase replaces steps 3 and 4:

```ts
// existing rows for this calendar, keyed
const { data: existing } = await supabase
  .from("external_calendar_events")
  .select("id, event_key, title, start_date, start_time, end_date, end_time, all_day, location, is_cancelled, status, facility_path")
  .eq("calendar_id", cal.id);

const byKey = new Map(existing.map((r) => [r.event_key, r]));
const feedKeys = new Set(rows.map((r) => r.event_key));

const toInsert = rows.filter((r) => !byKey.has(r.event_key));
const toUpdate = rows.filter((r) => byKey.has(r.event_key) && differs(byKey.get(r.event_key), r));
const unchanged = rows.length - toInsert.length - toUpdate.length;
const toRemove  = existing.filter((r) => r.status === "active" && !feedKeys.has(r.event_key));

if (dryRun) {
  results.push({ calendar_id: cal.id, name: cal.name, dry_run: true,
    would_insert: toInsert.length, would_update: toUpdate.length,
    would_remove: toRemove.length, unchanged });
  continue; // no writes, and last_sync_* is NOT touched
}

await supabase.from("external_calendar_events")
  .upsert(rows.map((r) => ({ ...r, updated_at: new Date().toISOString() })),
          { onConflict: "calendar_id,event_key" });   // preserves id + created_at

if (toRemove.length) {
  await supabase.from("external_calendar_events")
    .update({ status: "removed", removed_at: new Date().toISOString() })
    .in("id", toRemove.map((r) => r.id));            // soft delete — never DELETE
}
```

The Bronco filter keeps working: a filtered-out event simply is not in `feedKeys`, so any previously imported Bronco game becomes `status = 'removed'` instead of being deleted.

### Out of scope, as instructed

No change to team, division or program matching. `games` and `practices` untouched. No UI work — the schedule hooks keep reading the same table, though after this lands they should filter `status = 'active'`; I will flag that as the immediately following change rather than folding it in here.

### Verification after approval

1. Apply the migration; confirm 536 rows carry a non-null `event_key` and that the unique index built without collisions.
2. Deploy the importer and run it in **dry-run** against the live feed. Expect roughly 536 unchanged, 0 insert, 0 update, 0 remove — proof that the backfilled keys match what the feed produces.
3. Run it for real, then confirm `created_at` values are still `2026-08-17` and no row count changed.
4. Run once more and confirm `updated_at` moved while `id` and `created_at` did not.
