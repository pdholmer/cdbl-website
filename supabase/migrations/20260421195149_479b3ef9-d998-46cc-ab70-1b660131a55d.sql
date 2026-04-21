ALTER TABLE public.external_calendar_events
  ADD COLUMN IF NOT EXISTS program_id uuid REFERENCES public.programs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS division_id uuid REFERENCES public.divisions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS home_team_id uuid,
  ADD COLUMN IF NOT EXISTS away_team_id uuid,
  ADD COLUMN IF NOT EXISTS event_category text NOT NULL DEFAULT 'event',
  ADD COLUMN IF NOT EXISTS field_number text;

CREATE INDEX IF NOT EXISTS idx_external_calendar_events_category ON public.external_calendar_events(event_category);
CREATE INDEX IF NOT EXISTS idx_external_calendar_events_division ON public.external_calendar_events(division_id);
CREATE INDEX IF NOT EXISTS idx_external_calendar_events_program ON public.external_calendar_events(program_id);