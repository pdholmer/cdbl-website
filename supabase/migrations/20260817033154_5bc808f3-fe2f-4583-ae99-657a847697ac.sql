-- =========================================================
-- PART A: backfill guardians.auth_user_id by exact email match
-- =========================================================
DO $$
DECLARE r RECORD; v_matched int := 0;
BEGIN
  FOR r IN
    SELECT g.id AS guardian_id, g.first_name, g.last_name, g.email, u.id AS auth_user_id
    FROM public.guardians g
    JOIN auth.users u ON lower(u.email) = lower(g.email)
    WHERE g.auth_user_id IS NULL
  LOOP
    UPDATE public.guardians SET auth_user_id = r.auth_user_id WHERE id = r.guardian_id;
    v_matched := v_matched + 1;
    RAISE NOTICE 'MATCHED guardian % % <%> -> auth.users %', r.first_name, r.last_name, r.email, r.auth_user_id;
  END LOOP;
  RAISE NOTICE 'guardians backfilled: %', v_matched;
END $$;

-- =========================================================
-- PART B: re-verify then DROP superseded tables
-- =========================================================
DO $$
DECLARE v_pg int; v_se int; v_unmigrated int; v_deps int;
BEGIN
  SELECT count(*) INTO v_pg FROM public.player_guardians;
  SELECT count(*) INTO v_se FROM public.suppressed_emails;

  IF v_se <> 0 THEN
    RAISE EXCEPTION 'ABORT: suppressed_emails is not empty (% rows)', v_se;
  END IF;

  -- every player_guardians row must already exist in the spine
  SELECT count(*) INTO v_unmigrated
  FROM public.player_guardians pg
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.guardians g
    JOIN public.guardian_households gh ON gh.guardian_id = g.id
    JOIN public.household_players hp ON hp.household_id = gh.household_id
    WHERE hp.player_id = pg.player_id
      AND lower(g.email) = lower(pg.email)
  );
  IF v_unmigrated > 0 THEN
    RAISE EXCEPTION 'ABORT: % player_guardians rows not represented in the spine', v_unmigrated;
  END IF;

  -- no foreign keys point at either table
  SELECT count(*) INTO v_deps
  FROM pg_constraint
  WHERE confrelid IN ('public.player_guardians'::regclass, 'public.suppressed_emails'::regclass);
  IF v_deps > 0 THEN
    RAISE EXCEPTION 'ABORT: % foreign keys still reference the superseded tables', v_deps;
  END IF;

  RAISE NOTICE 'pre-drop checks passed: player_guardians=% rows (all migrated), suppressed_emails=% rows', v_pg, v_se;
END $$;

DROP TABLE public.player_guardians;
DROP TABLE public.suppressed_emails;