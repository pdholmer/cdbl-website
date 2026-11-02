CREATE TABLE public.assistant_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL REFERENCES public.leagues(id),
  user_id uuid,
  session_key text NOT NULL,
  first_page text,
  started_at timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '180 days'
);
CREATE INDEX ON public.assistant_conversations (league_id, last_message_at DESC);

CREATE TABLE public.assistant_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL REFERENCES public.leagues(id),
  conversation_id uuid NOT NULL REFERENCES public.assistant_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user','assistant')),
  content text NOT NULL CHECK (length(content) <= 4000),
  page_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.assistant_messages (conversation_id, created_at);

CREATE TABLE public.assistant_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL REFERENCES public.leagues(id),
  conversation_id uuid REFERENCES public.assistant_conversations(id) ON DELETE SET NULL,
  kind text NOT NULL CHECK (kind IN ('help','problem','feedback')),
  requester_name text NOT NULL CHECK (length(requester_name) <= 120),
  requester_email text NOT NULL CHECK (length(requester_email) <= 255),
  summary text NOT NULL CHECK (length(summary) <= 300),
  details text CHECK (length(details) <= 4000),
  page_path text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','in_progress','done')),
  admin_notes text,
  owner_emailed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '2 years'
);
CREATE INDEX ON public.assistant_requests (league_id, status, created_at DESC);
CREATE TRIGGER assistant_requests_updated_at BEFORE UPDATE ON public.assistant_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

REVOKE ALL ON public.assistant_conversations, public.assistant_messages, public.assistant_requests FROM anon, authenticated;
GRANT SELECT ON public.assistant_conversations, public.assistant_messages TO authenticated;
GRANT SELECT, UPDATE ON public.assistant_requests TO authenticated;
GRANT ALL ON public.assistant_conversations, public.assistant_messages, public.assistant_requests TO service_role;

ALTER TABLE public.assistant_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and board read conversations" ON public.assistant_conversations FOR SELECT TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND (SELECT public.has_admin_access(auth.uid())));
CREATE POLICY "Admin and board read messages" ON public.assistant_messages FOR SELECT TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND (SELECT public.has_admin_access(auth.uid())));
CREATE POLICY "Admin and board read requests" ON public.assistant_requests FOR SELECT TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND (SELECT public.has_admin_access(auth.uid())));
CREATE POLICY "Admin and board update requests" ON public.assistant_requests FOR UPDATE TO authenticated
  USING (league_id = (SELECT public.current_league_id()) AND (SELECT public.has_admin_access(auth.uid())))
  WITH CHECK (league_id = (SELECT public.current_league_id()) AND (SELECT public.has_admin_access(auth.uid())));

CREATE OR REPLACE FUNCTION public.purge_expired_assistant_data()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  DELETE FROM public.assistant_requests WHERE expires_at < now();
  DELETE FROM public.assistant_conversations c WHERE c.expires_at < now()
    AND NOT EXISTS (SELECT 1 FROM public.assistant_requests r WHERE r.conversation_id = c.id);
$$;
REVOKE ALL ON FUNCTION public.purge_expired_assistant_data() FROM PUBLIC, anon, authenticated;