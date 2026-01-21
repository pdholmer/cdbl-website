-- Create function to assign default board_member role to new users
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Skip if user already has admin role (from assign_first_user_admin)
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = NEW.id AND role = 'admin'
  ) THEN
    -- Assign board_member role if not already assigned
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = NEW.id AND role = 'board_member'
    ) THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, 'board_member'::app_role);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to auto-assign board_member role on user creation
DROP TRIGGER IF EXISTS on_auth_user_created_assign_default_role ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_default_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_default_role();

-- Create helper function to check if user has admin or board_member role
CREATE OR REPLACE FUNCTION public.has_admin_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'board_member')
  )
$$;