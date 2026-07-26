DO $$
DECLARE
  v_league uuid := public.current_league_id();
  v_coach_count int;
  v_assign_count int;
  v_cleared_count int;
BEGIN
  -- 1) Insert coaches: 99 distinct people from 2026 rows in the three coaching roles
  WITH src AS (
    SELECT
      lower(trim(first_name)) AS lf,
      lower(trim(last_name))  AS ll,
      MIN(NULLIF(trim(first_name), ''))                   AS first_name,
      MIN(NULLIF(trim(last_name),  ''))                   AS last_name,
      MIN(NULLIF(trim(email),      ''))                   AS email,
      COALESCE(MIN(NULLIF(trim(cell_phone), '')),
               MIN(NULLIF(trim(phone),      '')), '')     AS phone
    FROM public.import_sc_volunteers
    WHERE league_id     = v_league
      AND source_role   IN ('Head Coach','Assistant Coach','Team Manager')
      AND source_program LIKE '2026%'
      AND first_name IS NOT NULL AND last_name IS NOT NULL
      AND trim(first_name) <> '' AND trim(last_name) <> ''
    GROUP BY lower(trim(first_name)), lower(trim(last_name))
  )
  INSERT INTO public.coaches (
    league_id, user_id, first_name, last_name, email, phone,
    background_check_status, background_check_date, background_check_expiry,
    status
  )
  SELECT
    v_league, NULL, first_name, last_name, email, phone,
    NULL, NULL, NULL,
    'active'
  FROM src
  WHERE email IS NOT NULL              -- coaches.email is NOT NULL
  ON CONFLICT (email) DO NOTHING;

  -- 2) Insert team_coaches: 94 assignments resolved via team_aliases
  WITH role_map AS (
    SELECT unnest(ARRAY['Head Coach','Assistant Coach','Team Manager']) AS src_role,
           unnest(ARRAY['head_coach','assistant_coach','team_parent'])  AS dst_role
  ),
  assignments AS (
    SELECT DISTINCT
      c.id                                        AS coach_id,
      ta.team_id                                  AS team_id,
      rm.dst_role                                 AS role
    FROM public.import_sc_volunteers v
    JOIN role_map rm ON rm.src_role = v.source_role
    JOIN public.team_aliases ta
      ON ta.league_id = v.league_id
     AND ta.source    = 'sportsconnect'
     AND lower(ta.external_name) = lower(v.source_team)
     AND ta.team_id IS NOT NULL
    JOIN public.coaches c
      ON c.league_id = v.league_id
     AND lower(c.first_name) = lower(trim(v.first_name))
     AND lower(c.last_name)  = lower(trim(v.last_name))
    WHERE v.league_id      = v_league
      AND v.source_program LIKE '2026%'
      AND v.source_role    IN ('Head Coach','Assistant Coach','Team Manager')
      AND v.source_team    IS NOT NULL
  ),
  head_counts AS (
    SELECT team_id, count(*) AS n_heads
    FROM assignments
    WHERE role = 'head_coach'
    GROUP BY team_id
  )
  INSERT INTO public.team_coaches
    (league_id, team_id, coach_id, role, primary_contact, assigned_date, status)
  SELECT
    v_league,
    a.team_id,
    a.coach_id,
    a.role,
    CASE WHEN a.role = 'head_coach' AND COALESCE(h.n_heads, 0) = 1 THEN true ELSE false END,
    NULL,
    'active'
  FROM assignments a
  LEFT JOIN head_counts h ON h.team_id = a.team_id
  ON CONFLICT (team_id, coach_id, role) DO NOTHING;

  -- 3) Assertions
  SELECT count(*) INTO v_coach_count
    FROM public.coaches WHERE league_id = v_league;
  SELECT count(*) INTO v_assign_count
    FROM public.team_coaches WHERE league_id = v_league;
  SELECT count(*) INTO v_cleared_count
    FROM public.coaches
    WHERE league_id = v_league
      AND background_check_status IS NOT NULL;

  IF v_coach_count <> 99 THEN
    RAISE EXCEPTION 'coaches row count = %, expected 99', v_coach_count;
  END IF;
  IF v_assign_count <> 94 THEN
    RAISE EXCEPTION 'team_coaches row count = %, expected 94', v_assign_count;
  END IF;
  IF v_cleared_count <> 0 THEN
    RAISE EXCEPTION 'coaches with non-null background_check_status = %, expected 0', v_cleared_count;
  END IF;
END $$;