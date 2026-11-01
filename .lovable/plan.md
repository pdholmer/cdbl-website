# 2027 security pass — findings and proposed SQL (nothing applied)

All findings below come from live read-only queries run 1 Nov 2026. Each SQL block is a separate migration and waits for your "approved".

## 1. Audit findings

**RLS:** turned on for all 78 tables in `public`, with 200 policies in total. The 7 views (`v_player_current`, `v_roster_coach`, `v_roster_family`, `v_roster_social_export`, `v_parent_evaluation_scores`, `v_player_evaluation_summary`, `team_roster_counts`) have no RLS of their own. Instead they apply the caller's access to the underlying tables (security invoker). Anon has no grant on any of them.

**Grants:** `authenticated` holds SELECT/INSERT/UPDATE/DELETE on every table and view. That is normal: the policies do the gating. `anon` holds full SELECT/INSERT/UPDATE/DELETE on **52 tables**. Anon has no grant on the main child tables: `players`, `league_players`, `registrations`, `player_medical`, `player_documents`, `player_notes`, `player_aliases`, `guardians`, `households`, `guardian_households`, `household_players`, `team_rosters`, `evaluations`, `evaluation_events`, `coaches`, `situations*`, `team_aliases`, `import_sc_*`, `registration_code_uses`.

**Policies that apply to signed-out visitors (anon or public):**

- Read: `divisions`, `programs`, `seasons`, `leagues`, `faqs`, `games`, `league_events`, `external_calendar_events`, `page_visibility`, `rules_policies`, `site_content`, `support_options`, `teams`, `team_coaches`, `venues`, `venue_fields`
- Insert only: `contact_messages`, `volunteer_signups`, `platform_feedback`, `registration_submissions`, `role_requests`

**Flags, child, guardian and household data:**

- **F1 (high): `registration_submissions` takes anonymous writes.** The table holds child data (`player_id`, `form_data`, waiver signature, birth certificate and residency URLs). No public page writes to it; it is only used by admin player screens. So anyone can insert forged registration and waiver rows today.
- **F2 (medium): anon has full grants on 52 tables.** Today RLS blocks the dangerous cases. But a single bad policy would expose any of them, for example guardian contact in `communication_preferences`, `notification_recipients`, `messages_sent`, `email_*`, and `profiles`. Defence in depth means revoking the grants.
- **F3 (low): `role_requests` has an anon INSERT policy.** It is dead, because `auth.uid()` is null for anon. It should be removed with the grant.
- **F4 (low): `has_role` and `has_admin_access` can be called by anon.** Anyone can ask "is user X an admin?" for any user id. `has_admin_access` must stay callable by anon, because the public `external_calendar_events` policy uses it. Proposal: revoke `has_role` from anon only.
- **F5 (info): `team_coaches` is publicly readable.** It exposes only ids, role and status, with no names. Today the coach pages and the Teams page are hidden. Decision: keep it public or revoke (see section 3).

No table holding child, guardian or household data can be **read** by anon.

## 2. Named roles

The `app_role` enum today has: admin, moderator, user, coach, commissioner, board_member, parent.

- Missing: **registrar, treasurer, background_checks**.
- `has_role(_user_id, _role)` already exists (security definer, pinned search_path). No new function is needed.
- No policy uses an inline subquery on `user_roles`. All role checks already go through `has_role` or `has_admin_access`. Other policies have inline subqueries on `commissioner_assignments` and `draft_teams` (drafts, draft_picks, draft_player_pool, draft_teams, coach_invitations). Those check assignments, not roles, so they are out of scope.

```sql
-- Migration A (enum values must commit before any policy uses them)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'registrar';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'treasurer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'background_checks';
-- F4
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
GRANT  EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
```

Undo: enum values cannot be dropped without rebuilding the type. They are harmless while unused. Undo the grant with `GRANT EXECUTE ... TO anon`.

## 3. Revoke anon

**Stay public, SELECT only.** Every other privilege is revoked from these tables too.

| Table | Why it stays public |
|---|---|
| programs, divisions, seasons, leagues | Program pages, division finder, costs |
| games, league_events, external_calendar_events | Public schedule |
| teams | Team names on the schedule (no rosters, per D5) |
| venues, venue_fields | Facilities and field status |
| faqs, rules_policies, site_content, support_options, page_visibility | Site content and page gating |

**Stay public, INSERT only:** `contact_messages`, `volunteer_signups`, `platform_feedback`. These are the public forms. Per memory they insert without `.select()`.

**Revoke everything from anon (35 tables):** coach_invitations, commissioner_assignments, committee_tasks, communication_preferences, concession_employees, concession_inventory, concession_shifts, device_tokens, draft_picks, draft_player_pool, draft_player_queues, draft_teams, drafts, email_bounces, email_send_log, email_send_state, email_suppressions, email_unsubscribe_tokens, external_calendars, message_templates, messages_sent, notification_configs, notification_queue, notification_recipients, player_data_access_log, practices, profiles, registration_codes, registration_submissions (F1), resources, role_requests (F3), team_coaches (F5), team_important_dates, team_tasks, user_roles.

Notes:
- **Unsubscribe links:** the server functions run with full backend privileges, so `email_unsubscribe_tokens` does not need anon access.
- **`external_calendars`:** the public events policy reads it through `calendar_is_public()`, a function that runs with its owner's rights, so the public schedule does not need anon access to it.
- **`practices` and `team_coaches`:** if the public schedule shows practices, move `practices` to the public list before approving. Same for `team_coaches` if a public page needs it.

```sql
-- Migration B
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['coach_invitations','commissioner_assignments','committee_tasks',
    'communication_preferences','concession_employees','concession_inventory','concession_shifts',
    'device_tokens','draft_picks','draft_player_pool','draft_player_queues','draft_teams','drafts',
    'email_bounces','email_send_log','email_send_state','email_suppressions','email_unsubscribe_tokens',
    'external_calendars','message_templates','messages_sent','notification_configs','notification_queue',
    'notification_recipients','player_data_access_log','practices','profiles','registration_codes',
    'registration_submissions','resources','role_requests','team_coaches','team_important_dates',
    'team_tasks','user_roles']
  LOOP EXECUTE format('REVOKE ALL ON public.%I FROM anon', t); END LOOP;

  FOREACH t IN ARRAY ARRAY['programs','divisions','seasons','leagues','games','league_events',
    'external_calendar_events','teams','venues','venue_fields','faqs','rules_policies',
    'site_content','support_options','page_visibility']
  LOOP EXECUTE format('REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.%I FROM anon', t); END LOOP;

  FOREACH t IN ARRAY ARRAY['contact_messages','volunteer_signups','platform_feedback']
  LOOP EXECUTE format('REVOKE SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.%I FROM anon', t); END LOOP;
END $$;
```

The two policies that allow anon writes (`registration_submissions` "Public can submit registrations" and `role_requests` "Users can create own role requests") would become inert. Removing them changes existing policies, so it is listed for your approval:

```sql
-- Migration B2 (names existing policies)
DROP POLICY "Public can submit registrations" ON public.registration_submissions;
DROP POLICY "Users can create own role requests" ON public.role_requests;
CREATE POLICY "Users can create own role requests" ON public.role_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND status = 'pending');
```

Undo: re-grant per table (`GRANT ALL ON public.<t> TO anon`) and recreate the policies from the text above.

**Verify by execution:**
- `has_table_privilege('anon', ...)` for every table matches the lists above.
- Signed out, the home, schedule, programs and facilities pages load, and the contact and volunteer forms submit.

## 4. Two-step sign-in (authenticator app) for sensitive roles

Covered roles: admin, registrar, treasurer, background_checks.

1. **Turn on authenticator-app sign-in** in the backend auth settings. Confirm the setting first; I have not checked it yet.
2. **Database helpers, the real enforcement:**

```sql
-- Migration C
CREATE OR REPLACE FUNCTION public.requires_mfa(_user_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin','registrar','treasurer','background_checks'))
$$;
CREATE OR REPLACE FUNCTION public.mfa_satisfied() RETURNS boolean
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT NOT public.requires_mfa(auth.uid()) OR coalesce(auth.jwt()->>'aal','aal1') = 'aal2'
$$;
REVOKE EXECUTE ON FUNCTION public.requires_mfa(uuid), public.mfa_satisfied() FROM anon, public;
GRANT  EXECUTE ON FUNCTION public.requires_mfa(uuid), public.mfa_satisfied() TO authenticated;
```

`requires_mfa` only answers about the caller (`_user_id = auth.uid()`), so it is not an oracle about other users.

3. **Restrictive policies, a separate approval.** These add to the existing policies without changing them:

```sql
CREATE POLICY "mfa required" ON public.<table> AS RESTRICTIVE FOR ALL TO authenticated
  USING (public.mfa_satisfied()) WITH CHECK (public.mfa_satisfied());
```

Proposed tables: players, registrations, player_medical, player_documents, player_notes, guardians, households, guardian_households, household_players, user_roles, role_requests, coaches (background checks), registration_codes, and the future payment ledger tables.

Parents and coaches are not affected, because `mfa_satisfied()` is true for them.

4. **App screens (code, build mode):**
   - A "Set up two-step sign-in" page: QR code, 6-digit confirm, and a recovery note.
   - A "Enter your code" step after password sign-in.
   - The admin guard reads the sign-in assurance level. A covered user without an enrolled authenticator goes to setup. One with an authenticator who has not entered a code this session goes to the code step. Admin pages stay blocked until the session is verified.
   - This is mobile-first, with 44px targets.

Risk: you and any other current admin get locked out of admin pages until you enroll. Roll out in this order: screens first, enroll the existing admins, then apply the restrictive policies.

Undo: drop the restrictive policies and the two functions.

## 5. Backups (report only)

- **Daily backups:** one automatic database backup per day, kept for roughly 14 days. The newest backup time is not visible to me; check More → Database → Manage → Backups.
- **Point-in-time recovery:** not available. The closest restore point is the most recent daily snapshot.
- **Not included:** files in storage. That covers player-documents, feedback-screenshots and hero-images. Download those from More → Storage.
- **Restore effect:** a restore rolls back this same database in place, schema and data, and cannot be undone. Anything written after the snapshot is lost.
- **Testing a restore without touching production:**
  1. Export the database from More → Database → Manage → Settings → Export data. This is limited to once every 24 hours and includes sign-in password hashes.
  2. Restore the export into a separate project you own.
  3. Set the sign-in providers and keys again there.
  4. Check that a test sign-in and a few key pages work.
  5. Never use "Restore to this backup" as a test.

## Order of approval

A (roles), then B and B2 (anon revoke), then C (MFA helpers), then the MFA screens, then admin enrollment, then the restrictive MFA policies.
