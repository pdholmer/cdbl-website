-- Create team_tasks table for team-specific tasks and milestones
CREATE TABLE public.team_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL DEFAULT 'task' CHECK (task_type IN ('task', 'milestone')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES public.coaches(id) ON DELETE SET NULL,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team_important_dates table
CREATE TABLE public.team_important_dates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date_value DATE NOT NULL,
  date_type TEXT NOT NULL DEFAULT 'other' CHECK (date_type IN ('practice_start', 'season_start', 'season_end', 'tournament', 'tryout', 'other')),
  description TEXT,
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create committee_tasks table for board/committee task tracking
CREATE TABLE public.committee_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  committee TEXT NOT NULL CHECK (committee IN ('board', 'fundraising', 'fields', 'concessions', 'equipment', 'events', 'communications', 'safety', 'umpires', 'other')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'blocked')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  assigned_to UUID,
  created_by UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create concession_inventory table
CREATE TABLE public.concession_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('food', 'beverage', 'snack', 'supplies', 'other')),
  unit_type TEXT NOT NULL DEFAULT 'each' CHECK (unit_type IN ('each', 'case', 'box', 'pack', 'lb', 'oz')),
  current_quantity INTEGER NOT NULL DEFAULT 0,
  minimum_quantity INTEGER NOT NULL DEFAULT 5,
  unit_cost DECIMAL(10,2),
  sale_price DECIMAL(10,2),
  vendor TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  last_restocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create concession_employees table
CREATE TABLE public.concession_employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'volunteer' CHECK (role IN ('manager', 'volunteer', 'cashier')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create concession_shifts table
CREATE TABLE public.concession_shifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.concession_employees(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.team_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_important_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committee_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concession_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concession_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concession_shifts ENABLE ROW LEVEL SECURITY;

-- RLS policies for team_tasks (admins, board members, coaches of the team)
CREATE POLICY "Admin full access to team_tasks" ON public.team_tasks FOR ALL USING (public.has_admin_access(auth.uid()));
CREATE POLICY "Coaches can view their team tasks" ON public.team_tasks FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.team_coaches tc WHERE tc.team_id = team_tasks.team_id AND tc.coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid()))
);
CREATE POLICY "Coaches can manage their team tasks" ON public.team_tasks FOR ALL USING (
  EXISTS (SELECT 1 FROM public.team_coaches tc WHERE tc.team_id = team_tasks.team_id AND tc.coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid()))
);

-- RLS policies for team_important_dates
CREATE POLICY "Admin full access to team_important_dates" ON public.team_important_dates FOR ALL USING (public.has_admin_access(auth.uid()));
CREATE POLICY "Coaches can view their team dates" ON public.team_important_dates FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.team_coaches tc WHERE tc.team_id = team_important_dates.team_id AND tc.coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid()))
);

-- RLS policies for committee_tasks
CREATE POLICY "Admin full access to committee_tasks" ON public.committee_tasks FOR ALL USING (public.has_admin_access(auth.uid()));
CREATE POLICY "Board members can view committee_tasks" ON public.committee_tasks FOR SELECT USING (public.has_admin_access(auth.uid()));

-- RLS policies for concession tables
CREATE POLICY "Admin full access to concession_inventory" ON public.concession_inventory FOR ALL USING (public.has_admin_access(auth.uid()));
CREATE POLICY "Admin full access to concession_employees" ON public.concession_employees FOR ALL USING (public.has_admin_access(auth.uid()));
CREATE POLICY "Admin full access to concession_shifts" ON public.concession_shifts FOR ALL USING (public.has_admin_access(auth.uid()));

-- Add triggers for updated_at
CREATE TRIGGER update_team_tasks_updated_at BEFORE UPDATE ON public.team_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_team_important_dates_updated_at BEFORE UPDATE ON public.team_important_dates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_committee_tasks_updated_at BEFORE UPDATE ON public.committee_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_concession_inventory_updated_at BEFORE UPDATE ON public.concession_inventory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_concession_employees_updated_at BEFORE UPDATE ON public.concession_employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_concession_shifts_updated_at BEFORE UPDATE ON public.concession_shifts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();