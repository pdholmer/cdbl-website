-- Job 1: kill email-based auth on player_guardians
DROP POLICY IF EXISTS "Parents can view their children's guardians" ON public.player_guardians;

CREATE POLICY "Guardians view via household path"
  ON public.player_guardians
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_guardian_of_player(player_id)));

COMMENT ON TABLE public.player_guardians IS 'DEPRECATED: superseded by guardians + guardian_households + households (Phase C import). Do not write. Read only for migration reconciliation.';

-- Job 2: revoke anon default DML on registrations
REVOKE ALL ON public.registrations FROM anon;

-- Job 3: close the anon INSERT hole on registration_code_uses
REVOKE ALL ON public.registration_code_uses FROM anon;

DROP POLICY IF EXISTS "Anyone can use codes" ON public.registration_code_uses;

CREATE POLICY "Authenticated users can record code use"
  ON public.registration_code_uses
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
