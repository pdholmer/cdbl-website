
-- 1. Parity column: the legacy table stored a per-guardian relationship word; the spine had nowhere to put it.
ALTER TABLE public.guardians ADD COLUMN IF NOT EXISTS relationship text;

-- 2. Make the legacy link explicit rather than inferred by email match.
UPDATE public.guardians g
SET legacy_player_guardian_id = pg.id,
    relationship = COALESCE(g.relationship, pg.relationship)
FROM public.player_guardians pg
WHERE g.legacy_player_guardian_id IS NULL
  AND lower(g.email) = lower(pg.email);

-- 3. Freeze the superseded tables read-only (admins keep read access; no writes from the app).
REVOKE INSERT, UPDATE, DELETE ON public.player_guardians FROM authenticated, anon;
REVOKE INSERT, UPDATE, DELETE ON public.suppressed_emails FROM authenticated, anon;
REVOKE ALL ON public.player_guardians FROM anon;
REVOKE ALL ON public.suppressed_emails FROM anon;

COMMENT ON TABLE public.player_guardians IS 'SUPERSEDED 2026-08-17 by guardians + guardian_households + household_players. Frozen read-only; scheduled for DROP in a follow-up migration.';
COMMENT ON TABLE public.suppressed_emails IS 'SUPERSEDED 2026-08-17 by email_suppressions. Empty and unreferenced; frozen read-only, scheduled for DROP in a follow-up migration.';
