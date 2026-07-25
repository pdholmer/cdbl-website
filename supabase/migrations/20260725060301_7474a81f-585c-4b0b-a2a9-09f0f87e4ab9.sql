ALTER TABLE public.programs
  ADD COLUMN IF NOT EXISTS tryout_registration_url TEXT,
  ADD COLUMN IF NOT EXISTS coach_registration_url TEXT;