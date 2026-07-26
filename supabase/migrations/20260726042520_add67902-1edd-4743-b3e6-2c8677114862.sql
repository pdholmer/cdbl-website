CREATE OR REPLACE FUNCTION public.calendar_is_public(_calendar_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.external_calendars c
    WHERE c.id = _calendar_id AND c.is_active = true
  )
$$;

REVOKE ALL ON FUNCTION public.calendar_is_public(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.calendar_is_public(uuid) TO anon, authenticated;

DROP POLICY "Public can view external calendar events" ON public.external_calendar_events;

CREATE POLICY "Public can view events from active calendars"
ON public.external_calendar_events
FOR SELECT
TO anon, authenticated
USING (
  public.calendar_is_public(calendar_id)
  OR (SELECT public.has_admin_access(auth.uid()))
);