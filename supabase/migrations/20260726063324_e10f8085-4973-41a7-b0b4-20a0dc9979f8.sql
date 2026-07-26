
CREATE TABLE public.team_aliases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL DEFAULT public.current_league_id() REFERENCES public.leagues(id),
  team_id uuid NULL,
  source text NOT NULL,
  external_id text NULL,
  external_name text NOT NULL,
  source_program text,
  source_division text,
  match_method text CHECK (match_method IN ('external_id','reviewed_name','manual')),
  matched_by uuid,
  matched_at timestamptz,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT team_aliases_league_team_fkey
    FOREIGN KEY (league_id, team_id)
    REFERENCES public.teams (league_id, id)
    MATCH SIMPLE
    ON DELETE SET NULL
);

COMMENT ON CONSTRAINT team_aliases_league_team_fkey ON public.team_aliases IS
  'MATCH SIMPLE (default): a NULL team_id is intentional and means a known external team we have not matched to an internal team yet. Same pattern as player_aliases.';

CREATE INDEX team_aliases_league_idx ON public.team_aliases(league_id);
CREATE INDEX team_aliases_team_idx ON public.team_aliases(team_id) WHERE team_id IS NOT NULL;

CREATE UNIQUE INDEX team_aliases_external_id_key
  ON public.team_aliases (league_id, source, external_id)
  WHERE external_id IS NOT NULL;

CREATE UNIQUE INDEX team_aliases_external_name_key
  ON public.team_aliases (league_id, source, lower(external_name));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_aliases TO authenticated;
GRANT ALL ON public.team_aliases TO service_role;
REVOKE ALL ON public.team_aliases FROM anon;

ALTER TABLE public.team_aliases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage team aliases"
  ON public.team_aliases
  FOR ALL
  TO authenticated
  USING (
    league_id = (SELECT public.current_league_id())
    AND (SELECT public.has_role(auth.uid(), 'admin'::app_role))
  )
  WITH CHECK (
    league_id = (SELECT public.current_league_id())
    AND (SELECT public.has_role(auth.uid(), 'admin'::app_role))
  );

CREATE TRIGGER update_team_aliases_updated_at
  BEFORE UPDATE ON public.team_aliases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
