CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles app_role[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = ANY(_roles)) $$;
REVOKE ALL ON FUNCTION public.has_any_role(uuid, app_role[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_any_role(uuid, app_role[]) TO authenticated;

CREATE OR REPLACE FUNCTION public.requires_mfa(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin','registrar','treasurer','background_checks','commissioner')) $$;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['registrations','households','guardians','guardian_households','household_players','player_documents','league_players'] LOOP
    EXECUTE format('CREATE POLICY "Registrar reads %1$s" ON public.%1$I FOR SELECT TO authenticated USING (league_id = (SELECT public.current_league_id()) AND (SELECT public.has_role(auth.uid(),''registrar'')))', t);
    EXECUTE format('CREATE POLICY "Registrar inserts %1$s" ON public.%1$I FOR INSERT TO authenticated WITH CHECK (league_id = (SELECT public.current_league_id()) AND (SELECT public.has_role(auth.uid(),''registrar'')))', t);
    EXECUTE format('CREATE POLICY "Registrar updates %1$s" ON public.%1$I FOR UPDATE TO authenticated USING (league_id = (SELECT public.current_league_id()) AND (SELECT public.has_role(auth.uid(),''registrar''))) WITH CHECK (league_id = (SELECT public.current_league_id()) AND (SELECT public.has_role(auth.uid(),''registrar'')))', t);
  END LOOP;
END $$;

CREATE POLICY "Registrar reads players" ON public.players FOR SELECT TO authenticated
  USING ((SELECT public.has_role(auth.uid(),'registrar')) AND EXISTS (SELECT 1 FROM public.league_players lp
         WHERE lp.player_id = players.id AND lp.league_id = (SELECT public.current_league_id())));
CREATE POLICY "Registrar updates players" ON public.players FOR UPDATE TO authenticated
  USING ((SELECT public.has_role(auth.uid(),'registrar')) AND EXISTS (SELECT 1 FROM public.league_players lp
         WHERE lp.player_id = players.id AND lp.league_id = (SELECT public.current_league_id())))
  WITH CHECK ((SELECT public.has_role(auth.uid(),'registrar')) AND EXISTS (SELECT 1 FROM public.league_players lp
         WHERE lp.player_id = players.id AND lp.league_id = (SELECT public.current_league_id())));

CREATE POLICY "Registrar reads player-documents objects" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'player-documents' AND public.has_role(auth.uid(),'registrar'));
CREATE POLICY "Registrar uploads player-documents objects" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'player-documents' AND public.has_role(auth.uid(),'registrar'));

CREATE OR REPLACE FUNCTION public.create_player_in_league(_league_id uuid, _player jsonb)
 RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE new_id uuid; payload jsonb;
BEGIN
  IF NOT public.has_any_role(auth.uid(), ARRAY['admin','registrar']::app_role[]) THEN
    RAISE EXCEPTION 'not authorized: admin or registrar role required';
  END IF;
  IF _league_id IS NULL THEN RAISE EXCEPTION 'league_id required'; END IF;
  payload := _player - 'id' - 'created_at' - 'updated_at';
  new_id := gen_random_uuid();
  payload := payload || jsonb_build_object('id', new_id);
  INSERT INTO public.players SELECT * FROM jsonb_populate_record(NULL::public.players, payload);
  INSERT INTO public.league_players (league_id, player_id, status) VALUES (_league_id, new_id, 'active');
  RETURN new_id;
END;
$function$;

CREATE POLICY "Treasurer reads registrations" ON public.registrations FOR SELECT TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND (SELECT public.has_role(auth.uid(),'treasurer')));
CREATE POLICY "Treasurer reads fee changes" ON public.division_fee_changes FOR SELECT TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND (SELECT public.has_role(auth.uid(),'treasurer')));
CREATE POLICY "Treasurer reads registration codes" ON public.registration_codes FOR SELECT TO authenticated
  USING ((SELECT public.has_role(auth.uid(),'treasurer')));

CREATE OR REPLACE FUNCTION public.set_division_fee(_division_id uuid, _cost numeric)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_any_role(auth.uid(), ARRAY['admin','treasurer']::app_role[]) OR NOT public.mfa_satisfied() THEN
    RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501'; END IF;
  UPDATE public.divisions SET cost = _cost
   WHERE id = _division_id AND league_id = public.current_league_id();
END $$;
REVOKE ALL ON FUNCTION public.set_division_fee(uuid, numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_division_fee(uuid, numeric) TO authenticated;

CREATE POLICY "Background checks read coaches" ON public.coaches FOR SELECT TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND (SELECT public.has_role(auth.uid(),'background_checks')));

CREATE OR REPLACE FUNCTION public.set_coach_clearance(_coach_id uuid, _status text, _date date, _expiry date)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_any_role(auth.uid(), ARRAY['admin','background_checks']::app_role[]) OR NOT public.mfa_satisfied() THEN
    RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501'; END IF;
  UPDATE public.coaches SET background_check_status = _status,
         background_check_date = _date, background_check_expiry = _expiry
   WHERE id = _coach_id AND league_id = public.current_league_id();
END $$;
REVOKE ALL ON FUNCTION public.set_coach_clearance(uuid, text, date, date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_coach_clearance(uuid, text, date, date) TO authenticated;

CREATE POLICY "Commissioners view practices in their programs" ON public.practices FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.teams t
         WHERE t.id = practices.team_id AND t.league_id = (SELECT public.current_league_id())
           AND public.is_commissioner_for(auth.uid(), t.program_id, t.division_id)));

DROP POLICY "Commissioners update assigned registrations" ON public.registrations;