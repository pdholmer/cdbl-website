
-- Add internal authorization checks to definer helpers so they are safe as PostgREST RPCs.
-- Rule: a SECURITY DEFINER function granted to a role is a public API; it must self-authorize.

CREATE OR REPLACE FUNCTION public.get_primary_guardian_for_player(_player_id uuid)
 RETURNS TABLE(household_id uuid, first_name text, last_name text, email text, phone text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT h.id, g.first_name, g.last_name, g.email, g.phone
  FROM public.household_players hp
  JOIN public.households h ON h.id = hp.household_id
  JOIN public.guardian_households gh
    ON gh.household_id = hp.household_id
   AND gh.is_primary = true
  JOIN public.guardians g ON g.id = gh.guardian_id
  WHERE hp.player_id = _player_id
    AND public.can_see_player_pii(_player_id)
  ORDER BY gh.created_at ASC
  LIMIT 1
$function$;

CREATE OR REPLACE FUNCTION public.get_current_roster_assignment(_player_id uuid)
 RETURNS TABLE(team_id uuid, team_name text, jersey_number text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT t.id, t.name, tr.jersey_number
  FROM public.team_rosters tr
  JOIN public.seasons s
    ON s.year = tr.season_year::text
   AND s.league_id = tr.league_id
   AND s.is_current = true
  JOIN public.teams t ON t.id = tr.team_id
  WHERE tr.player_id = _player_id
    AND COALESCE(tr.status, 'active') = 'active'
    AND public.can_see_player_pii(_player_id)
  ORDER BY tr.joined_date DESC NULLS LAST
  LIMIT 1
$function$;

CREATE OR REPLACE FUNCTION public.has_document_on_file(_player_id uuid, _doc_type text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT public.can_see_player_pii(_player_id)
    AND EXISTS (
      SELECT 1
      FROM public.player_documents
      WHERE player_id = _player_id
        AND doc_type = _doc_type
        AND storage_path IS NOT NULL
    )
$function$;
