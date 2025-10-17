-- Create a security definer function to assign admin role to first user
CREATE OR REPLACE FUNCTION public.assign_first_user_admin(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if this is the first user (no roles exist yet)
  IF NOT EXISTS (SELECT 1 FROM public.user_roles LIMIT 1) THEN
    -- Insert admin role for this user
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, 'admin'::app_role);
    RETURN true;
  END IF;
  RETURN false;
END;
$$;