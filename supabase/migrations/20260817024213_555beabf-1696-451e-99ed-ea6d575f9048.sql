
-- Helper: who may edit training content (admins + coaches)
CREATE OR REPLACE FUNCTION public.is_training_editor(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT _user_id IS NOT NULL AND (
    public.has_role(_user_id, 'admin')
    OR public.has_role(_user_id, 'board_member')
    OR public.has_role(_user_id, 'coach')
    OR EXISTS (
      SELECT 1 FROM public.coaches c
      JOIN public.team_coaches tc ON tc.coach_id = c.id
      WHERE c.user_id = _user_id
        AND COALESCE(tc.status, 'active') = 'active'
    )
  )
$$;

-- Helper: who may view published training content
CREATE OR REPLACE FUNCTION public.is_training_viewer(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT _user_id IS NOT NULL AND (
    public.is_training_editor(_user_id)
    OR public.has_role(_user_id, 'parent')
    OR EXISTS (SELECT 1 FROM public.guardians g WHERE g.auth_user_id = _user_id)
  )
$$;

REVOKE ALL ON FUNCTION public.is_training_editor(uuid) FROM anon, public;
REVOKE ALL ON FUNCTION public.is_training_viewer(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.is_training_editor(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_training_viewer(uuid) TO authenticated;

-- 1. situations
CREATE TABLE public.situations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  base_state text NOT NULL CHECK (base_state IN ('none','1st','2nd','3rd','1st_2nd','1st_3rd','2nd_3rd','loaded')),
  outs smallint CHECK (outs BETWEEN 0 AND 2),
  batted_ball text CHECK (batted_ball IN ('ground_ball','fly_ball','line_drive','single','double','bunt','popup')),
  field_zone text,
  category text NOT NULL DEFAULT 'general',
  age_band text NOT NULL DEFAULT 'all' CHECK (age_band IN ('8U','10U','12U','all')),
  difficulty text NOT NULL DEFAULT 'easy' CHECK (difficulty IN ('easy','medium','hard')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  sort_order int NOT NULL DEFAULT 0,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.situations TO authenticated;
GRANT ALL ON public.situations TO service_role;
ALTER TABLE public.situations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "situations_select_published" ON public.situations FOR SELECT TO authenticated
USING (
  (status = 'published' AND public.is_training_viewer(auth.uid()))
  OR public.is_training_editor(auth.uid())
);
CREATE POLICY "situations_manage" ON public.situations FOR ALL TO authenticated
USING (public.is_training_editor(auth.uid()))
WITH CHECK (public.is_training_editor(auth.uid()));

CREATE TRIGGER update_situations_updated_at BEFORE UPDATE ON public.situations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. situation_steps
-- Canonical coordinate space: SVG viewBox "0 0 400 500".
-- home (200,478), P (200,310), 1B (330,300), 2B (255,245), SS (145,245),
-- 3B (70,300), LF (95,140), CF (200,80), RF (305,140)
CREATE TABLE public.situation_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  situation_id uuid NOT NULL REFERENCES public.situations(id) ON DELETE CASCADE,
  step_number int NOT NULL,
  label text,
  positions jsonb NOT NULL DEFAULT '{}'::jsonb,
  runners jsonb NOT NULL DEFAULT '[]'::jsonb,
  ball jsonb,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (situation_id, step_number)
);
CREATE INDEX situation_steps_situation_idx ON public.situation_steps (situation_id, step_number);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.situation_steps TO authenticated;
GRANT ALL ON public.situation_steps TO service_role;
ALTER TABLE public.situation_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "situation_steps_select" ON public.situation_steps FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.situations s WHERE s.id = situation_id));
CREATE POLICY "situation_steps_manage" ON public.situation_steps FOR ALL TO authenticated
USING (public.is_training_editor(auth.uid()))
WITH CHECK (public.is_training_editor(auth.uid()));

CREATE TRIGGER update_situation_steps_updated_at BEFORE UPDATE ON public.situation_steps
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. situation_quiz_questions
CREATE TABLE public.situation_quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  situation_id uuid NOT NULL REFERENCES public.situations(id) ON DELETE CASCADE,
  position_key text CHECK (position_key IN ('P','C','1B','2B','SS','3B','LF','CF','RF')),
  prompt text NOT NULL,
  options jsonb NOT NULL,
  correct_option text NOT NULL,
  explanation text,
  why_wrong jsonb,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX situation_quiz_questions_situation_idx ON public.situation_quiz_questions (situation_id, sort_order);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.situation_quiz_questions TO authenticated;
GRANT ALL ON public.situation_quiz_questions TO service_role;
ALTER TABLE public.situation_quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "situation_quiz_questions_select" ON public.situation_quiz_questions FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.situations s WHERE s.id = situation_id));
CREATE POLICY "situation_quiz_questions_manage" ON public.situation_quiz_questions FOR ALL TO authenticated
USING (public.is_training_editor(auth.uid()))
WITH CHECK (public.is_training_editor(auth.uid()));

CREATE TRIGGER update_situation_quiz_questions_updated_at BEFORE UPDATE ON public.situation_quiz_questions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. situation_quiz_attempts
CREATE TABLE public.situation_quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  question_id uuid NOT NULL REFERENCES public.situation_quiz_questions(id) ON DELETE CASCADE,
  selected_option text NOT NULL,
  is_correct boolean NOT NULL,
  answered_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX situation_quiz_attempts_user_idx ON public.situation_quiz_attempts (user_id, answered_at DESC);

GRANT SELECT, INSERT ON public.situation_quiz_attempts TO authenticated;
GRANT ALL ON public.situation_quiz_attempts TO service_role;
ALTER TABLE public.situation_quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "attempts_insert_own" ON public.situation_quiz_attempts FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());
CREATE POLICY "attempts_select_own" ON public.situation_quiz_attempts FOR SELECT TO authenticated
USING (user_id = auth.uid());
CREATE POLICY "attempts_select_staff" ON public.situation_quiz_attempts FOR SELECT TO authenticated
USING (public.is_training_editor(auth.uid()));

-- 5. situation_articles
CREATE TABLE public.situation_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE,
  body text,
  category text,
  age_band text NOT NULL DEFAULT 'all' CHECK (age_band IN ('8U','10U','12U','all')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.situation_articles TO authenticated;
GRANT ALL ON public.situation_articles TO service_role;
ALTER TABLE public.situation_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "situation_articles_select" ON public.situation_articles FOR SELECT TO authenticated
USING (
  (status = 'published' AND public.is_training_viewer(auth.uid()))
  OR public.is_training_editor(auth.uid())
);
CREATE POLICY "situation_articles_manage" ON public.situation_articles FOR ALL TO authenticated
USING (public.is_training_editor(auth.uid()))
WITH CHECK (public.is_training_editor(auth.uid()));

CREATE TRIGGER update_situation_articles_updated_at BEFORE UPDATE ON public.situation_articles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

REVOKE ALL ON public.situations FROM anon;
REVOKE ALL ON public.situation_steps FROM anon;
REVOKE ALL ON public.situation_quiz_questions FROM anon;
REVOKE ALL ON public.situation_quiz_attempts FROM anon;
REVOKE ALL ON public.situation_articles FROM anon;
