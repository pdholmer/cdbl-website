-- Add missing travel divisions (9U, 11U, 13U) and update display_order
DO $$
DECLARE
  v_travel_program_id uuid := '09dbe257-e659-4184-b217-fa9a15707bb5'; -- Travel Program
BEGIN
  -- Update existing travel divisions display_order to make room for new ones
  UPDATE public.divisions SET display_order = 7
  WHERE program_id = v_travel_program_id AND name = '14U Travel';
  
  UPDATE public.divisions SET display_order = 5
  WHERE program_id = v_travel_program_id AND name = '12U Travel';
  
  UPDATE public.divisions SET display_order = 3
  WHERE program_id = v_travel_program_id AND name = '10U Travel';

  -- Add 9U Travel division
  IF NOT EXISTS (
    SELECT 1 FROM public.divisions WHERE program_id = v_travel_program_id AND name = '9U Travel'
  ) THEN
    INSERT INTO public.divisions (id, program_id, name, age_range, cost, season_length, display_order, features)
    VALUES (
      gen_random_uuid(), 
      v_travel_program_id, 
      '9U Travel', 
      '9 years and under', 
      1625, 
      'Spring through Summer',
      2,
      '["Competitive tournament play", "2-3 practices per week", "Professional coaching", "Travel to regional tournaments"]'::jsonb
    );
  END IF;

  -- Add 11U Travel division
  IF NOT EXISTS (
    SELECT 1 FROM public.divisions WHERE program_id = v_travel_program_id AND name = '11U Travel'
  ) THEN
    INSERT INTO public.divisions (id, program_id, name, age_range, cost, season_length, display_order, features)
    VALUES (
      gen_random_uuid(), 
      v_travel_program_id, 
      '11U Travel', 
      '11 years and under', 
      1875, 
      'Year-round',
      4,
      '["Competitive tournament play", "3-4 practices per week", "Professional coaching", "Regional and national tournaments"]'::jsonb
    );
  END IF;

  -- Add 13U Travel division
  IF NOT EXISTS (
    SELECT 1 FROM public.divisions WHERE program_id = v_travel_program_id AND name = '13U Travel'
  ) THEN
    INSERT INTO public.divisions (id, program_id, name, age_range, cost, season_length, display_order, features)
    VALUES (
      gen_random_uuid(), 
      v_travel_program_id, 
      '13U Travel', 
      '13 years and under', 
      2125, 
      'Year-round',
      6,
      '["Elite tournament play", "4-5 practices per week", "Professional coaching", "National tournament exposure"]'::jsonb
    );
  END IF;
END $$;