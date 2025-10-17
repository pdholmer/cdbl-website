-- Teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  nickname TEXT,
  division_id UUID REFERENCES public.divisions(id) NOT NULL,
  program_id UUID REFERENCES public.programs(id) NOT NULL,
  season_year INTEGER NOT NULL,
  
  -- Team Details
  color_primary TEXT,
  color_secondary TEXT,
  logo_url TEXT,
  max_roster_size INTEGER DEFAULT 12,
  current_roster_count INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'forming' CHECK (status IN ('forming', 'active', 'completed', 'disbanded')),
  
  -- GameChanger Integration
  gamechanger_team_id TEXT,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coaches/Staff table
CREATE TABLE public.coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  
  -- Qualifications
  background_check_status TEXT CHECK (background_check_status IN ('pending', 'approved', 'expired', 'rejected')),
  background_check_date DATE,
  background_check_expiry DATE,
  certifications JSONB DEFAULT '[]'::jsonb,
  coaching_experience TEXT,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  
  -- Notes
  admin_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team-Coach Assignments (many-to-many)
CREATE TABLE public.team_coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  coach_id UUID REFERENCES public.coaches(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('head_coach', 'assistant_coach', 'team_parent', 'volunteer')),
  primary_contact BOOLEAN DEFAULT false,
  
  assigned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  removed_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  
  UNIQUE(team_id, coach_id, role)
);

-- Team Rosters (player-team assignments with history)
CREATE TABLE public.team_rosters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
  season_year INTEGER NOT NULL,
  
  jersey_number TEXT,
  position_primary TEXT,
  position_secondary TEXT,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'injured', 'transferred')),
  joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  removed_date TIMESTAMP WITH TIME ZONE,
  removal_reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(team_id, player_id, season_year)
);

-- Add foreign key to players table for current team
ALTER TABLE public.players
  ADD CONSTRAINT fk_players_team
  FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE SET NULL;

-- Indexes for performance
CREATE INDEX idx_teams_division ON public.teams(division_id);
CREATE INDEX idx_teams_program ON public.teams(program_id);
CREATE INDEX idx_teams_season ON public.teams(season_year);
CREATE INDEX idx_teams_status ON public.teams(status);

CREATE INDEX idx_coaches_email ON public.coaches(email);
CREATE INDEX idx_coaches_status ON public.coaches(status);
CREATE INDEX idx_coaches_background_check ON public.coaches(background_check_status);

CREATE INDEX idx_team_coaches_team ON public.team_coaches(team_id);
CREATE INDEX idx_team_coaches_coach ON public.team_coaches(coach_id);
CREATE INDEX idx_team_coaches_status ON public.team_coaches(status);

CREATE INDEX idx_team_rosters_team ON public.team_rosters(team_id);
CREATE INDEX idx_team_rosters_player ON public.team_rosters(player_id);
CREATE INDEX idx_team_rosters_season ON public.team_rosters(season_year);
CREATE INDEX idx_team_rosters_status ON public.team_rosters(status);

-- Triggers for updated_at
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coaches_updated_at
  BEFORE UPDATE ON public.coaches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_rosters_updated_at
  BEFORE UPDATE ON public.team_rosters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update team roster count
CREATE OR REPLACE FUNCTION public.update_team_roster_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.teams
    SET current_roster_count = (
      SELECT COUNT(*)
      FROM public.team_rosters
      WHERE team_id = NEW.team_id AND status = 'active'
    )
    WHERE id = NEW.team_id;
  END IF;
  
  IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
    UPDATE public.teams
    SET current_roster_count = (
      SELECT COUNT(*)
      FROM public.team_rosters
      WHERE team_id = OLD.team_id AND status = 'active'
    )
    WHERE id = OLD.team_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to update roster count
CREATE TRIGGER update_team_roster_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.team_rosters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_team_roster_count();

-- RLS Policies
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_rosters ENABLE ROW LEVEL SECURITY;

-- Teams: Admins have full access
CREATE POLICY "Admins have full access to teams"
  ON public.teams
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Teams: Public can view active teams
CREATE POLICY "Public can view active teams"
  ON public.teams
  FOR SELECT
  USING (status = 'active');

-- Coaches: Admins have full access
CREATE POLICY "Admins have full access to coaches"
  ON public.coaches
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Coaches: Coaches can view their own profile
CREATE POLICY "Coaches can view their own profile"
  ON public.coaches
  FOR SELECT
  USING (user_id = auth.uid());

-- Coaches: Coaches can update their own contact info
CREATE POLICY "Coaches can update their own contact info"
  ON public.coaches
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Team Coaches: Admins have full access
CREATE POLICY "Admins have full access to team coaches"
  ON public.team_coaches
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Team Coaches: Public can view active assignments
CREATE POLICY "Public can view active team coaches"
  ON public.team_coaches
  FOR SELECT
  USING (status = 'active');

-- Team Rosters: Admins have full access
CREATE POLICY "Admins have full access to team rosters"
  ON public.team_rosters
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Team Rosters: Public can view active rosters
CREATE POLICY "Public can view active team rosters"
  ON public.team_rosters
  FOR SELECT
  USING (status = 'active');