-- Step 1: public.seasons
CREATE TABLE public.seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year text UNIQUE,
  label text,
  is_current boolean NOT NULL DEFAULT false,
  age_cutoff_date date,
  school_year_start date,
  locked_at timestamptz,
  starts_on date,
  ends_on date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.seasons TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seasons TO authenticated;
GRANT ALL ON public.seasons TO service_role;

ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Seasons are viewable by everyone"
  ON public.seasons FOR SELECT
  USING (true);

CREATE POLICY "Admins manage seasons"
  ON public.seasons FOR ALL
  TO authenticated
  USING (public.has_admin_access(auth.uid()))
  WITH CHECK (public.has_admin_access(auth.uid()));

CREATE UNIQUE INDEX seasons_one_current_idx
  ON public.seasons ((is_current))
  WHERE is_current = true;

CREATE TRIGGER update_seasons_updated_at
  BEFORE UPDATE ON public.seasons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Step 2: programs.season_id
ALTER TABLE public.programs
  ADD COLUMN season_id uuid NULL
  REFERENCES public.seasons(id) ON DELETE RESTRICT;

CREATE INDEX programs_season_id_idx
  ON public.programs (season_id);

-- Step 3: current_season(p_program_id)
CREATE OR REPLACE FUNCTION public.current_season(p_program_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.id
  FROM public.programs p
  JOIN public.seasons s ON s.id = p.season_id
  WHERE p.id = p_program_id
    AND s.is_current = true
  LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.current_season(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_season(uuid) TO authenticated, service_role;