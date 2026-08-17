# Roster read access for coaches and guardians

Investigation is complete. Nothing has been changed. The SQL below is a proposal only.

Three findings change what can honestly be built, and two of them need your decision before I write anything. They are in "Two things I cannot decide for you" — please read that section before approving.

## 1. Current policies

**`team_rosters`** — two policies, both `FOR ALL`, both `TO authenticated`, both tenant-scoped to `current_league_id()`:

- `Admins have full access to team rosters` — `has_role(auth.uid(),'admin')`
- `Commissioners can manage team rosters in their programs` — program/division match via `commissioner_assignments`

There is **no SELECT policy for coaches and none for guardians**, and no `anon` policy. Confirmed exactly as you described.

**`players`** — one SELECT policy, `Players readable by authorized roles`: row must be in the current league, and then admin OR `is_commissioner_for(...)` OR (`is_coach_of_player(id)` AND `is_cleared_coach(auth.uid())`) OR `is_guardian_of_player(id)`. Plus admin insert/update/delete and a commissioner update.

**`player_medical`** — three policies: admin `FOR ALL`; guardians SELECT via `is_guardian_of_player(player_id)`; guardians with `can_edit_medical = true` may UPDATE. **No coach policy of any kind.** Coaches cannot read medical today and nothing proposed here changes that.

## 2. `can_see_player_pii`

`STABLE SECURITY DEFINER`, `search_path` pinned to `public`, returns true when any of:

- caller is `admin`
- caller is commissioner for that player's program/division
- `is_coach_of_player(_player_id)` **AND** `is_cleared_coach(auth.uid())`
- `is_guardian_of_player(_player_id)`

`is_cleared_coach` requires `background_check_status = 'approved'` and an unexpired (or null) expiry. Since all 99 imported coaches have `background_check_status = NULL`, this function currently returns false for every coach in the league. That is the correct state, but it means the coach path below cannot be exercised with real data until clearances are transcribed.

## 3. Existing roster views

Five views exist. Two are relevant:

- **`v_roster_coach` already exists** (`security_invoker=on`), built earlier this session. It has two problems against your current spec:
  - **It joins `player_medical` and exposes `allergies` and `notes`.** That is exactly the join constraint 5 forbids. RLS stops a coach reading those values today, but the join is there and would leak the moment a coach policy were added to `player_medical`. It has to go.
  - Its row filter is `can_see_player_pii(player_id)` for the whole row, so an assigned-but-uncleared coach sees **no rows at all** rather than names without contact details.
  - It also has no season filter and no `status = 'active'` filter.
- `v_roster_social_export` — admin-only, D5-approved, unaffected.

There is no `v_roster_family`.

## Two things I cannot decide for you

Both come from the same mechanic: a `security_invoker` view applies each base table's RLS to the caller, so a column the caller cannot read arrives as NULL rather than as data.

**(a) An uncleared coach will see NULL names, not just NULL contact details.** Your spec says names and jersey numbers may show for any active assigned staff. But the `players` SELECT policy requires `is_cleared_coach`, so first/last name are unreadable to an uncleared coach. I can only change that by widening the `players` policy, and RLS is row-level — widening it to uncleared coaches exposes the whole player row (date of birth, address, `parent_email`, `medical_notes`), which is unacceptable.

My recommendation, per deny-by-default: **accept it.** An uncleared coach gets their roster rows with jersey numbers and positions, and names blank, which is an accurate rendering of "you are not cleared yet." Say if you want the opposite and I will bring you a different mechanism, not a widened policy.

**(b) A guardian cannot see other families' children at all, so `v_roster_family` cannot list the team.** Same reason: the `players` policy scopes a guardian to their own child. Teammates' first names are unreadable, so a team listing would come back as their own child plus a column of NULLs.

Options: **(i)** ship `v_roster_family` as own-child-plus-coaching-staff only — one row, honest, no other family's data; or **(ii)** treat "parents may see teammates' first names and numbers" as a board question in the D5 family, since it is publishing minors' names to an audience wider than the household. I recommend **(i)** now and **(ii)** as a separate decision. The SQL below is written for **(i)**.

**A third, smaller one:** guardians have no read policy on `coaches`, so coach name/phone/email also comes back NULL under invoker RLS. To give a parent their coach's contact details, `coaches` needs a narrow guardian SELECT policy — and RLS cannot restrict that to three columns, so such a guardian could also query `coaches` directly and see `background_check_status`, `certifications` and `admin_notes` for their child's coaches. That is included below as an optional, clearly-marked block; say yes or no to it.

## The SQL

Nothing here is applied. Two policies, one view rewrite, one new view.

```sql
-- 1. Coaches read their own team's active roster rows.
--    is_coach_of() is SECURITY DEFINER over team_coaches/coaches, so no recursion
--    back into team_rosters. authenticated only; never anon (board decision D5).
CREATE POLICY "Coaches view their own team roster"
  ON public.team_rosters
  FOR SELECT
  TO authenticated
  USING (
    league_id = (SELECT public.current_league_id())
    AND COALESCE(status, 'active') = 'active'
    AND public.is_coach_of(team_id)
  );

-- 2. Guardians read their own child's roster row.
CREATE POLICY "Guardians view their own child roster row"
  ON public.team_rosters
  FOR SELECT
  TO authenticated
  USING (
    league_id = (SELECT public.current_league_id())
    AND public.is_guardian_of_player(player_id)
  );

-- 3. v_roster_coach — rebuilt. No player_medical join at any depth.
DROP VIEW IF EXISTS public.v_roster_coach;

CREATE VIEW public.v_roster_coach
WITH (security_invoker = on) AS
SELECT
  tr.team_id,
  tr.player_id,
  tr.jersey_number,
  tr.position_primary,
  tr.position_secondary,
  p.first_name,
  p.last_name,
  p.preferred_name,
  -- Contact details only for a caller who passes the PII gate: admin,
  -- commissioner, CLEARED assigned coach, or the child's own guardian.
  CASE WHEN public.can_see_player_pii(tr.player_id)
       THEN pg.guardian_name END  AS primary_guardian_name,
  CASE WHEN public.can_see_player_pii(tr.player_id)
       THEN pg.email END          AS primary_guardian_email,
  CASE WHEN public.can_see_player_pii(tr.player_id)
       THEN pg.phone END          AS primary_guardian_phone
FROM public.team_rosters tr
LEFT JOIN public.players p ON p.id = tr.player_id
LEFT JOIN LATERAL public.get_primary_guardian_for_player(tr.player_id)
  AS pg(household_id, first_name, last_name, email, phone) ON true
LEFT JOIN LATERAL (
  SELECT NULLIF(TRIM(COALESCE(pg.first_name,'') || ' ' || COALESCE(pg.last_name,'')),'')
           AS guardian_name,
         pg.email, pg.phone
) pgn ON true
WHERE COALESCE(tr.status,'active') = 'active';

COMMENT ON VIEW public.v_roster_coach IS
  'Coach-facing roster. Deliberately does NOT join player_medical: coaches have '
  'no policy on that table and must never receive allergies or medical notes '
  'through a roster surface. No date of birth. Contact columns are gated on '
  'can_see_player_pii, which requires a coach to be background-check cleared.';

GRANT SELECT ON public.v_roster_coach TO authenticated;
REVOKE ALL ON public.v_roster_coach FROM anon;

-- 4. v_roster_family — what a guardian sees for their own child.
--    Own child only (option (i) above). No DOB, nothing medical,
--    no other family's contact information of any kind.
CREATE VIEW public.v_roster_family
WITH (security_invoker = on) AS
SELECT
  tr.team_id,
  t.name              AS team_name,
  tr.player_id,
  p.first_name,
  p.preferred_name,
  tr.jersey_number,
  NULLIF(TRIM(COALESCE(c.first_name,'') || ' ' || COALESCE(c.last_name,'')),'')
                      AS coach_name,
  tc.role             AS coach_role,
  c.email             AS coach_email,
  c.phone             AS coach_phone
FROM public.team_rosters tr
LEFT JOIN public.teams t        ON t.id = tr.team_id
LEFT JOIN public.players p      ON p.id = tr.player_id
LEFT JOIN public.team_coaches tc
       ON tc.team_id = tr.team_id
      AND COALESCE(tc.status,'active') = 'active'
LEFT JOIN public.coaches c      ON c.id = tc.coach_id
WHERE COALESCE(tr.status,'active') = 'active'
  AND public.is_guardian_of_player(tr.player_id);

COMMENT ON VIEW public.v_roster_family IS
  'Guardian-facing. Scoped to the caller''s own child by is_guardian_of_player. '
  'Carries no date of birth, no medical data, and no other family''s contact '
  'details. Teammate names are deliberately absent — see D5.';

GRANT SELECT ON public.v_roster_family TO authenticated;
REVOKE ALL ON public.v_roster_family FROM anon;
```

Optional, only if you say yes to the third question above:

```sql
-- Lets a guardian read the coach rows for their own child's team.
-- Caveat: RLS is row-level, so this also exposes background_check_status,
-- certifications and admin_notes for those coaches to that guardian.
CREATE POLICY "Guardians view coaches of their child's team"
  ON public.coaches
  FOR SELECT
  TO authenticated
  USING (
    league_id = (SELECT public.current_league_id())
    AND EXISTS (
      SELECT 1
      FROM public.team_coaches tc
      JOIN public.team_rosters tr ON tr.team_id = tc.team_id
      WHERE tc.coach_id = coaches.id
        AND COALESCE(tc.status,'active') = 'active'
        AND COALESCE(tr.status,'active') = 'active'
        AND public.is_guardian_of_player(tr.player_id)
    )
  );
```

Without that block, `coach_email` and `coach_phone` in `v_roster_family` will always be NULL for guardians.

## Verification I would run after approval

Execution, not catalog reading, in rolled-back transactions:

- Both views report `security_invoker=on`; both raise permission denied as `anon`.
- `pg_get_viewdef` read back confirms every join is LEFT and that `player_medical` appears nowhere in either view.
- As a guardian with a real `auth_user_id`: `v_roster_family` returns their child and no one else's; a direct `SELECT` on `player_medical` for another child returns zero rows.
- As an assigned but **uncleared** coach: roster rows return with jersey numbers, and `primary_guardian_email` is NULL.
- Same coach set to `background_check_status = 'approved'` inside the transaction: contact columns populate, `player_medical` still returns zero rows. Then roll back.
- As `anon`: zero rows / permission denied on `team_rosters` and both views.

## Not in scope

`team_rosters.season_year` is still an `integer` compared against `seasons.year::text` inside `is_coach_of_player`. Both new policies avoid that path, so this proposal does not depend on it, but the fragility stands and the `season_id uuid` migration remains the fix.
