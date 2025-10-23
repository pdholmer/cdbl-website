-- Create audit log table for tracking access to sensitive player data
CREATE TABLE public.player_data_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  accessed_by UUID NOT NULL,
  accessed_by_email TEXT NOT NULL,
  access_type TEXT NOT NULL CHECK (access_type IN ('view', 'update', 'medical_view')),
  ip_address TEXT,
  user_agent TEXT,
  accessed_fields JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.player_data_access_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view all audit logs"
ON public.player_data_access_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- System can insert audit logs (via service role)
CREATE POLICY "System can insert audit logs"
ON public.player_data_access_log
FOR INSERT
WITH CHECK (true);

-- Create index for better query performance
CREATE INDEX idx_player_data_access_log_player_id ON public.player_data_access_log(player_id);
CREATE INDEX idx_player_data_access_log_accessed_by ON public.player_data_access_log(accessed_by);
CREATE INDEX idx_player_data_access_log_created_at ON public.player_data_access_log(created_at DESC);

-- Create function to log player data access
CREATE OR REPLACE FUNCTION public.log_player_access(
  _player_id UUID,
  _access_type TEXT,
  _accessed_fields JSONB DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.player_data_access_log (
    player_id,
    accessed_by,
    accessed_by_email,
    access_type,
    accessed_fields
  )
  VALUES (
    _player_id,
    auth.uid(),
    get_user_email(),
    _access_type,
    _accessed_fields
  );
END;
$$;