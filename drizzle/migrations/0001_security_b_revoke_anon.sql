DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['coach_invitations','commissioner_assignments','committee_tasks',
    'communication_preferences','concession_employees','concession_inventory','concession_shifts',
    'device_tokens','draft_picks','draft_player_pool','draft_player_queues','draft_teams','drafts',
    'email_bounces','email_send_log','email_send_state','email_suppressions','email_unsubscribe_tokens',
    'external_calendars','message_templates','messages_sent','notification_configs','notification_queue',
    'notification_recipients','player_data_access_log','profiles','registration_codes',
    'registration_submissions','resources','role_requests','team_important_dates',
    'team_tasks','user_roles']
  LOOP EXECUTE format('REVOKE ALL ON public.%I FROM anon', t); END LOOP;

  FOREACH t IN ARRAY ARRAY['programs','divisions','seasons','leagues','games','league_events',
    'external_calendar_events','teams','venues','venue_fields','faqs','rules_policies',
    'site_content','support_options','page_visibility','practices','team_coaches']
  LOOP EXECUTE format('REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.%I FROM anon', t); END LOOP;

  FOREACH t IN ARRAY ARRAY['contact_messages','volunteer_signups','platform_feedback']
  LOOP EXECUTE format('REVOKE SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.%I FROM anon', t); END LOOP;
END $$;