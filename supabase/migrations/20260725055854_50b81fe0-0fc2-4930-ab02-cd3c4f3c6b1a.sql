
-- Households
CREATE TABLE public.guardian_households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guardian_households TO authenticated;
GRANT ALL ON public.guardian_households TO service_role;
ALTER TABLE public.guardian_households ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.guardian_household_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.guardian_households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner','member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (household_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guardian_household_members TO authenticated;
GRANT ALL ON public.guardian_household_members TO service_role;
ALTER TABLE public.guardian_household_members ENABLE ROW LEVEL SECURITY;

-- Security-definer helper to avoid RLS recursion when checking membership
CREATE OR REPLACE FUNCTION public.is_household_member(_user_id UUID, _household_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.guardian_household_members
    WHERE user_id = _user_id AND household_id = _household_id
  )
$$;

CREATE OR REPLACE FUNCTION public.is_household_owner(_user_id UUID, _household_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.guardian_household_members
    WHERE user_id = _user_id AND household_id = _household_id AND role = 'owner'
  )
$$;

-- Household policies
CREATE POLICY "Members can view their households" ON public.guardian_households
  FOR SELECT TO authenticated
  USING (public.is_household_member(auth.uid(), id));

CREATE POLICY "Authenticated can create households" ON public.guardian_households
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Owners can update household" ON public.guardian_households
  FOR UPDATE TO authenticated
  USING (public.is_household_owner(auth.uid(), id));

CREATE POLICY "Owners can delete household" ON public.guardian_households
  FOR DELETE TO authenticated
  USING (public.is_household_owner(auth.uid(), id));

-- Member policies
CREATE POLICY "Users see their memberships" ON public.guardian_household_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_household_member(auth.uid(), household_id));

CREATE POLICY "Users can add themselves as first member" ON public.guardian_household_members
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_household_owner(auth.uid(), household_id));

CREATE POLICY "Owners can update members" ON public.guardian_household_members
  FOR UPDATE TO authenticated
  USING (public.is_household_owner(auth.uid(), household_id));

CREATE POLICY "Owners can delete members" ON public.guardian_household_members
  FOR DELETE TO authenticated
  USING (public.is_household_owner(auth.uid(), household_id) OR user_id = auth.uid());

CREATE TRIGGER update_guardian_households_updated_at
  BEFORE UPDATE ON public.guardian_households
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Email hard-bounce list
CREATE TABLE public.email_bounces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  reason TEXT,
  bounce_type TEXT NOT NULL DEFAULT 'hard',
  source TEXT,
  bounced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX email_bounces_email_idx ON public.email_bounces (lower(email));
CREATE INDEX email_bounces_unresolved_idx ON public.email_bounces (resolved, bounced_at DESC);

GRANT SELECT, UPDATE ON public.email_bounces TO authenticated;
GRANT ALL ON public.email_bounces TO service_role;
ALTER TABLE public.email_bounces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins/board can view bounces" ON public.email_bounces
  FOR SELECT TO authenticated
  USING (public.has_admin_access(auth.uid()));

CREATE POLICY "Admins/board can update bounces" ON public.email_bounces
  FOR UPDATE TO authenticated
  USING (public.has_admin_access(auth.uid()));
