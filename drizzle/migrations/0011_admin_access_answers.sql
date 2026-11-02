CREATE OR REPLACE FUNCTION public.requires_mfa(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin','registrar','treasurer','background_checks','commissioner','board_member')) $$;

CREATE POLICY "Commissioners update their divisions" ON public.divisions FOR UPDATE TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND public.is_commissioner_for(auth.uid(), program_id, id))
  WITH CHECK (league_id = (SELECT public.current_league_id()) AND public.is_commissioner_for(auth.uid(), program_id, id));

CREATE OR REPLACE FUNCTION public.guard_division_fee_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.cost IS DISTINCT FROM OLD.cost AND auth.uid() IS NOT NULL
     AND NOT public.has_any_role(auth.uid(), ARRAY['admin','board_member','treasurer']::app_role[]) THEN
    RAISE EXCEPTION 'Only the treasurer or an admin can change a division fee' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_divisions_guard_fee BEFORE UPDATE ON public.divisions
  FOR EACH ROW EXECUTE FUNCTION public.guard_division_fee_change();

DROP POLICY "Commissioners view documents in their scope" ON public.player_documents;