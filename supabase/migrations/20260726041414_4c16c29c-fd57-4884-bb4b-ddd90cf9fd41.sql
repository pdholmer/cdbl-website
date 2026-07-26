DO $$
DECLARE
  r RECORD;
  v_using TEXT;
  v_check TEXT;
  v_cmd TEXT;
  v_target_role TEXT;
  v_sql TEXT;

  -- 16 policies that MUST remain readable by anon (public site)
  keep_anon CONSTANT TEXT[][] := ARRAY[
    ARRAY['divisions','Divisions are publicly readable'],
    ARRAY['external_calendar_events','Public can view external calendar events'],
    ARRAY['faqs','FAQs are publicly readable'],
    ARRAY['games','Public can view games'],
    ARRAY['league_events','Anyone can view league events'],
    ARRAY['leagues','Anyone can read leagues'],
    ARRAY['page_visibility','Anyone can view page visibility'],
    ARRAY['programs','Programs are publicly readable'],
    ARRAY['rules_policies','Rules are publicly readable'],
    ARRAY['seasons','Seasons are viewable by everyone'],
    ARRAY['site_content','Site content is publicly readable'],
    ARRAY['support_options','Support options are publicly readable'],
    ARRAY['team_coaches','Public can view active team coaches'],
    ARRAY['teams','Public can view active teams'],
    ARRAY['venue_fields','Public can view active venue fields'],
    ARRAY['venues','Public can view active venues']
  ];

  -- 5 anon submit sinks: PUBLIC -> TO anon (explicit)
  sinks CONSTANT TEXT[][] := ARRAY[
    ARRAY['contact_messages','Anyone can submit contact messages'],
    ARRAY['platform_feedback','Anyone can insert feedback'],
    ARRAY['registration_submissions','Public can submit registrations'],
    ARRAY['role_requests','Users can create own role requests'],
    ARRAY['volunteer_signups','Anyone can submit volunteer signups']
  ];

  is_keep BOOLEAN;
  is_sink BOOLEAN;
  i INT;
  rewrite_count INT := 0;
  sink_count INT := 0;
BEGIN
  FOR r IN
    SELECT c.relname AS tbl, p.polname AS pol, p.polcmd,
           pg_get_expr(p.polqual, p.polrelid) AS u,
           pg_get_expr(p.polwithcheck, p.polrelid) AS w
    FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND p.polroles = '{0}'::oid[]  -- PUBLIC
    ORDER BY c.relname, p.polname
  LOOP
    is_keep := false;
    is_sink := false;
    FOR i IN 1 .. array_length(keep_anon, 1) LOOP
      IF keep_anon[i][1] = r.tbl AND keep_anon[i][2] = r.pol THEN
        is_keep := true; EXIT;
      END IF;
    END LOOP;
    IF is_keep THEN CONTINUE; END IF;

    FOR i IN 1 .. array_length(sinks, 1) LOOP
      IF sinks[i][1] = r.tbl AND sinks[i][2] = r.pol THEN
        is_sink := true; EXIT;
      END IF;
    END LOOP;

    v_target_role := CASE WHEN is_sink THEN 'anon' ELSE 'authenticated' END;

    v_cmd := CASE r.polcmd
      WHEN 'r' THEN 'SELECT'
      WHEN 'a' THEN 'INSERT'
      WHEN 'w' THEN 'UPDATE'
      WHEN 'd' THEN 'DELETE'
      WHEN '*' THEN 'ALL'
    END;

    -- Drop
    EXECUTE format('DROP POLICY %I ON public.%I', r.pol, r.tbl);

    -- Rebuild verbatim, only TO clause changes
    v_sql := format('CREATE POLICY %I ON public.%I FOR %s TO %I',
                    r.pol, r.tbl, v_cmd, v_target_role);
    IF r.u IS NOT NULL THEN
      v_sql := v_sql || ' USING (' || r.u || ')';
    END IF;
    IF r.w IS NOT NULL THEN
      v_sql := v_sql || ' WITH CHECK (' || r.w || ')';
    END IF;

    EXECUTE v_sql;

    IF is_sink THEN
      sink_count := sink_count + 1;
    ELSE
      rewrite_count := rewrite_count + 1;
    END IF;
  END LOOP;

  RAISE NOTICE 'Rewrote % PUBLIC policies to TO authenticated', rewrite_count;
  RAISE NOTICE 'Rewrote % PUBLIC submit-sink policies to TO anon', sink_count;

  IF rewrite_count <> 130 THEN
    RAISE EXCEPTION 'Expected 130 authenticated rewrites, got %', rewrite_count;
  END IF;
  IF sink_count <> 5 THEN
    RAISE EXCEPTION 'Expected 5 anon-sink rewrites, got %', sink_count;
  END IF;
END $$;

-- Structural REVOKEs on PII / child-record tables
REVOKE ALL ON public.players             FROM anon;
REVOKE ALL ON public.player_medical      FROM anon;
REVOKE ALL ON public.player_guardians    FROM anon;
REVOKE ALL ON public.guardians           FROM anon;
REVOKE ALL ON public.households          FROM anon;
REVOKE ALL ON public.guardian_households FROM anon;
REVOKE ALL ON public.household_players   FROM anon;
REVOKE ALL ON public.league_players      FROM anon;
REVOKE ALL ON public.team_rosters        FROM anon;
