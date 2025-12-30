-- Add 'coach' to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'coach';

-- Main draft configuration table
CREATE TABLE public.drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  division_id UUID REFERENCES public.divisions(id),
  program_id UUID REFERENCES public.programs(id),
  season_year INTEGER NOT NULL,
  draft_type TEXT DEFAULT 'snake' CHECK (draft_type IN ('snake', 'linear')),
  status TEXT DEFAULT 'setup' CHECK (status IN ('setup', 'ready', 'in_progress', 'paused', 'completed')),
  scheduled_start TIMESTAMP WITH TIME ZONE,
  actual_start TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  pick_time_limit INTEGER DEFAULT 60,
  auto_pick_enabled BOOLEAN DEFAULT true,
  current_round INTEGER DEFAULT 1,
  current_pick INTEGER DEFAULT 1,
  total_rounds INTEGER DEFAULT 12,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Teams participating in the draft
CREATE TABLE public.draft_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID REFERENCES public.drafts(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.teams(id) NOT NULL,
  coach_user_id UUID,
  draft_order INTEGER NOT NULL,
  is_ready BOOLEAN DEFAULT false,
  auto_pick_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(draft_id, team_id),
  UNIQUE(draft_id, draft_order)
);

-- Players eligible for the draft
CREATE TABLE public.draft_player_pool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID REFERENCES public.drafts(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES public.players(id) NOT NULL,
  is_available BOOLEAN DEFAULT true,
  draft_notes TEXT,
  skill_rating INTEGER CHECK (skill_rating >= 1 AND skill_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(draft_id, player_id)
);

-- Individual draft picks
CREATE TABLE public.draft_picks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID REFERENCES public.drafts(id) ON DELETE CASCADE NOT NULL,
  draft_team_id UUID REFERENCES public.draft_teams(id) NOT NULL,
  player_id UUID REFERENCES public.players(id) NOT NULL,
  round_number INTEGER NOT NULL,
  pick_number INTEGER NOT NULL,
  pick_in_round INTEGER NOT NULL,
  picked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_auto_pick BOOLEAN DEFAULT false,
  time_spent INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(draft_id, player_id),
  UNIQUE(draft_id, pick_number)
);

-- Player queue for coaches (pre-rank players they want)
CREATE TABLE public.draft_player_queues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_team_id UUID REFERENCES public.draft_teams(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES public.players(id) NOT NULL,
  queue_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(draft_team_id, player_id),
  UNIQUE(draft_team_id, queue_order)
);

-- Enable RLS on all draft tables
ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draft_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draft_player_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draft_picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draft_player_queues ENABLE ROW LEVEL SECURITY;

-- RLS Policies for drafts table
CREATE POLICY "Admins have full access to drafts"
ON public.drafts FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Coaches can view drafts they participate in"
ON public.drafts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.draft_teams dt
    WHERE dt.draft_id = drafts.id
    AND dt.coach_user_id = auth.uid()
  )
);

-- RLS Policies for draft_teams table
CREATE POLICY "Admins have full access to draft teams"
ON public.draft_teams FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Coaches can view draft teams in their drafts"
ON public.draft_teams FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.draft_teams my_team
    WHERE my_team.draft_id = draft_teams.draft_id
    AND my_team.coach_user_id = auth.uid()
  )
);

CREATE POLICY "Coaches can update their own draft team"
ON public.draft_teams FOR UPDATE
USING (coach_user_id = auth.uid())
WITH CHECK (coach_user_id = auth.uid());

-- RLS Policies for draft_player_pool table
CREATE POLICY "Admins have full access to draft player pool"
ON public.draft_player_pool FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Coaches can view player pool in their drafts"
ON public.draft_player_pool FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.draft_teams dt
    WHERE dt.draft_id = draft_player_pool.draft_id
    AND dt.coach_user_id = auth.uid()
  )
);

-- RLS Policies for draft_picks table
CREATE POLICY "Admins have full access to draft picks"
ON public.draft_picks FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Coaches can view picks in their drafts"
ON public.draft_picks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.draft_teams dt
    WHERE dt.draft_id = draft_picks.draft_id
    AND dt.coach_user_id = auth.uid()
  )
);

CREATE POLICY "Coaches can insert picks for their team"
ON public.draft_picks FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.draft_teams dt
    WHERE dt.id = draft_picks.draft_team_id
    AND dt.coach_user_id = auth.uid()
  )
);

-- RLS Policies for draft_player_queues table
CREATE POLICY "Admins have full access to draft queues"
ON public.draft_player_queues FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Coaches can manage their own queue"
ON public.draft_player_queues FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.draft_teams dt
    WHERE dt.id = draft_player_queues.draft_team_id
    AND dt.coach_user_id = auth.uid()
  )
);

-- Enable realtime for draft tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.drafts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.draft_picks;

-- Create updated_at trigger for drafts
CREATE TRIGGER update_drafts_updated_at
BEFORE UPDATE ON public.drafts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get current draft pick info
CREATE OR REPLACE FUNCTION public.get_current_pick_team(draft_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_draft RECORD;
  v_team_count INTEGER;
  v_pick_in_round INTEGER;
  v_is_reverse BOOLEAN;
BEGIN
  SELECT current_round, current_pick, draft_type INTO v_draft
  FROM public.drafts WHERE id = draft_id;
  
  SELECT COUNT(*) INTO v_team_count
  FROM public.draft_teams WHERE draft_teams.draft_id = get_current_pick_team.draft_id;
  
  IF v_team_count = 0 THEN
    RETURN NULL;
  END IF;
  
  v_pick_in_round := ((v_draft.current_pick - 1) % v_team_count) + 1;
  v_is_reverse := v_draft.draft_type = 'snake' AND (v_draft.current_round % 2 = 0);
  
  IF v_is_reverse THEN
    v_pick_in_round := v_team_count - v_pick_in_round + 1;
  END IF;
  
  RETURN (
    SELECT dt.id FROM public.draft_teams dt
    WHERE dt.draft_id = get_current_pick_team.draft_id
    AND dt.draft_order = v_pick_in_round
  );
END;
$$;