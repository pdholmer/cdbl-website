-- Create registration codes table
CREATE TABLE public.registration_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'free')),
  discount_value NUMERIC(10, 2) NOT NULL DEFAULT 0,
  program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
  division_id UUID REFERENCES public.divisions(id) ON DELETE SET NULL,
  max_uses INTEGER,
  current_uses INTEGER NOT NULL DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table to track code redemptions
CREATE TABLE public.registration_code_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id UUID NOT NULL REFERENCES public.registration_codes(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  original_amount NUMERIC(10, 2),
  discount_applied NUMERIC(10, 2),
  final_amount NUMERIC(10, 2)
);

-- Enable RLS
ALTER TABLE public.registration_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_code_uses ENABLE ROW LEVEL SECURITY;

-- Admins and board members can view all codes
CREATE POLICY "Staff can view registration codes"
  ON public.registration_codes FOR SELECT
  USING (public.has_admin_access(auth.uid()));

-- Only admins can create/update/delete codes
CREATE POLICY "Admins can manage registration codes"
  ON public.registration_codes FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Staff can view code uses
CREATE POLICY "Staff can view code uses"
  ON public.registration_code_uses FOR SELECT
  USING (public.has_admin_access(auth.uid()));

-- Anyone can insert code uses (during registration)
CREATE POLICY "Anyone can use codes"
  ON public.registration_code_uses FOR INSERT
  WITH CHECK (true);

-- Create function to validate and apply a registration code
CREATE OR REPLACE FUNCTION public.validate_registration_code(
  _code TEXT,
  _program_id UUID DEFAULT NULL,
  _division_id UUID DEFAULT NULL
)
RETURNS TABLE (
  is_valid BOOLEAN,
  code_id UUID,
  discount_type TEXT,
  discount_value NUMERIC,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_code RECORD;
BEGIN
  -- Find the code
  SELECT * INTO v_code 
  FROM public.registration_codes rc
  WHERE UPPER(rc.code) = UPPER(_code)
  AND rc.is_active = true;
  
  -- Code not found
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::NUMERIC, 'Invalid code';
    RETURN;
  END IF;
  
  -- Check if code has expired
  IF v_code.valid_until IS NOT NULL AND v_code.valid_until < now() THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::NUMERIC, 'Code has expired';
    RETURN;
  END IF;
  
  -- Check if code hasn't started yet
  IF v_code.valid_from > now() THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::NUMERIC, 'Code is not yet valid';
    RETURN;
  END IF;
  
  -- Check max uses
  IF v_code.max_uses IS NOT NULL AND v_code.current_uses >= v_code.max_uses THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::NUMERIC, 'Code has reached maximum uses';
    RETURN;
  END IF;
  
  -- Check program restriction
  IF v_code.program_id IS NOT NULL AND _program_id IS NOT NULL AND v_code.program_id != _program_id THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::NUMERIC, 'Code is not valid for this program';
    RETURN;
  END IF;
  
  -- Check division restriction
  IF v_code.division_id IS NOT NULL AND _division_id IS NOT NULL AND v_code.division_id != _division_id THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::NUMERIC, 'Code is not valid for this division';
    RETURN;
  END IF;
  
  -- Code is valid
  RETURN QUERY SELECT true, v_code.id, v_code.discount_type, v_code.discount_value, NULL::TEXT;
END;
$function$;

-- Create function to redeem a registration code
CREATE OR REPLACE FUNCTION public.redeem_registration_code(
  _code_id UUID,
  _player_id UUID DEFAULT NULL,
  _original_amount NUMERIC DEFAULT NULL,
  _discount_applied NUMERIC DEFAULT NULL,
  _final_amount NUMERIC DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert usage record
  INSERT INTO public.registration_code_uses (
    code_id,
    player_id,
    user_id,
    original_amount,
    discount_applied,
    final_amount
  ) VALUES (
    _code_id,
    _player_id,
    auth.uid(),
    _original_amount,
    _discount_applied,
    _final_amount
  );
  
  -- Increment usage count
  UPDATE public.registration_codes
  SET current_uses = current_uses + 1,
      updated_at = now()
  WHERE id = _code_id;
  
  RETURN true;
END;
$function$;

-- Add updated_at trigger
CREATE TRIGGER update_registration_codes_updated_at
  BEFORE UPDATE ON public.registration_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();