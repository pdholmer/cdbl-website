
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
  'Deterministic identity: sha256(calendar_id || lower(collapsed title with leading CANCELED- stripped) || start_date || coalesce(start_time,'''')). The Sports Connect feed stamps its ICS UID with the sync run time, so the raw UID is not stable. Tradeoff: moving an event to a new date/time yields a new key - the old row is marked removed and a new row is inserted.';
COMMENT ON COLUMN public.external_calendar_events.status IS
  'active = present in the most recent successful sync; removed = soft-deleted, no longer in the feed. Rows are never hard-deleted so other tables may safely reference id.';
COMMENT ON COLUMN public.external_calendar_events.is_cancelled IS
  'Feed carries no STATUS property; cancellation is detected solely from the CANCELED- title prefix in detectCancellation().';
COMMENT ON COLUMN public.external_calendar_events.facility_path IS
  'Raw DESCRIPTION facility path, e.g. "Burlington > Burlington Upper - Mustang/Pinto". Reserved for the Field Management resolver.';

UPDATE public.external_calendar_events
SET event_key = encode(extensions.digest(
      calendar_id::text || '|' ||
      regexp_replace(lower(regexp_replace(title, '^\s*CANCELED-\s*', '', 'i')), '\s+', ' ', 'g') || '|' ||
      start_date::text || '|' ||
      coalesce(start_time::text, ''),
      'sha256'), 'hex')
WHERE event_key IS NULL;

UPDATE public.external_calendar_events
SET is_cancelled = true,
    title = regexp_replace(title, '^\s*CANCELED-\s*', '', 'i')
WHERE title ~* '^\s*CANCELED-';

UPDATE public.external_calendar_events
SET facility_path = btrim(split_part(description, E'\n', 1))
WHERE description LIKE '%>%' AND facility_path IS NULL;

UPDATE public.external_calendar_events
SET facility_site  = btrim(split_part(facility_path, '>', 1)),
    facility_area  = btrim(split_part(split_part(facility_path, '>', 2), '-', 1)),
    facility_field = nullif(btrim(regexp_replace(facility_path, '^.*-\s*', '')), '')
WHERE facility_path IS NOT NULL;

ALTER TABLE public.external_calendar_events ALTER COLUMN event_key SET NOT NULL;

CREATE UNIQUE INDEX external_calendar_events_event_key_uidx
  ON public.external_calendar_events (calendar_id, event_key);

CREATE INDEX idx_ext_cal_events_status ON public.external_calendar_events (status);
CREATE INDEX idx_ext_cal_events_facility_path ON public.external_calendar_events (facility_path);
