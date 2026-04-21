-- External calendars table
CREATE TABLE public.external_calendars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  ical_url TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'ical',
  color TEXT DEFAULT '#8b5cf6',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  last_sync_status TEXT,
  last_sync_message TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.external_calendars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active external calendars"
  ON public.external_calendars FOR SELECT
  USING (is_active = true OR public.has_admin_access(auth.uid()));

CREATE POLICY "Admins can manage external calendars"
  ON public.external_calendars FOR ALL
  USING (public.has_admin_access(auth.uid()))
  WITH CHECK (public.has_admin_access(auth.uid()));

CREATE TRIGGER update_external_calendars_updated_at
  BEFORE UPDATE ON public.external_calendars
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- External calendar events table
CREATE TABLE public.external_calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  calendar_id UUID NOT NULL REFERENCES public.external_calendars(id) ON DELETE CASCADE,
  external_uid TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_date DATE NOT NULL,
  start_time TIME,
  end_date DATE,
  end_time TIME,
  all_day BOOLEAN NOT NULL DEFAULT false,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(calendar_id, external_uid)
);

CREATE INDEX idx_ext_cal_events_calendar ON public.external_calendar_events(calendar_id);
CREATE INDEX idx_ext_cal_events_date ON public.external_calendar_events(start_date);

ALTER TABLE public.external_calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view external calendar events"
  ON public.external_calendar_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.external_calendars c
      WHERE c.id = external_calendar_events.calendar_id
        AND (c.is_active = true OR public.has_admin_access(auth.uid()))
    )
  );

CREATE POLICY "Admins can manage external calendar events"
  ON public.external_calendar_events FOR ALL
  USING (public.has_admin_access(auth.uid()))
  WITH CHECK (public.has_admin_access(auth.uid()));

CREATE TRIGGER update_external_calendar_events_updated_at
  BEFORE UPDATE ON public.external_calendar_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed TeamApp calendar
INSERT INTO public.external_calendars (name, ical_url, source, color)
VALUES (
  'TeamApp Calendar',
  'https://icalendar.teamapp.com/clubs/926338/events_subscriptions.ics?id=24790275&secret=BAhJIj0xejFUbE4xK1J5bGp2TGFaeXYydEpIS04rblNVRVVxYmc4RVJUWHpEdlNJQXMwSHM4R2hxWE13VAY6BkVU--95c56b53bbce3f9e5cfca8ae56f89bb7677bd5e3&team_id=all',
  'teamapp',
  '#8b5cf6'
);