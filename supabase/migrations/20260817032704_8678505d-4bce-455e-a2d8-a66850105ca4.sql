
GRANT SELECT ON public.player_guardians TO authenticated;
GRANT SELECT ON public.suppressed_emails TO authenticated;
GRANT ALL ON public.player_guardians TO service_role;
GRANT ALL ON public.suppressed_emails TO service_role;
