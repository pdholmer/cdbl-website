# Role-scoped admin access (plan only)

## What I found (read from the live database and code)

- `/admin` routes use `requireBoardMember` (admin or board_member) or `requireAdmin`. `landing.ts` only sends admin and board_member to `/admin`.
- `requires_mfa` covers admin, registrar, treasurer, background_checks. **It does not cover commissioner** (or board_member).
- `has_admin_access` = admin or board_member. Used by the divisions UPDATE and registration-codes SELECT policies.
- Commissioners already have many policies, all keyed to `commissioner_assignments` (program and division scope): drafts, draft_picks, games, teams, team_coaches, team_rosters, players (read and update), registrations (**view and update**), player_documents (view), coaches (view), league_players (view).
- Registrar, treasurer and background_checks have **no policies anywhere**.
- `programs` and `divisions` are already readable by everyone in the league.
- `coaches` holds the clearance fields (`background_check_status/date/expiry`) next to email, phone and `admin_notes`.
- `src/pages/commissioner/*` (9 pages) exists, but only `/admin/commissioner` is routed, and that route requires admin.

## Answer 4 first: what doesn't map to anything yet

1. **Payments, refunds, financial reports (treasurer)**: there are no payment, refund or ledger tables. Stripe is not built. The treasurer would get fee history, registrations (read) and registration codes (read). Payments and refunds stay empty until the ledger module exists.
2. **Volunteer background checks**: only coaches have a clearance status. `volunteer_signups` has none, and `import_sc_volunteers` is staging. The background_checks role gets coaches only.
3. **Documents in storage**: the files behind `player_documents` sit in a storage bucket. The registrar needs a storage read policy too. I'll check the bucket's current policies before writing it.
4. **Commissioner "for their league"**: commissioners are scoped by program and division assignment, not league-wide. I'm keeping that, which is stricter. Several existing commissioner policies (drafts, draft_picks, games, team_coaches, commissioner_assignments) don't check `current_league_id()`. I'm flagging that and not changing it.
5. **Commissioner on divisions**: no commissioner edit path exists. Division edits include the fee, which conflicts with "no payments", so I propose read-only. Tell me if commissioners should edit non-fee fields.
6. **Treasurer "fees"**: editing a fee today means a full divisions UPDATE. I propose a narrow function that changes only `cost`, logged by the existing fee-change trigger, instead of a row-level UPDATE grant.
7. **Two-step for commissioner**: not covered today. It needs a one-line function change (below). Board_member is also outside two-step. Tell me whether to add it.

## Answer 1: new SQL (all additive, league-scoped)

```sql
-- Helper
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles app_role[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = ANY(_roles)) $$;
REVOKE ALL ON FUNCTION public.has_any_role(uuid, app_role[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_any_role(uuid, app_role[]) TO authenticated;

-- Two-step for commissioner
CREATE OR REPLACE FUNCTION public.requires_mfa(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin','registrar','treasurer','background_checks','commissioner')) $$;

-- REGISTRAR: registrations, players, households, documents (read and edit, no delete)
CREATE POLICY "Registrar reads registrations" ON public.registrations FOR SELECT TO authenticated
  USING (league_id = (SELECT current_league_id()) AND (SELECT has_role(auth.uid(),'registrar')));
CREATE POLICY "Registrar inserts registrations" ON public.registrations FOR INSERT TO authenticated
  WITH CHECK (league_id = (SELECT current_league_id()) AND (SELECT has_role(auth.uid(),'registrar')));
CREATE POLICY "Registrar updates registrations" ON public.registrations FOR UPDATE TO authenticated
  USING (league_id = (SELECT current_league_id()) AND (SELECT has_role(auth.uid(),'registrar')))
  WITH CHECK (league_id = (SELECT current_league_id()) AND (SELECT has_role(auth.uid(),'registrar')));
-- Same SELECT/INSERT/UPDATE trio, same expression, on:
--   households, guardians, guardian_households, household_players, player_documents, league_players
-- players has no league_id column, so it is scoped through league_players:
CREATE POLICY "Registrar reads players" ON public.players FOR SELECT TO authenticated
  USING ((SELECT has_role(auth.uid(),'registrar')) AND EXISTS (SELECT 1 FROM public.league_players lp
         WHERE lp.player_id = players.id AND lp.league_id = (SELECT current_league_id())));
CREATE POLICY "Registrar updates players" ON public.players FOR UPDATE TO authenticated
  USING (<same expression>) WITH CHECK (<same expression>);
-- New players: through the existing create_player_in_league() function, after adding registrar to its role check.
-- Storage: SELECT/INSERT on the documents bucket for registrar (written after reading the current bucket policies).
-- Not granted: player_medical, payments, programs/divisions writes.

-- TREASURER: registrations read, fee history, fee edit, codes read. No documents, no players.
CREATE POLICY "Treasurer reads registrations" ON public.registrations FOR SELECT TO authenticated
  USING (league_id = (SELECT current_league_id()) AND (SELECT has_role(auth.uid(),'treasurer')));
CREATE POLICY "Treasurer reads fee changes" ON public.division_fee_changes FOR SELECT TO authenticated
  USING (league_id = (SELECT current_league_id()) AND (SELECT has_role(auth.uid(),'treasurer')));
CREATE POLICY "Treasurer reads registration codes" ON public.registration_codes FOR SELECT TO authenticated
  USING (league_id = (SELECT current_league_id()) AND (SELECT has_role(auth.uid(),'treasurer')));
CREATE OR REPLACE FUNCTION public.set_division_fee(_division_id uuid, _cost numeric)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_any_role(auth.uid(), ARRAY['admin','treasurer']::app_role[]) OR NOT public.mfa_satisfied() THEN
    RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501'; END IF;
  UPDATE public.divisions SET cost = _cost
   WHERE id = _division_id AND league_id = public.current_league_id();
END $$;
REVOKE ALL ON FUNCTION public.set_division_fee(uuid, numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_division_fee(uuid, numeric) TO authenticated;

-- BACKGROUND_CHECKS: coaches only, clearance fields only
CREATE POLICY "Background checks read coaches" ON public.coaches FOR SELECT TO authenticated
  USING (league_id = (SELECT current_league_id()) AND (SELECT has_role(auth.uid(),'background_checks')));
CREATE OR REPLACE FUNCTION public.set_coach_clearance(_coach_id uuid, _status text, _date date, _expiry date)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_any_role(auth.uid(), ARRAY['admin','background_checks']::app_role[]) OR NOT public.mfa_satisfied() THEN
    RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501'; END IF;
  UPDATE public.coaches SET background_check_status = _status,
         background_check_date = _date, background_check_expiry = _expiry
   WHERE id = _coach_id AND league_id = public.current_league_id();
END $$;
REVOKE ALL ON FUNCTION public.set_coach_clearance(uuid, text, date, date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_coach_clearance(uuid, text, date, date) TO authenticated;
-- The existing CHECK constraint still limits status to pending/approved/expired/rejected.

-- COMMISSIONER: the existing policies already cover divisions (read), teams, draft, schedule, coaches.
-- One gap: let commissioners read the list of their own assigned divisions' teams' practices.
CREATE POLICY "Commissioners view practices in their programs" ON public.practices FOR SELECT TO authenticated
  USING (league_id = (SELECT current_league_id()) AND EXISTS (SELECT 1 FROM public.teams t
         WHERE t.id = practices.team_id AND public.is_commissioner_for(auth.uid(), t.program_id, t.division_id)));
```

**Undo:** `DROP POLICY` each new policy by name. `DROP FUNCTION` `has_any_role`, `set_division_fee` and `set_coach_clearance`. Re-run the previous `requires_mfa` body, which lists admin, registrar, treasurer and background_checks.

## Answer 2: existing policies that change (named)

1. **`registrations` "Commissioners update assigned registrations"**: dropped, so commissioners are read-only on registrations as you asked. Undo: recreate it with its current USING and CHECK (both saved in the plan record).
2. No other existing policy changes. Every grant above is a new permissive policy alongside the old ones.
3. Function changes (not policies): `requires_mfa` (adds commissioner), and `create_player_in_league` (adds registrar), if you approve it.

Note: commissioners keep the existing "Commissioners view documents in their scope" policy on `player_documents`. You didn't exclude documents for commissioners. Tell me if you want it removed.

## Answer 3: code files that change

- `src/lib/adminAccess.ts` (new): one map from role to allowed admin sections, plus `canAccess(roles, section)`.
- `src/lib/landing.ts`: `/admin` for admin, board_member, commissioner, registrar, treasurer and background_checks.
- `src/components/ProtectedRoute.tsx`: new `section` prop. Not allowed shows the "No access" page, not a redirect. The two-step check stays first.
- `src/pages/admin/NoAccess.tsx` (new): a plain message and a link back to the admin home.
- `src/App.tsx`: each `/admin/*` route declares its section.
- `src/components/AdminSidebar.tsx`: filters sections by role.
- `src/pages/admin/Dashboard.tsx`: shows only the cards for allowed sections, so limited roles don't hit permission errors.
- `src/pages/admin/Divisions.tsx` / `DivisionEdit.tsx`: read-only for commissioner and registrar; fee field calls `set_division_fee` for the treasurer.
- `src/pages/admin/Coaches.tsx` / `CoachEdit.tsx`: a clearance-only view for background_checks, saved through `set_coach_clearance`.
- Registrations: no admin registrations screen exists. The registrar's section would be Players plus Households/Documents read views. A full registrations screen is a separate request.
- `src/lib/adminAccess.test.ts` (new): one test per role rule, for example treasurer can't open players and background_checks can't open players.
- `AGENTS.md`: one rule saying admin section access is decided only in `adminAccess.ts` and enforced by database policies.

## Section map (proposed)

```text
admin, board_member : everything (unchanged)
commissioner        : Teams, Drafts, Schedule, Coaches, Divisions (read), Commissioner
registrar           : Players, Households, Documents, Programs (read), Divisions (read)
treasurer           : Divisions (fees), Fee history, Registration codes (read), Reports (finance, once built)
background_checks   : Coaches (clearance only)
```

## How I'll verify (after approval)

- In tests that are rolled back, impersonate one user per role and confirm allowed tables return rows. Confirm denied tables return zero rows or a permission error: treasurer on players and player_documents, background_checks on players, commissioner registration update fails.
- Confirm anon still can't call the new functions.
- Check the sidebar and a direct URL per role in the browser at 390, 768 and 1440 widths.
