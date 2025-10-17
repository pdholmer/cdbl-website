-- Venues/Fields table
CREATE TABLE public.venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT DEFAULT 'OH',
  zip_code TEXT,
  
  -- Facility Details
  field_count INTEGER DEFAULT 1,
  has_lights BOOLEAN DEFAULT false,
  has_concessions BOOLEAN DEFAULT false,
  has_restrooms BOOLEAN DEFAULT true,
  parking_info TEXT,
  directions TEXT,
  
  -- Availability
  available_days JSONB DEFAULT '[]'::jsonb, -- [{"day": "monday", "start": "17:00", "end": "21:00"}]
  season_start DATE,
  season_end DATE,
  
  -- Contact
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Games table
CREATE TABLE public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type TEXT NOT NULL CHECK (game_type IN ('regular_season', 'playoff', 'tournament', 'scrimmage', 'practice_game')),
  
  -- Teams
  home_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  away_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  division_id UUID REFERENCES public.divisions(id),
  
  -- Schedule
  game_date DATE NOT NULL,
  game_time TIME NOT NULL,
  venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
  field_number TEXT,
  
  -- Duration
  estimated_duration INTEGER DEFAULT 90, -- minutes
  
  -- Status
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'postponed', 'rescheduled')),
  
  -- Scores (optional - primary source is GameChanger)
  home_score INTEGER,
  away_score INTEGER,
  
  -- Officials
  umpire_name TEXT,
  umpire_contact TEXT,
  umpire_fee NUMERIC(10,2),
  
  -- GameChanger Integration
  gamechanger_game_id TEXT,
  gamechanger_url TEXT,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  
  -- Weather & Notes
  weather_status TEXT, -- clear, rain, snow, extreme_heat
  cancellation_reason TEXT,
  rescheduled_from_date DATE,
  rescheduled_from_time TIME,
  
  -- Notifications
  notifications_sent BOOLEAN DEFAULT false,
  reminder_24h_sent BOOLEAN DEFAULT false,
  reminder_1h_sent BOOLEAN DEFAULT false,
  
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Practices table
CREATE TABLE public.practices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  
  -- Schedule
  practice_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
  field_number TEXT,
  
  -- Type
  practice_type TEXT DEFAULT 'regular' CHECK (practice_type IN ('regular', 'batting', 'pitching', 'fielding', 'scrimmage', 'team_building')),
  
  -- Status
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  cancellation_reason TEXT,
  
  -- Attendance
  attendance_count INTEGER,
  attendance_notes TEXT,
  
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_venues_status ON public.venues(status);
CREATE INDEX idx_venues_city ON public.venues(city);

CREATE INDEX idx_games_home_team ON public.games(home_team_id);
CREATE INDEX idx_games_away_team ON public.games(away_team_id);
CREATE INDEX idx_games_division ON public.games(division_id);
CREATE INDEX idx_games_venue ON public.games(venue_id);
CREATE INDEX idx_games_date ON public.games(game_date);
CREATE INDEX idx_games_status ON public.games(status);
CREATE INDEX idx_games_date_time ON public.games(game_date, game_time);

CREATE INDEX idx_practices_team ON public.practices(team_id);
CREATE INDEX idx_practices_venue ON public.practices(venue_id);
CREATE INDEX idx_practices_date ON public.practices(practice_date);
CREATE INDEX idx_practices_status ON public.practices(status);

-- Triggers for updated_at
CREATE TRIGGER update_venues_updated_at
  BEFORE UPDATE ON public.venues
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON public.games
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_practices_updated_at
  BEFORE UPDATE ON public.practices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check venue/time conflicts
CREATE OR REPLACE FUNCTION public.check_schedule_conflict(
  p_venue_id UUID,
  p_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_exclude_game_id UUID DEFAULT NULL,
  p_exclude_practice_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  has_conflict BOOLEAN;
BEGIN
  -- Check for game conflicts
  SELECT EXISTS (
    SELECT 1 FROM public.games
    WHERE venue_id = p_venue_id
      AND game_date = p_date
      AND status NOT IN ('cancelled', 'rescheduled')
      AND (p_exclude_game_id IS NULL OR id != p_exclude_game_id)
      AND (
        game_time BETWEEN p_start_time AND p_end_time
        OR (game_time + (estimated_duration || ' minutes')::INTERVAL)::TIME BETWEEN p_start_time AND p_end_time
      )
  ) INTO has_conflict;
  
  IF has_conflict THEN
    RETURN TRUE;
  END IF;
  
  -- Check for practice conflicts
  SELECT EXISTS (
    SELECT 1 FROM public.practices
    WHERE venue_id = p_venue_id
      AND practice_date = p_date
      AND status != 'cancelled'
      AND (p_exclude_practice_id IS NULL OR id != p_exclude_practice_id)
      AND (
        (start_time, end_time) OVERLAPS (p_start_time, p_end_time)
      )
  ) INTO has_conflict;
  
  RETURN has_conflict;
END;
$$;

-- RLS Policies
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practices ENABLE ROW LEVEL SECURITY;

-- Venues: Admins have full access
CREATE POLICY "Admins have full access to venues"
  ON public.venues
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Venues: Public can view active venues
CREATE POLICY "Public can view active venues"
  ON public.venues
  FOR SELECT
  USING (status = 'active');

-- Games: Admins have full access
CREATE POLICY "Admins have full access to games"
  ON public.games
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Games: Public can view scheduled and completed games
CREATE POLICY "Public can view games"
  ON public.games
  FOR SELECT
  USING (status IN ('scheduled', 'in_progress', 'completed'));

-- Practices: Admins have full access
CREATE POLICY "Admins have full access to practices"
  ON public.practices
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Practices: Coaches can view their team's practices
CREATE POLICY "Coaches can view their team practices"
  ON public.practices
  FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM public.team_coaches
      WHERE coach_id IN (
        SELECT id FROM public.coaches WHERE user_id = auth.uid()
      )
      AND status = 'active'
    )
  );