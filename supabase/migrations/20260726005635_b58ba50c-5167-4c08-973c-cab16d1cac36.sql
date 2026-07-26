
-- =========================================================================
-- STEP A: Tenant root
-- =========================================================================
CREATE TABLE public.leagues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  sending_domain text,
  sending_from_name text,
  sending_from_address text,
  reply_to_address text,
  timezone text NOT NULL DEFAULT 'America/Chicago',
  logo_url text,
  primary_color text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.leagues IS
  'Tenant root. Every notification, template, suppression, and preference row carries league_id so this platform can host multiple leagues without schema changes.';

GRANT SELECT ON public.leagues TO anon, authenticated;
GRANT ALL ON public.leagues TO service_role;
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read leagues" ON public.leagues
  FOR SELECT USING (true);
CREATE POLICY "Admins manage leagues" ON public.leagues
  FOR ALL USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Seed CDBL
INSERT INTO public.leagues (
  name, slug, sending_domain, sending_from_name, sending_from_address,
  reply_to_address, timezone
) VALUES (
  'Central District Baseball League',
  'cdbl',
  'mail.cdbaseball.org',
  'Central District Baseball League',
  'noreply@mail.cdbaseball.org',
  'board@cdbaseball.org',
  'America/Chicago'
);

-- Helper: current league id. Single-tenant today; swap for a resolver later.
CREATE OR REPLACE FUNCTION public.current_league_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.leagues WHERE slug = 'cdbl' LIMIT 1
$$;
REVOKE ALL ON FUNCTION public.current_league_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_league_id() TO authenticated, service_role;

-- =========================================================================
-- STEP B: Enums
-- =========================================================================
CREATE TYPE public.notification_channel  AS ENUM ('email','sms','push','call_task');
CREATE TYPE public.notification_priority AS ENUM ('urgent','normal','digest');
CREATE TYPE public.notification_status   AS ENUM ('pending','approved','queued','sending','sent','failed','cancelled');
CREATE TYPE public.delivery_status       AS ENUM ('pending','sent','delivered','opened','bounced','complained','failed','suppressed');
CREATE TYPE public.suppression_reason    AS ENUM ('hard_bounce','complaint','unsubscribe','manual','invalid');

-- =========================================================================
-- Helpers used by RLS policies below
-- =========================================================================
CREATE OR REPLACE FUNCTION public.is_coach_of(_team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_coaches tc
    JOIN public.coaches c ON c.id = tc.coach_id
    WHERE tc.team_id = _team_id
      AND COALESCE(tc.status,'active') = 'active'
      AND c.user_id = auth.uid()
  )
$$;
REVOKE ALL ON FUNCTION public.is_coach_of(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_coach_of(uuid) TO postgres, service_role;

-- =========================================================================
-- STEP C: notification_queue  (THE ONE QUEUE)
-- =========================================================================
CREATE TABLE public.notification_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL REFERENCES public.leagues(id) DEFAULT public.current_league_id(),
  event_key text NOT NULL,
  template_key text,
  priority public.notification_priority NOT NULL DEFAULT 'normal',
  subject text,
  body_markdown text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  audience_description text,
  dedupe_key text,
  status public.notification_status NOT NULL DEFAULT 'pending',
  scheduled_for timestamptz,
  requires_approval boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  sent_at timestamptz,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.notification_queue IS
  'The ONE queue for every outbound notification across every channel. No parallel send paths. Two queues is how one family gets the same notice twice.';
COMMENT ON COLUMN public.notification_queue.dedupe_key IS
  'Idempotency guard. A retried trigger with the same dedupe_key inside a league will conflict and not double-send.';
COMMENT ON COLUMN public.notification_queue.priority IS
  'urgent priority (rainouts, safety) bypasses category_opt_outs and quiet_hours in the send function. Enforce there, not here.';

CREATE UNIQUE INDEX notification_queue_dedupe_idx
  ON public.notification_queue (league_id, dedupe_key)
  WHERE dedupe_key IS NOT NULL;
CREATE INDEX notification_queue_status_idx ON public.notification_queue (status);
CREATE INDEX notification_queue_scheduled_idx ON public.notification_queue (scheduled_for);
CREATE INDEX notification_queue_created_by_idx ON public.notification_queue (created_by);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_queue TO authenticated;
GRANT ALL ON public.notification_queue TO service_role;
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- STEP D: notification_recipients
-- =========================================================================
CREATE TABLE public.notification_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id uuid NOT NULL REFERENCES public.notification_queue(id) ON DELETE CASCADE,
  league_id uuid NOT NULL DEFAULT public.current_league_id() REFERENCES public.leagues(id),
  guardian_id uuid REFERENCES public.guardians(id) ON DELETE SET NULL,
  household_id uuid REFERENCES public.households(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  channel public.notification_channel NOT NULL DEFAULT 'email',
  address text NOT NULL,
  status public.delivery_status NOT NULL DEFAULT 'pending',
  provider_message_id text,
  sent_at timestamptz,
  delivered_at timestamptz,
  opened_at timestamptz,
  bounced_at timestamptz,
  failure_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.notification_recipients IS
  'One row per human per channel per queue item. This is what makes "did Jen actually get the rainout notice" answerable.';

CREATE INDEX notification_recipients_queue_idx    ON public.notification_recipients (queue_id);
CREATE INDEX notification_recipients_provider_idx ON public.notification_recipients (provider_message_id);
CREATE INDEX notification_recipients_address_idx  ON public.notification_recipients (address);
CREATE INDEX notification_recipients_status_idx   ON public.notification_recipients (status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_recipients TO authenticated;
GRANT ALL ON public.notification_recipients TO service_role;
ALTER TABLE public.notification_recipients ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- STEP E: communication_preferences
-- =========================================================================
CREATE TABLE public.communication_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL DEFAULT public.current_league_id() REFERENCES public.leagues(id),
  guardian_id uuid REFERENCES public.guardians(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email_enabled boolean NOT NULL DEFAULT true,
  sms_enabled boolean NOT NULL DEFAULT false,
  push_enabled boolean NOT NULL DEFAULT false,
  category_opt_outs text[] NOT NULL DEFAULT '{}',
  quiet_hours_start time,
  quiet_hours_end time,
  unsubscribe_token uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  updated_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.communication_preferences IS
  'Per-person channel/category preferences. URGENT-priority notifications (rainouts, safety) ignore category_opt_outs and quiet_hours; that bypass is enforced in the send function.';

CREATE UNIQUE INDEX comm_prefs_league_guardian_uidx
  ON public.communication_preferences (league_id, guardian_id)
  WHERE guardian_id IS NOT NULL;
CREATE UNIQUE INDEX comm_prefs_league_user_uidx
  ON public.communication_preferences (league_id, user_id)
  WHERE user_id IS NOT NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.communication_preferences TO authenticated;
GRANT ALL ON public.communication_preferences TO service_role;
ALTER TABLE public.communication_preferences ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_comm_prefs_updated_at
  BEFORE UPDATE ON public.communication_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================================
-- STEP F: email_suppressions
-- =========================================================================
CREATE TABLE public.email_suppressions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL DEFAULT public.current_league_id() REFERENCES public.leagues(id),
  email text NOT NULL,
  reason public.suppression_reason NOT NULL,
  detail text,
  source text,
  created_at timestamptz NOT NULL DEFAULT now(),
  released_at timestamptz,
  released_by uuid REFERENCES auth.users(id)
);
COMMENT ON TABLE public.email_suppressions IS
  'Checked before EVERY email send, no exceptions. A row here with released_at IS NULL means: do not send to this address.';

CREATE UNIQUE INDEX email_suppressions_active_uidx
  ON public.email_suppressions (league_id, lower(email))
  WHERE released_at IS NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_suppressions TO authenticated;
GRANT ALL ON public.email_suppressions TO service_role;
ALTER TABLE public.email_suppressions ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- STEP G: device_tokens
-- =========================================================================
CREATE TABLE public.device_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL DEFAULT public.current_league_id() REFERENCES public.leagues(id),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('ios','android','web')),
  token text NOT NULL UNIQUE,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.device_tokens IS
  'Push tokens for the future iOS/Android app. Stubbed now so push is a data problem later, not a migration.';

GRANT SELECT, INSERT, UPDATE, DELETE ON public.device_tokens TO authenticated;
GRANT ALL ON public.device_tokens TO service_role;
ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- STEP H: Non-destructive extensions on existing tables
-- =========================================================================

-- message_templates
ALTER TABLE public.message_templates
  ADD COLUMN IF NOT EXISTS league_id uuid REFERENCES public.leagues(id) DEFAULT public.current_league_id(),
  ADD COLUMN IF NOT EXISTS key text,
  ADD COLUMN IF NOT EXISTS channel public.notification_channel NOT NULL DEFAULT 'email',
  ADD COLUMN IF NOT EXISTS priority public.notification_priority NOT NULL DEFAULT 'normal';

-- Backfill league_id and key without altering original semantics
UPDATE public.message_templates SET league_id = public.current_league_id() WHERE league_id IS NULL;
UPDATE public.message_templates
   SET key = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '_', 'g'))
 WHERE key IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS message_templates_league_key_uidx
  ON public.message_templates (league_id, key);

-- contact_messages
ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS league_id uuid REFERENCES public.leagues(id) DEFAULT public.current_league_id(),
  ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS responded_at timestamptz;

UPDATE public.contact_messages SET league_id = public.current_league_id() WHERE league_id IS NULL;

-- email_bounces
ALTER TABLE public.email_bounces
  ADD COLUMN IF NOT EXISTS league_id uuid REFERENCES public.leagues(id) DEFAULT public.current_league_id();
-- (0 rows currently; nothing to backfill)

-- messages_sent and notification_configs: intentionally untouched.

-- =========================================================================
-- STEP I: RLS policies
-- =========================================================================

-- --- notification_queue ---
CREATE POLICY "Admins and board manage all notifications"
  ON public.notification_queue FOR ALL
  USING (public.has_admin_access(auth.uid()))
  WITH CHECK (public.has_admin_access(auth.uid()));

-- Coaches: INSERT only, only for their own team (payload.team_id)
CREATE POLICY "Coaches insert notifications for their teams"
  ON public.notification_queue FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'coach')
    AND created_by = auth.uid()
    AND payload ? 'team_id'
    AND public.is_coach_of((payload->>'team_id')::uuid)
  );

CREATE POLICY "Coaches read their own notifications"
  ON public.notification_queue FOR SELECT
  USING (
    public.has_role(auth.uid(), 'coach')
    AND created_by = auth.uid()
  );

-- --- notification_recipients ---
CREATE POLICY "Admins and board manage all recipients"
  ON public.notification_recipients FOR ALL
  USING (public.has_admin_access(auth.uid()))
  WITH CHECK (public.has_admin_access(auth.uid()));

CREATE POLICY "Coaches read recipients for their own notifications"
  ON public.notification_recipients FOR SELECT
  USING (
    public.has_role(auth.uid(), 'coach')
    AND EXISTS (
      SELECT 1 FROM public.notification_queue q
      WHERE q.id = notification_recipients.queue_id
        AND q.created_by = auth.uid()
    )
  );

-- --- message_templates ---
CREATE POLICY "Admins and board manage templates"
  ON public.message_templates FOR ALL
  USING (public.has_admin_access(auth.uid()))
  WITH CHECK (public.has_admin_access(auth.uid()));

-- --- email_suppressions ---
CREATE POLICY "Admins and board manage suppressions"
  ON public.email_suppressions FOR ALL
  USING (public.has_admin_access(auth.uid()))
  WITH CHECK (public.has_admin_access(auth.uid()));

-- --- contact_messages: add board access alongside existing admin policies ---
CREATE POLICY "Admins and board manage contact messages"
  ON public.contact_messages FOR ALL
  USING (public.has_admin_access(auth.uid()))
  WITH CHECK (public.has_admin_access(auth.uid()));

-- --- communication_preferences ---
CREATE POLICY "Admins and board manage all preferences"
  ON public.communication_preferences FOR ALL
  USING (public.has_admin_access(auth.uid()))
  WITH CHECK (public.has_admin_access(auth.uid()));

CREATE POLICY "Guardian reads own preferences"
  ON public.communication_preferences FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.guardians g
      WHERE g.id = communication_preferences.guardian_id
        AND g.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Guardian updates own preferences"
  ON public.communication_preferences FOR UPDATE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.guardians g
      WHERE g.id = communication_preferences.guardian_id
        AND g.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.guardians g
      WHERE g.id = communication_preferences.guardian_id
        AND g.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Guardian inserts own preferences"
  ON public.communication_preferences FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.guardians g
      WHERE g.id = communication_preferences.guardian_id
        AND g.auth_user_id = auth.uid()
    )
  );

-- --- device_tokens: user manages their own ---
CREATE POLICY "Users manage own device tokens"
  ON public.device_tokens FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins and board read all device tokens"
  ON public.device_tokens FOR SELECT
  USING (public.has_admin_access(auth.uid()));

-- --- anonymous unsubscribe by token (no table exposure) ---
CREATE OR REPLACE FUNCTION public.unsubscribe_by_token(_token uuid, _category text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_found boolean := false;
BEGIN
  IF _category IS NULL OR _category = '' THEN
    UPDATE public.communication_preferences
       SET email_enabled = false,
           sms_enabled   = false,
           push_enabled  = false,
           updated_at    = now()
     WHERE unsubscribe_token = _token
    RETURNING true INTO v_found;
  ELSE
    UPDATE public.communication_preferences
       SET category_opt_outs =
             (SELECT ARRAY(SELECT DISTINCT unnest(category_opt_outs || ARRAY[_category]))),
           updated_at = now()
     WHERE unsubscribe_token = _token
    RETURNING true INTO v_found;
  END IF;
  RETURN COALESCE(v_found, false);
END;
$$;
REVOKE ALL ON FUNCTION public.unsubscribe_by_token(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unsubscribe_by_token(uuid, text) TO anon, authenticated;

-- =========================================================================
-- STEP J: contact_messages -> notification_queue trigger
-- =========================================================================
CREATE OR REPLACE FUNCTION public.enqueue_contact_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notification_queue (
    league_id, event_key, priority, subject, body_markdown, payload,
    audience_description, dedupe_key, status, requires_approval
  ) VALUES (
    COALESCE(NEW.league_id, public.current_league_id()),
    'contact.received',
    'normal',
    'New contact form: ' || COALESCE(NEW.subject, '(no subject)'),
    NEW.message,
    jsonb_build_object(
      'contact_id', NEW.id,
      'from_name',  NEW.name,
      'from_email', NEW.email,
      'from_phone', NEW.phone
    ),
    'Board inbox',
    'contact:' || NEW.id::text,
    'pending',
    false
  )
  ON CONFLICT (league_id, dedupe_key) WHERE dedupe_key IS NOT NULL DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_contact_messages_enqueue
  AFTER INSERT ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.enqueue_contact_notification();
