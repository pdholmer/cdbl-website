-- Update In-House divisions to T-Ball, Pinto, Mustang, Bronco and add Pony
DO $$
DECLARE
  v_program_id uuid := '0a379f62-be88-4f89-87fc-03e621b6e786'; -- CDBL In-House Program
BEGIN
  -- Rename existing divisions to match naming convention and keep ages
  UPDATE public.divisions SET name = 'T-Ball', age_range = '4-6 years', display_order = 1
  WHERE program_id = v_program_id AND name = 'Tee Ball';

  UPDATE public.divisions SET name = 'Pinto', age_range = '7-8 years', display_order = 2
  WHERE program_id = v_program_id AND name = 'Coach Pitch';

  UPDATE public.divisions SET name = 'Mustang', age_range = '9-10 years', display_order = 3
  WHERE program_id = v_program_id AND name = 'Minors';

  UPDATE public.divisions SET name = 'Bronco', age_range = '11-12 years', display_order = 4
  WHERE program_id = v_program_id AND name = 'Majors';

  -- Ensure Pony exists (ages 13-14)
  IF NOT EXISTS (
    SELECT 1 FROM public.divisions WHERE program_id = v_program_id AND name = 'Pony'
  ) THEN
    INSERT INTO public.divisions (id, program_id, name, age_range, display_order)
    VALUES (gen_random_uuid(), v_program_id, 'Pony', '13-14 years', 5);
  END IF;
END $$;