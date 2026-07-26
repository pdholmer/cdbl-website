
CREATE OR REPLACE FUNCTION public.is_evaluator_role(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin','board_member','commissioner','coach')
  )
$$;
REVOKE ALL ON FUNCTION public.is_evaluator_role(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_evaluator_role(uuid) TO authenticated;

CREATE TABLE public.evaluation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL DEFAULT public.current_league_id() REFERENCES public.leagues(id),
  season_id uuid NOT NULL,
  division_id uuid NULL,
  name text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('tryout','preseason','midseason','end_of_season')),
  event_date date,
  scale_max integer NOT NULL DEFAULT 5 CHECK (scale_max BETWEEN 2 AND 10),
  is_open boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT evaluation_events_league_id_uk UNIQUE (league_id, id),
  CONSTRAINT evaluation_events_league_season_fk
    FOREIGN KEY (league_id, season_id) REFERENCES public.seasons (league_id, id),
  CONSTRAINT evaluation_events_league_division_fk
    FOREIGN KEY (league_id, division_id) REFERENCES public.divisions (league_id, id)
);
CREATE INDEX idx_evaluation_events_league ON public.evaluation_events(league_id);
CREATE INDEX idx_evaluation_events_lookup ON public.evaluation_events(league_id, season_id, division_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.evaluation_events TO authenticated;
GRANT ALL ON public.evaluation_events TO service_role;
REVOKE ALL ON public.evaluation_events FROM anon;
ALTER TABLE public.evaluation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage evaluation events" ON public.evaluation_events FOR ALL TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND (SELECT public.has_role(auth.uid(),'admin')))
  WITH CHECK (league_id = (SELECT public.current_league_id()) AND (SELECT public.has_role(auth.uid(),'admin')));

CREATE POLICY "Commissioners view events in their scope" ON public.evaluation_events FOR SELECT TO authenticated
  USING (
    league_id = (SELECT public.current_league_id())
    AND (division_id IS NULL OR EXISTS (
      SELECT 1 FROM public.commissioner_assignments ca
      WHERE ca.user_id = auth.uid()
        AND (ca.division_id IS NULL OR ca.division_id = evaluation_events.division_id)
    ))
  );

CREATE POLICY "Authenticated read open events" ON public.evaluation_events FOR SELECT TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND is_open = true);

CREATE TRIGGER trg_evaluation_events_updated_at BEFORE UPDATE ON public.evaluation_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL DEFAULT public.current_league_id() REFERENCES public.leagues(id),
  player_id uuid NOT NULL,
  evaluation_event_id uuid NOT NULL,
  season_id uuid,
  evaluator_id uuid NOT NULL DEFAULT auth.uid(),
  bib_number text,
  hitting integer, fielding integer, throwing integer, running integer, catching integer, overall integer,
  evaluator_notes text,
  parent_summary text,
  is_final boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT evaluations_league_player_fk
    FOREIGN KEY (league_id, player_id) REFERENCES public.league_players (league_id, player_id) ON DELETE RESTRICT,
  CONSTRAINT evaluations_league_event_fk
    FOREIGN KEY (league_id, evaluation_event_id) REFERENCES public.evaluation_events (league_id, id),
  CONSTRAINT evaluations_league_season_fk
    FOREIGN KEY (league_id, season_id) REFERENCES public.seasons (league_id, id),
  CONSTRAINT evaluations_one_per_evaluator UNIQUE (league_id, player_id, evaluation_event_id, evaluator_id)
);
COMMENT ON COLUMN public.evaluations.evaluator_id IS
  'auth.users id of the evaluator. No FK: auth schema is Supabase-managed, and an evaluation must survive account deletion.';
COMMENT ON COLUMN public.evaluations.evaluator_notes IS
  'Candid coach notes. NEVER exposed to guardians. No guardian RLS policy exists on this table by design.';
COMMENT ON COLUMN public.evaluations.parent_summary IS
  'Family-safe summary. Exposed via v_parent_evaluation_scores only when is_final = true.';

CREATE INDEX idx_evaluations_league ON public.evaluations(league_id);
CREATE INDEX idx_evaluations_player ON public.evaluations(league_id, player_id);
CREATE INDEX idx_evaluations_event ON public.evaluations(league_id, evaluation_event_id);
CREATE INDEX idx_evaluations_evaluator ON public.evaluations(league_id, evaluator_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.evaluations TO authenticated;
GRANT ALL ON public.evaluations TO service_role;
REVOKE ALL ON public.evaluations FROM anon;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage evaluations" ON public.evaluations FOR ALL TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND (SELECT public.has_role(auth.uid(),'admin')))
  WITH CHECK (league_id = (SELECT public.current_league_id()) AND (SELECT public.has_role(auth.uid(),'admin')));

CREATE POLICY "Commissioners view evaluations in their scope" ON public.evaluations FOR SELECT TO authenticated
  USING (
    league_id = (SELECT public.current_league_id())
    AND EXISTS (
      SELECT 1 FROM public.evaluation_events e
      WHERE e.id = evaluations.evaluation_event_id AND e.league_id = evaluations.league_id
        AND (e.division_id IS NULL OR EXISTS (
          SELECT 1 FROM public.commissioner_assignments ca
          WHERE ca.user_id = auth.uid()
            AND (ca.division_id IS NULL OR ca.division_id = e.division_id)
        ))
    )
  );

CREATE POLICY "Commissioners update evaluations in their scope" ON public.evaluations FOR UPDATE TO authenticated
  USING (
    league_id = (SELECT public.current_league_id())
    AND EXISTS (
      SELECT 1 FROM public.evaluation_events e
      WHERE e.id = evaluations.evaluation_event_id AND e.league_id = evaluations.league_id
        AND (e.division_id IS NULL OR EXISTS (
          SELECT 1 FROM public.commissioner_assignments ca
          WHERE ca.user_id = auth.uid()
            AND (ca.division_id IS NULL OR ca.division_id = e.division_id)
        ))
    )
  );

CREATE POLICY "Evaluators view their own evaluations" ON public.evaluations FOR SELECT TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND evaluator_id = auth.uid());

-- INSERT gated on evaluator role. Parent/user/moderator cannot insert.
-- GAP: no per-event evaluator assignment table yet.
CREATE POLICY "Evaluators insert their own evaluations" ON public.evaluations FOR INSERT TO authenticated
  WITH CHECK (
    league_id = (SELECT public.current_league_id())
    AND evaluator_id = auth.uid()
    AND (SELECT public.is_evaluator_role(auth.uid()))
  );

CREATE POLICY "Evaluators update their own non-final evaluations" ON public.evaluations FOR UPDATE TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND evaluator_id = auth.uid() AND is_final = false)
  WITH CHECK (league_id = (SELECT public.current_league_id()) AND evaluator_id = auth.uid());

CREATE TRIGGER trg_evaluations_updated_at BEFORE UPDATE ON public.evaluations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.validate_evaluation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_is_open boolean; v_scale_max integer; v_event_league uuid;
BEGIN
  SELECT is_open, scale_max, league_id INTO v_is_open, v_scale_max, v_event_league
  FROM public.evaluation_events WHERE id = NEW.evaluation_event_id;
  IF v_is_open IS NULL THEN RAISE EXCEPTION 'Evaluation event % not found', NEW.evaluation_event_id; END IF;
  IF v_event_league <> NEW.league_id THEN RAISE EXCEPTION 'Evaluation league_id does not match event league_id'; END IF;
  IF v_is_open = false THEN RAISE EXCEPTION 'Evaluation event % is closed; writes rejected', NEW.evaluation_event_id USING ERRCODE='check_violation'; END IF;
  IF NEW.hitting  IS NOT NULL AND (NEW.hitting  < 1 OR NEW.hitting  > v_scale_max) THEN RAISE EXCEPTION 'hitting % out of range 1..%',  NEW.hitting,  v_scale_max USING ERRCODE='check_violation'; END IF;
  IF NEW.fielding IS NOT NULL AND (NEW.fielding < 1 OR NEW.fielding > v_scale_max) THEN RAISE EXCEPTION 'fielding % out of range 1..%', NEW.fielding, v_scale_max USING ERRCODE='check_violation'; END IF;
  IF NEW.throwing IS NOT NULL AND (NEW.throwing < 1 OR NEW.throwing > v_scale_max) THEN RAISE EXCEPTION 'throwing % out of range 1..%', NEW.throwing, v_scale_max USING ERRCODE='check_violation'; END IF;
  IF NEW.running  IS NOT NULL AND (NEW.running  < 1 OR NEW.running  > v_scale_max) THEN RAISE EXCEPTION 'running % out of range 1..%',  NEW.running,  v_scale_max USING ERRCODE='check_violation'; END IF;
  IF NEW.catching IS NOT NULL AND (NEW.catching < 1 OR NEW.catching > v_scale_max) THEN RAISE EXCEPTION 'catching % out of range 1..%', NEW.catching, v_scale_max USING ERRCODE='check_violation'; END IF;
  IF NEW.overall  IS NOT NULL AND (NEW.overall  < 1 OR NEW.overall  > v_scale_max) THEN RAISE EXCEPTION 'overall % out of range 1..%',  NEW.overall,  v_scale_max USING ERRCODE='check_violation'; END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_evaluations_validate BEFORE INSERT OR UPDATE ON public.evaluations
  FOR EACH ROW EXECUTE FUNCTION public.validate_evaluation();

CREATE TABLE public.player_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL DEFAULT public.current_league_id() REFERENCES public.leagues(id),
  player_id uuid NOT NULL,
  author_id uuid NOT NULL DEFAULT auth.uid(),
  season_id uuid NULL,
  visibility text NOT NULL DEFAULT 'coach' CHECK (visibility IN ('board','coach','parent')),
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT player_notes_league_player_fk
    FOREIGN KEY (league_id, player_id) REFERENCES public.league_players (league_id, player_id) ON DELETE RESTRICT,
  CONSTRAINT player_notes_league_season_fk
    FOREIGN KEY (league_id, season_id) REFERENCES public.seasons (league_id, id)
);
CREATE INDEX idx_player_notes_league ON public.player_notes(league_id);
CREATE INDEX idx_player_notes_player ON public.player_notes(league_id, player_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.player_notes TO authenticated;
GRANT ALL ON public.player_notes TO service_role;
REVOKE ALL ON public.player_notes FROM anon;
ALTER TABLE public.player_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage player notes" ON public.player_notes FOR ALL TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND (SELECT public.has_role(auth.uid(),'admin')))
  WITH CHECK (league_id = (SELECT public.current_league_id()) AND (SELECT public.has_role(auth.uid(),'admin')));

CREATE POLICY "Admins and board read all notes" ON public.player_notes FOR SELECT TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND (SELECT public.has_admin_access(auth.uid())));

CREATE POLICY "Guardians read parent-visibility notes for their players" ON public.player_notes FOR SELECT TO authenticated
  USING (
    league_id = (SELECT public.current_league_id())
    AND visibility = 'parent'
    AND (SELECT public.is_guardian_of_player(player_id))
  );

CREATE POLICY "Evaluator roles insert notes" ON public.player_notes FOR INSERT TO authenticated
  WITH CHECK (
    league_id = (SELECT public.current_league_id())
    AND author_id = auth.uid()
    AND (SELECT public.is_evaluator_role(auth.uid()))
  );

CREATE POLICY "Authors read their own notes" ON public.player_notes FOR SELECT TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND author_id = auth.uid());

CREATE POLICY "Authors update their own notes" ON public.player_notes FOR UPDATE TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND author_id = auth.uid())
  WITH CHECK (league_id = (SELECT public.current_league_id()) AND author_id = auth.uid());

CREATE POLICY "Authors delete their own notes" ON public.player_notes FOR DELETE TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND author_id = auth.uid());

CREATE TRIGGER trg_player_notes_updated_at BEFORE UPDATE ON public.player_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE VIEW public.v_parent_evaluation_scores WITH (security_invoker = off) AS
SELECT e.player_id, e.league_id, e.evaluation_event_id, e.season_id,
       e.hitting, e.fielding, e.throwing, e.running, e.catching, e.overall,
       e.parent_summary, e.is_final
FROM public.evaluations e
WHERE e.is_final = true
  AND e.league_id = public.current_league_id()
  AND public.is_guardian_of_player(e.player_id);
REVOKE ALL ON public.v_parent_evaluation_scores FROM PUBLIC;
GRANT SELECT ON public.v_parent_evaluation_scores TO authenticated;
COMMENT ON VIEW public.v_parent_evaluation_scores IS
  'Guardian-only, final-only. security_invoker=off intentional: bypasses evaluations RLS. Never expose evaluator_notes or evaluator_id here.';

CREATE VIEW public.v_player_evaluation_summary WITH (security_invoker = off) AS
WITH per_event AS (
  SELECT e.league_id, e.player_id, e.evaluation_event_id, ev.division_id,
         COUNT(DISTINCT e.evaluator_id) AS evaluator_count,
         COUNT(*) FILTER (WHERE e.overall IS NOT NULL) AS scored_overall_count,
         AVG(e.hitting)::numeric AS mean_hitting,
         AVG(e.fielding)::numeric AS mean_fielding,
         AVG(e.throwing)::numeric AS mean_throwing,
         AVG(e.running)::numeric AS mean_running,
         AVG(e.catching)::numeric AS mean_catching,
         AVG(e.overall)::numeric AS mean_overall
  FROM public.evaluations e
  JOIN public.evaluation_events ev ON ev.id = e.evaluation_event_id AND ev.league_id = e.league_id
  GROUP BY e.league_id, e.player_id, e.evaluation_event_id, ev.division_id
),
event_division_stats AS (
  SELECT league_id, evaluation_event_id, division_id,
         AVG(mean_overall) AS pop_mean,
         STDDEV_POP(mean_overall) AS pop_stddev
  FROM per_event
  GROUP BY league_id, evaluation_event_id, division_id
)
SELECT p.league_id, p.player_id, p.evaluation_event_id, p.division_id,
       p.evaluator_count, p.scored_overall_count,
       p.mean_hitting, p.mean_fielding, p.mean_throwing, p.mean_running, p.mean_catching, p.mean_overall,
       (p.mean_overall - s.pop_mean) / NULLIF(s.pop_stddev, 0) AS z_overall
FROM per_event p
JOIN event_division_stats s USING (league_id, evaluation_event_id, division_id)
WHERE p.league_id = public.current_league_id()
  AND (
    public.has_admin_access(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.commissioner_assignments ca
      WHERE ca.user_id = auth.uid()
        AND (ca.division_id IS NULL OR ca.division_id = p.division_id OR p.division_id IS NULL)
    )
  );
REVOKE ALL ON public.v_player_evaluation_summary FROM PUBLIC;
GRANT SELECT ON public.v_player_evaluation_summary TO authenticated;
COMMENT ON VIEW public.v_player_evaluation_summary IS
  'Scouting aggregate. security_invoker=off: stats computed over full population, visibility applied in outer WHERE. z_overall NULL when population stddev is 0 or undefined. Always display evaluator_count alongside means.';
