-- Create commissioner_assignments table
CREATE TABLE public.commissioner_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  program_id uuid NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  division_id uuid REFERENCES public.divisions(id) ON DELETE SET NULL,
  assigned_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, program_id, division_id)
);

-- Enable RLS on commissioner_assignments
ALTER TABLE public.commissioner_assignments ENABLE ROW LEVEL SECURITY;

-- RLS policies for commissioner_assignments
CREATE POLICY "Admins have full access to commissioner assignments"
ON public.commissioner_assignments
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Commissioners can view their own assignments"
ON public.commissioner_assignments
FOR SELECT
USING (user_id = auth.uid());

-- Create coach_invitations table
CREATE TABLE public.coach_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  program_id uuid REFERENCES public.programs(id) ON DELETE SET NULL,
  division_id uuid REFERENCES public.divisions(id) ON DELETE SET NULL,
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  invited_by uuid,
  token uuid DEFAULT gen_random_uuid() UNIQUE,
  status text DEFAULT 'pending',
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now(),
  accepted_at timestamptz
);

-- Enable RLS on coach_invitations
ALTER TABLE public.coach_invitations ENABLE ROW LEVEL SECURITY;

-- RLS policies for coach_invitations
CREATE POLICY "Admins have full access to coach invitations"
ON public.coach_invitations
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Commissioners can manage invitations for their programs"
ON public.coach_invitations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.commissioner_assignments ca
    WHERE ca.user_id = auth.uid()
      AND ca.program_id = coach_invitations.program_id
      AND (ca.division_id IS NULL OR ca.division_id = coach_invitations.division_id)
  )
);

CREATE POLICY "Public can view invitation by token"
ON public.coach_invitations
FOR SELECT
USING (true);

-- Create helper function for commissioner checks
CREATE OR REPLACE FUNCTION public.is_commissioner_for(_user_id uuid, _program_id uuid, _division_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.commissioner_assignments
    WHERE user_id = _user_id
      AND program_id = _program_id
      AND (division_id IS NULL OR _division_id IS NULL OR division_id = _division_id)
  )
$$;

-- Add updated_at trigger for commissioner_assignments
CREATE TRIGGER update_commissioner_assignments_updated_at
BEFORE UPDATE ON public.commissioner_assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Grant commissioners read access to players in their programs
CREATE POLICY "Commissioners can view players in their programs"
ON public.players
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.commissioner_assignments ca
    WHERE ca.user_id = auth.uid()
      AND ca.program_id = players.program_id
      AND (ca.division_id IS NULL OR ca.division_id = players.division_id)
  )
);

-- Grant commissioners update access to players in their programs  
CREATE POLICY "Commissioners can update players in their programs"
ON public.players
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.commissioner_assignments ca
    WHERE ca.user_id = auth.uid()
      AND ca.program_id = players.program_id
      AND (ca.division_id IS NULL OR ca.division_id = players.division_id)
  )
);

-- Grant commissioners access to teams in their programs
CREATE POLICY "Commissioners can view teams in their programs"
ON public.teams
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.commissioner_assignments ca
    WHERE ca.user_id = auth.uid()
      AND ca.program_id = teams.program_id
      AND (ca.division_id IS NULL OR ca.division_id = teams.division_id)
  )
);

CREATE POLICY "Commissioners can manage teams in their programs"
ON public.teams
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.commissioner_assignments ca
    WHERE ca.user_id = auth.uid()
      AND ca.program_id = teams.program_id
      AND (ca.division_id IS NULL OR ca.division_id = teams.division_id)
  )
);

-- Grant commissioners access to games in their divisions
CREATE POLICY "Commissioners can manage games in their programs"
ON public.games
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.commissioner_assignments ca
    JOIN public.divisions d ON d.id = games.division_id
    WHERE ca.user_id = auth.uid()
      AND ca.program_id = d.program_id
      AND (ca.division_id IS NULL OR ca.division_id = games.division_id)
  )
);

-- Grant commissioners access to drafts in their programs
CREATE POLICY "Commissioners can manage drafts in their programs"
ON public.drafts
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.commissioner_assignments ca
    WHERE ca.user_id = auth.uid()
      AND ca.program_id = drafts.program_id
      AND (ca.division_id IS NULL OR ca.division_id = drafts.division_id)
  )
);

-- Grant commissioners access to coaches table
CREATE POLICY "Commissioners can view coaches"
ON public.coaches
FOR SELECT
USING (has_role(auth.uid(), 'commissioner'));

-- Grant commissioners access to team_coaches in their programs
CREATE POLICY "Commissioners can manage team coaches in their programs"
ON public.team_coaches
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.commissioner_assignments ca
    JOIN public.teams t ON t.id = team_coaches.team_id
    WHERE ca.user_id = auth.uid()
      AND ca.program_id = t.program_id
      AND (ca.division_id IS NULL OR ca.division_id = t.division_id)
  )
);

-- Grant commissioners access to draft_teams in their programs
CREATE POLICY "Commissioners can manage draft teams in their programs"
ON public.draft_teams
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.commissioner_assignments ca
    JOIN public.drafts d ON d.id = draft_teams.draft_id
    WHERE ca.user_id = auth.uid()
      AND ca.program_id = d.program_id
      AND (ca.division_id IS NULL OR ca.division_id = d.division_id)
  )
);

-- Grant commissioners access to draft_player_pool in their programs
CREATE POLICY "Commissioners can manage draft player pool in their programs"
ON public.draft_player_pool
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.commissioner_assignments ca
    JOIN public.drafts d ON d.id = draft_player_pool.draft_id
    WHERE ca.user_id = auth.uid()
      AND ca.program_id = d.program_id
      AND (ca.division_id IS NULL OR ca.division_id = d.division_id)
  )
);

-- Grant commissioners access to draft_picks in their programs
CREATE POLICY "Commissioners can manage draft picks in their programs"
ON public.draft_picks
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.commissioner_assignments ca
    JOIN public.drafts d ON d.id = draft_picks.draft_id
    WHERE ca.user_id = auth.uid()
      AND ca.program_id = d.program_id
      AND (ca.division_id IS NULL OR ca.division_id = d.division_id)
  )
);

-- Grant commissioners access to team_rosters in their programs
CREATE POLICY "Commissioners can manage team rosters in their programs"
ON public.team_rosters
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.commissioner_assignments ca
    JOIN public.teams t ON t.id = team_rosters.team_id
    WHERE ca.user_id = auth.uid()
      AND ca.program_id = t.program_id
      AND (ca.division_id IS NULL OR ca.division_id = t.division_id)
  )
);