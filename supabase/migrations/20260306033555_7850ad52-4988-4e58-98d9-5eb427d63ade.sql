
CREATE TABLE public.league_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  event_date date NOT NULL,
  end_date date NULL,
  event_time text NULL,
  location text NULL,
  event_type text NOT NULL DEFAULT 'special-event',
  description text NULL,
  category text NOT NULL DEFAULT 'event',
  created_by uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.league_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view league events"
  ON public.league_events FOR SELECT
  USING (true);

CREATE POLICY "Board members can insert league events"
  ON public.league_events FOR INSERT
  TO authenticated
  WITH CHECK (has_admin_access(auth.uid()));

CREATE POLICY "Board members can update league events"
  ON public.league_events FOR UPDATE
  TO authenticated
  USING (has_admin_access(auth.uid()));

CREATE POLICY "Board members can delete league events"
  ON public.league_events FOR DELETE
  TO authenticated
  USING (has_admin_access(auth.uid()));

CREATE TRIGGER update_league_events_updated_at
  BEFORE UPDATE ON public.league_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
