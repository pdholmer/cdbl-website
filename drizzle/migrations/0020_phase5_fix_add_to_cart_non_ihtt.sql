CREATE OR REPLACE FUNCTION public.add_to_my_cart(_registration_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_reg RECORD; v_hh uuid; v_cart uuid; v_g uuid; v_in_id uuid; v_in_checkout uuid; v_in_life text;
BEGIN
  SELECT * INTO v_reg FROM public.registrations WHERE id = _registration_id AND league_id = public.current_league_id();
  IF v_reg.id IS NULL OR NOT public.is_guardian_of_player(v_reg.player_id) THEN RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501'; END IF;
  IF v_reg.lifecycle <> 'draft' THEN RAISE EXCEPTION 'This registration is already in checkout' USING ERRCODE = 'check_violation'; END IF;
  SELECT hp.household_id INTO v_hh FROM public.household_players hp
   WHERE hp.player_id = v_reg.player_id AND public.is_guardian_of_household(hp.household_id) LIMIT 1;
  SELECT g.id INTO v_g FROM public.guardians g WHERE g.auth_user_id = auth.uid() LIMIT 1;

  IF v_reg.kind = 'ihtt' THEN
    SELECT r.id, r.checkout_id, r.lifecycle INTO v_in_id, v_in_checkout, v_in_life
    FROM public.registrations r JOIN public.programs p ON p.id = r.program_id AND p.type = 'in_house'
     WHERE r.player_id = v_reg.player_id AND r.season_id = v_reg.season_id AND r.lifecycle <> 'cancelled' LIMIT 1;
    v_cart := v_in_checkout;
  END IF;
  IF v_cart IS NULL OR NOT EXISTS (SELECT 1 FROM public.carts WHERE id = v_cart) THEN
    SELECT id INTO v_cart FROM public.carts WHERE household_id = v_hh AND season_id = v_reg.season_id AND status = 'open'
     ORDER BY created_at DESC LIMIT 1;
  END IF;
  IF v_cart IS NULL OR NOT EXISTS (SELECT 1 FROM public.carts WHERE id = v_cart) THEN
    INSERT INTO public.carts (id, season_id, household_id, created_by_guardian)
    VALUES (coalesce(v_cart, gen_random_uuid()), v_reg.season_id, v_hh, v_g) RETURNING id INTO v_cart;
  END IF;
  IF (SELECT status FROM public.carts WHERE id = v_cart) <> 'open' THEN
    RAISE EXCEPTION 'That checkout has already started' USING ERRCODE = 'check_violation'; END IF;
  UPDATE public.registrations SET checkout_id = v_cart WHERE id = _registration_id;
  IF v_in_id IS NOT NULL AND v_in_checkout IS DISTINCT FROM v_cart AND v_in_life = 'draft' THEN
    UPDATE public.registrations SET checkout_id = v_cart WHERE id = v_in_id;
  END IF;
  RETURN v_cart;
END $$;
REVOKE ALL ON FUNCTION public.add_to_my_cart(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.add_to_my_cart(uuid) TO authenticated;