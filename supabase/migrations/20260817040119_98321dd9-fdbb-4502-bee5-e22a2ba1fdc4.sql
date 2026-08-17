DO $$
DECLARE v_hh uuid := '3a7fd5e5-5ff5-476e-9eb6-7930bb50ecc4';
BEGIN
  IF EXISTS (SELECT 1 FROM public.household_players WHERE household_id = v_hh) THEN
    RAISE EXCEPTION 'Aborting: household_players rows reference %', v_hh;
  END IF;
  DELETE FROM public.guardian_households WHERE household_id = v_hh;
  DELETE FROM public.households WHERE id = v_hh;
END $$;