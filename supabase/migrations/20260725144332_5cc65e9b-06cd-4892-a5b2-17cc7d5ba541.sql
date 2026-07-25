
-- 1) external_calendars
DROP POLICY IF EXISTS "Public can view active external calendars" ON public.external_calendars;

ALTER TABLE public.external_calendar_events
  ADD COLUMN IF NOT EXISTS calendar_name text,
  ADD COLUMN IF NOT EXISTS calendar_color text;

UPDATE public.external_calendar_events e
  SET calendar_name = c.name, calendar_color = c.color
  FROM public.external_calendars c
  WHERE c.id = e.calendar_id;

CREATE OR REPLACE FUNCTION public.sync_external_event_calendar_meta()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN
  UPDATE public.external_calendar_events
     SET calendar_name = NEW.name, calendar_color = NEW.color
   WHERE calendar_id = NEW.id;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_sync_external_event_calendar_meta ON public.external_calendars;
CREATE TRIGGER trg_sync_external_event_calendar_meta
AFTER UPDATE OF name, color ON public.external_calendars
FOR EACH ROW EXECUTE FUNCTION public.sync_external_event_calendar_meta();

-- 2) hero-images storage
DROP POLICY IF EXISTS "Allow uploads to hero-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow updates to hero-images" ON storage.objects;
DROP POLICY IF EXISTS "Hero images are publicly accessible" ON storage.objects;

CREATE POLICY "Admins can upload hero images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'hero-images' AND public.has_admin_access(auth.uid()));
CREATE POLICY "Admins can update hero images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'hero-images' AND public.has_admin_access(auth.uid()))
  WITH CHECK (bucket_id = 'hero-images' AND public.has_admin_access(auth.uid()));
CREATE POLICY "Admins can delete hero images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'hero-images' AND public.has_admin_access(auth.uid()));

-- 3) player_data_access_log
DROP POLICY IF EXISTS "System can insert audit logs" ON public.player_data_access_log;
CREATE POLICY "Authenticated users can insert their own access logs"
  ON public.player_data_access_log FOR INSERT TO authenticated
  WITH CHECK (accessed_by = auth.uid());

-- 4) players PII
DROP POLICY IF EXISTS "Parents can view their own children" ON public.players;
CREATE POLICY "Parents can view their own children"
  ON public.players FOR SELECT TO authenticated
  USING (
    parent_email = public.get_user_email()
    AND (auth.jwt() ->> 'is_anonymous')::boolean IS DISTINCT FROM true
    AND EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
        AND u.email_confirmed_at IS NOT NULL
    )
  );

-- 5) Realtime
ALTER PUBLICATION supabase_realtime DROP TABLE public.platform_feedback;

DO $$ BEGIN
  EXECUTE 'ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY';
EXCEPTION WHEN others THEN NULL; END $$;

DROP POLICY IF EXISTS "Authenticated users can read realtime messages" ON realtime.messages;
CREATE POLICY "Authenticated users can read realtime messages"
  ON realtime.messages FOR SELECT TO authenticated
  USING (true);

-- 6) Move pg_net out of public (drop + recreate in extensions schema)
CREATE SCHEMA IF NOT EXISTS extensions;
DROP EXTENSION IF EXISTS pg_net;
CREATE EXTENSION pg_net WITH SCHEMA extensions;

-- 7) Revoke EXECUTE on SECURITY DEFINER helpers
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_admin_access(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_email() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_commissioner_for(uuid, uuid, uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_household_member(uuid, uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_household_owner(uuid, uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.assign_default_role() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_team_roster_count() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_schedule_conflict(uuid, date, time, time, uuid, uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_current_pick_team(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_player_access(uuid, text, jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.approve_role_request(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.reject_role_request(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.assign_first_user_admin(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.redeem_registration_code(uuid, uuid, numeric, numeric, numeric) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_invitation_by_token(uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_external_event_calendar_meta() FROM anon, authenticated;
