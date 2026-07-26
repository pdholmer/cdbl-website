
-- Total uuid cast: never raises, denies instead
CREATE OR REPLACE FUNCTION public.safe_uuid(_t text)
RETURNS uuid
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $$
BEGIN
  RETURN _t::uuid;
EXCEPTION WHEN others THEN
  RETURN NULL;
END
$$;

-- ============================================================
-- player_documents
-- ============================================================
CREATE TABLE public.player_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL DEFAULT public.current_league_id() REFERENCES public.leagues(id),
  player_id uuid NOT NULL,
  season_id uuid NULL,
  doc_type text NOT NULL CHECK (doc_type IN ('birth_certificate','proof_of_residency','medical','photo_release')),
  storage_path text,
  uploaded_by uuid DEFAULT auth.uid(),
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  verified_by uuid,
  verified_at timestamptz,
  expires_at date,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT player_documents_league_player_fk
    FOREIGN KEY (league_id, player_id)
    REFERENCES public.league_players (league_id, player_id)
    ON DELETE RESTRICT,
  CONSTRAINT player_documents_league_season_fk
    FOREIGN KEY (league_id, season_id)
    REFERENCES public.seasons (league_id, id)
);

CREATE INDEX idx_player_documents_league ON public.player_documents(league_id);
CREATE INDEX idx_player_documents_lookup ON public.player_documents(league_id, player_id, doc_type);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.player_documents TO authenticated;
GRANT ALL ON public.player_documents TO service_role;
REVOKE ALL ON public.player_documents FROM anon;

ALTER TABLE public.player_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage player documents"
  ON public.player_documents FOR ALL TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND (SELECT public.has_role(auth.uid(),'admin')))
  WITH CHECK (league_id = (SELECT public.current_league_id()) AND (SELECT public.has_role(auth.uid(),'admin')));

-- Commissioners: SELECT only, scoped through registrations.
-- Note: a document uploaded before a registration exists is invisible to
-- commissioners. Admins remain the escape hatch. This is intentional.
CREATE POLICY "Commissioners view documents in their scope"
  ON public.player_documents FOR SELECT TO authenticated
  USING (
    league_id = (SELECT public.current_league_id())
    AND EXISTS (
      SELECT 1 FROM public.registrations r
      WHERE r.league_id = player_documents.league_id
        AND r.player_id = player_documents.player_id
        AND public.is_commissioner_for(auth.uid(), r.program_id, r.division_id)
    )
  );

CREATE POLICY "Guardians view their player documents"
  ON public.player_documents FOR SELECT TO authenticated
  USING (
    league_id = (SELECT public.current_league_id())
    AND (SELECT public.is_guardian_of_player(player_id))
  );

-- Guardians cannot self-assert verification; uploaded_by is forced to the caller;
-- storage_path must live inside the child's own folder.
CREATE POLICY "Guardians upload documents for their players"
  ON public.player_documents FOR INSERT TO authenticated
  WITH CHECK (
    league_id = (SELECT public.current_league_id())
    AND (SELECT public.is_guardian_of_player(player_id))
    AND verified_by IS NULL
    AND verified_at IS NULL
    AND uploaded_by = auth.uid()
    AND storage_path LIKE (league_id::text || '/' || player_id::text || '/%')
  );
-- Deliberately no guardian UPDATE or DELETE.

-- ============================================================
-- player_aliases
-- ============================================================
CREATE TABLE public.player_aliases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL DEFAULT public.current_league_id() REFERENCES public.leagues(id),
  player_id uuid NULL,
  source text NOT NULL,
  external_id text NOT NULL,
  external_name text,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT player_aliases_league_player_fk
    FOREIGN KEY (league_id, player_id)
    REFERENCES public.league_players (league_id, player_id)
  -- MATCH SIMPLE (default) is intentional: a NULL player_id skips the FK,
  -- which is how we represent an unmatched external participant awaiting
  -- reconciliation. Do NOT change to MATCH FULL — it would reject exactly
  -- the rows this table is designed to hold.
);

CREATE UNIQUE INDEX player_aliases_source_external_uk
  ON public.player_aliases(league_id, source, external_id);
CREATE INDEX idx_player_aliases_league ON public.player_aliases(league_id);
CREATE INDEX idx_player_aliases_player
  ON public.player_aliases(league_id, player_id)
  WHERE player_id IS NOT NULL;

COMMENT ON CONSTRAINT player_aliases_league_player_fk ON public.player_aliases IS
  'MATCH SIMPLE intentional: player_id NULL = unmatched external participant awaiting reconciliation.';

GRANT SELECT, INSERT, UPDATE, DELETE ON public.player_aliases TO authenticated;
GRANT ALL ON public.player_aliases TO service_role;
REVOKE ALL ON public.player_aliases FROM anon;

ALTER TABLE public.player_aliases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage player aliases"
  ON public.player_aliases FOR ALL TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND (SELECT public.has_role(auth.uid(),'admin')))
  WITH CHECK (league_id = (SELECT public.current_league_id()) AND (SELECT public.has_role(auth.uid(),'admin')));
-- No guardian policy. Import plumbing only.

-- ============================================================
-- storage.objects policies for player-documents
-- Path convention: {league_id}/{player_id}/{doc_type}/{filename}
-- Uses safe_uuid to deny on malformed paths instead of erroring.
-- ============================================================
CREATE POLICY "Admins manage player-documents objects"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'player-documents' AND public.has_role(auth.uid(),'admin'))
  WITH CHECK (bucket_id = 'player-documents' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "Guardians read their player-documents objects"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'player-documents'
    AND public.safe_uuid((storage.foldername(name))[1]) = (SELECT public.current_league_id())
    AND public.is_guardian_of_player(public.safe_uuid((storage.foldername(name))[2]))
  );

CREATE POLICY "Guardians upload player-documents objects"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'player-documents'
    AND public.safe_uuid((storage.foldername(name))[1]) = (SELECT public.current_league_id())
    AND public.is_guardian_of_player(public.safe_uuid((storage.foldername(name))[2]))
  );
-- No guardian UPDATE or DELETE on storage.objects for this bucket.
