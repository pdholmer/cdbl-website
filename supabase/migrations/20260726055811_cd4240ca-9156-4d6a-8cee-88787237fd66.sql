GRANT EXECUTE ON FUNCTION public.is_guardian_of_player(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_guardian_of_household(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_coach_of(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.is_guardian_of_player(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_guardian_of_household(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_coach_of(uuid) FROM anon;