# Feedback and help through the site assistant (plan only, nothing applied)

Process note: last turn, approving the plan switched me into build mode and I applied the database changes, including removing the commissioner registration-update rule. Under the project rule, approving a plan does not count as Paul's "approved" for database changes. From now on, SQL runs only after a separate message from Paul that says "approved" and names the SQL.

## What exists today (read just now)

- The floating feedback button (`FeedbackFAB`) and its slide-out form (`FeedbackSlider`) are added to every page in `App.tsx`.
- `platform_feedback` has 29 rows. It has **no league_id**. Its policies:
  - Anyone can insert feedback (insert)
  - Users can view their own feedback (select)
  - Admins can view all feedback (select)
  - Admins can update all feedback (update)
  - Admins can delete all feedback (delete)
- `/admin/feedback` reads that table today.
- The site assistant (`ChatAssistant`) calls the backend function `ai-assistant`:
  - It uses the Gemini 2.5 Flash model.
  - It is open to signed-out visitors.
  - It saves nothing today and has no way to take actions.
- Email: `notify.cdbaseball.org` is verified, and the app email setup (send helper and template list) is already in place.

## What changes for people

1. The floating feedback icon is gone from every page.
2. In the assistant, saying "I need help", "something's broken" or "here's an idea" starts a short intake:
   - It asks for name, email, what they need, and which page. It fills in the page automatically.
   - It shows a summary card with **Send request** and **Edit** buttons.
   - Nothing is sent until the person taps Send. That button press is what submits, not the assistant.
3. Paul gets an email for each submitted request. It includes the summary and a link to the request in the admin panel.
4. A new admin page, **Requests**, has:
   - a list of requests with status (new, in progress, done);
   - filters by status, type (help, problem, feedback) and date;
   - each request opens with its full conversation and a status changer.

## Retention (proposed)

- Conversations and their messages: deleted after **180 days**. That covers a full season plus the off-season.
- Submitted requests: kept **2 years**, then deleted along with their conversation.
- A daily cleanup job does this, at 03:17 UTC.

Children's details: the assistant is told not to ask for a child's name, age or other details. We store only what the person typed. No extra fields hold child data.

## Exact SQL (for Paul's approval; not run)

```sql
-- 1. Tables
CREATE TABLE public.assistant_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL REFERENCES public.leagues(id),
  user_id uuid,                      -- null for signed-out visitors
  session_key text NOT NULL,         -- random id held by the browser
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

-- 2. Grants: no anon at all; writes only by the backend function (service role)
REVOKE ALL ON public.assistant_conversations, public.assistant_messages, public.assistant_requests FROM anon, authenticated;
GRANT SELECT ON public.assistant_conversations, public.assistant_messages TO authenticated;
GRANT SELECT, UPDATE ON public.assistant_requests TO authenticated;
GRANT ALL ON public.assistant_conversations, public.assistant_messages, public.assistant_requests TO service_role;

-- 3. RLS: admin and board_member only, this league
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

-- 4. Retention cleanup (runs daily)
CREATE OR REPLACE FUNCTION public.purge_expired_assistant_data()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  DELETE FROM public.assistant_requests WHERE expires_at < now();
  DELETE FROM public.assistant_conversations c WHERE c.expires_at < now()
    AND NOT EXISTS (SELECT 1 FROM public.assistant_requests r WHERE r.conversation_id = c.id);
$$;
REVOKE ALL ON FUNCTION public.purge_expired_assistant_data() FROM PUBLIC, anon, authenticated;
SELECT cron.schedule('purge-assistant-data', '17 3 * * *', $$SELECT public.purge_expired_assistant_data()$$);
```

A conversation linked to a request is kept as long as the request (2 years), so the admin link keeps working.

**Undo:**
```sql
SELECT cron.unschedule('purge-assistant-data');
DROP FUNCTION public.purge_expired_assistant_data();
DROP TABLE public.assistant_requests, public.assistant_messages, public.assistant_conversations;
```
Undoing deletes any logged conversations and requests. Code undo is restoring the changed files and redeploying `ai-assistant`.

## platform_feedback: what happens

- **Nothing changes in the database.** The table, its 29 rows and all five policies stay exactly as they are. No policy is changed.
- The floating form stops writing new rows because the button is removed.
- `/admin/feedback` stays as a read-only archive. The sidebar labels it "Feedback (archive)".
- Later, separately, and only with Paul's approval: move the 29 rows into `assistant_requests`, then mark the old table deprecated. I am not proposing that now.
- Flag: the "Anyone can insert feedback" policy stays open to signed-out writes even with no form using it. Closing it is a named policy change Paul would need to approve. I recommend it, as a separate item.

## Assistant backend changes: yes

`ai-assistant` (same model, Gemini 2.5 Flash, through the built-in AI service) changes in four ways:
1. **Logging.** Each turn saves the user message and the reply to the conversation tables. The browser sends a random session id. Signed-in users also get their user id.
2. **Intake tool.** The model gets one tool, `propose_request`, that returns a draft (kind, name, email, summary, details, page). The function stores the draft for that conversation and returns it to the browser as a summary card. The model cannot submit anything itself.
3. **Prompt rules.** Ask only for name, email, need and page. Never ask for a child's name, age or other details. Keep it to one or two questions per turn.
4. **Abuse limits.** A hidden honeypot field, at most 20 messages per conversation, at most 3 requests per conversation, and field length limits.

New backend function `submit-assistant-request` (signed-out allowed, validates its own input):
- Runs when the person taps **Send request**. It takes the session id and draft id, never a free-form recipient.
- It re-checks the email format, inserts the request, then sends the owner alert.

## Email to Paul: can it send now?

**Yes.** The domain is verified and app email sending is already set up. The plan adds one template, "New help request". The new function sends it to the fixed address pdholmer@gmail.com, one email per request, with a no-duplicate key based on the request id.

Two things to know:
- Every app email gets a standard unsubscribe link at the bottom that cannot be removed. If Paul clicks it, these alerts stop until he turns them back on.
- The project rule says "notifications are rows in notification_queue, batched one digest per family". This alert goes to the league owner, not a family, so I treat it as outside that rule. If Paul wants it in the queue instead, say so, and it becomes a queue row plus the existing digest.

## Code files that change

- `src/App.tsx`: remove `FeedbackFAB` and `FeedbackSlider`; add the `/admin/requests` and `/admin/requests/:id` routes.
- `src/contexts/FeedbackContext.tsx`: unused after this. Left in place for now, not deleted.
- `src/components/ChatAssistant.tsx`: session id, page path on each message, the summary card with Send and Edit, the honeypot, a success message and an error message with retry.
- `src/pages/admin/Requests.tsx` (new): list with status, type and date filters. Works one-handed on phone, two columns on desktop.
- `src/pages/admin/RequestDetail.tsx` (new): request, status changer, notes, conversation transcript.
- `src/components/AdminSidebar.tsx`: add "Requests"; rename the old page "Feedback (archive)".
- `src/lib/adminAccess.ts`: `/admin/requests` is open to admin and board_member only (no limited roles).
- `src/lib/adminAccess.test.ts`: add "treasurer cannot open requests" and "board member can open requests".
- `supabase/functions/ai-assistant/index.ts`: logging, intake tool, prompt rules, limits.
- `supabase/functions/submit-assistant-request/index.ts` and its `deno.json` (new).
- `supabase/functions/_shared/transactional-email-templates/new-help-request.tsx` (new) and `registry.ts` (add it).
- `supabase/config.toml`: one entry for the new function.
- `AGENTS.md`: one rule saying assistant logs are written only by backend functions and read only by admin and board.

## What can't work yet, or needs a decision

- The email cannot be tested end to end in preview. Requests are saved, but the app email sender only works for the live site, so the first real alert arrives after publishing.
- Signed-out visitors can't see their past requests or replies. Replies happen by email from Paul. No status updates go to the requester; that would be a separate request.
- Screenshots from the old feedback form are not part of the assistant flow.
- Old feedback (29 rows) does not show on the new Requests page until a separately approved move.
- Board members gain read access to logged conversations, which can include names and emails people typed. That is per your request; it is noted so the board knows.

## Order after Paul's "approved"

1. Run the SQL, then confirm: signed-out visitors get permission denied on all three tables, and a non-admin signed-in user sees 0 rows.
2. Deploy the backend functions and the template.
3. Remove the floating button and add the assistant intake card.
4. Build the admin Requests pages.
5. Test a full request in preview (assistant, summary, Send, row saved, admin list) at 390, 768 and 1440 widths.
6. List what changed and how to undo it.
