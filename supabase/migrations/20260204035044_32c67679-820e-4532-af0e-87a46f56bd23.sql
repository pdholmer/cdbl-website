-- Add 'parent' role to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'parent';

-- Create a table to track pending role requests
CREATE TABLE public.role_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_role app_role NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reason TEXT,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewer_notes TEXT,
  UNIQUE(user_id, requested_role, status)
);

-- Enable RLS on role_requests
ALTER TABLE public.role_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view own role requests"
  ON public.role_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert requests for themselves
CREATE POLICY "Users can create own role requests"
  ON public.role_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Admins and board members can view all requests
CREATE POLICY "Admins can view all role requests"
  ON public.role_requests FOR SELECT
  USING (public.has_admin_access(auth.uid()));

-- Admins can update requests (approve/reject)
CREATE POLICY "Admins can update role requests"
  ON public.role_requests FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Update the default role assignment to use 'parent' instead of 'board_member'
CREATE OR REPLACE FUNCTION public.assign_default_role()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
BEGIN
  -- Skip if user already has admin role (from assign_first_user_admin)
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = NEW.id AND role = 'admin'
  ) THEN
    -- Assign parent role if not already assigned (default role for public sign-ups)
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = NEW.id
    ) THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, 'parent'::app_role);
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- Create function to approve role requests
CREATE OR REPLACE FUNCTION public.approve_role_request(request_id UUID, notes TEXT DEFAULT NULL)
  RETURNS BOOLEAN
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
DECLARE
  v_request RECORD;
BEGIN
  -- Get the request
  SELECT * INTO v_request FROM public.role_requests WHERE id = request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found or already processed';
  END IF;
  
  -- Verify caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can approve role requests';
  END IF;
  
  -- Update request status
  UPDATE public.role_requests 
  SET status = 'approved', 
      reviewed_by = auth.uid(), 
      reviewed_at = now(),
      reviewer_notes = notes
  WHERE id = request_id;
  
  -- Add the role to the user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_request.user_id, v_request.requested_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN TRUE;
END;
$function$;

-- Create function to reject role requests
CREATE OR REPLACE FUNCTION public.reject_role_request(request_id UUID, notes TEXT DEFAULT NULL)
  RETURNS BOOLEAN
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
BEGIN
  -- Verify caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can reject role requests';
  END IF;
  
  -- Update request status
  UPDATE public.role_requests 
  SET status = 'rejected', 
      reviewed_by = auth.uid(), 
      reviewed_at = now(),
      reviewer_notes = notes
  WHERE id = request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found or already processed';
  END IF;
  
  RETURN TRUE;
END;
$function$;