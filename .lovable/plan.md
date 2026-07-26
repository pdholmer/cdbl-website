
# Policy hardening pass — PUBLIC → explicit role scoping

## Goal
Make the catalog match intent. Every policy currently applying to `PUBLIC` gets rewritten to `TO authenticated`, `TO anon`, or left alone (only if its expression genuinely satisfies for anon and that is desired). No expression changes. One transaction. If any statement fails, everything rolls back.

## Method — how the sets were derived

The `STAY_ANON_READ` set is not typed from memory. It is computed:

- **Base rule:** a `PUBLIC` policy whose USING/WITH CHECK contains none of `auth.uid`, `auth.role`, `has_role`, `has_admin_access`, `is_guardian_of_player`, `is_guardian_of_household`, `is_coach_of`, `is_commissioner_for` is, by construction, anon-satisfiable.
- **Refinement:** every `PUBLIC` policy whose expression contains ` OR ` was hand-audited to catch anon-satisfiable branches that the grep excludes. One false negative found and added: `external_calendar_events.Public can view external calendar events` — the expression is `... AND ((c.is_active = true) OR has_admin_access(auth.uid()))`, so anon satisfies the first branch.
- All other `OR` occurrences in PUBLIC policies are inside subqueries already gated by an outer `ca.user_id = auth.uid()` AND, or between two `auth.uid()`-dependent branches (both NULL for anon). None are anon-satisfiable.

Working assumption added: **do not hand-list anon-readable tables. Derive from expressions. A PUBLIC policy is anon-satisfiable iff its USING/WITH CHECK evaluates non-false with `auth.uid() = NULL`.**

## The three lists

### 1. STAY_ANON_READ — 16 policies, no change

Left with `TO PUBLIC` because the public site requires anon reads:

| Table | Policy | Cmd |
|---|---|---|
| divisions | Divisions are publicly readable | SELECT |
| external_calendar_events | Public can view external calendar events | SELECT |
| faqs | FAQs are publicly readable | SELECT |
| games | Public can view games | SELECT |
| league_events | Anyone can view league events | SELECT |
| leagues | Anyone can read leagues | SELECT |
| page_visibility | Anyone can view page visibility | SELECT |
| programs | Programs are publicly readable | SELECT |
| rules_policies | Rules are publicly readable | SELECT |
| seasons | Seasons are viewable by everyone | SELECT |
| site_content | Site content is publicly readable | SELECT |
| support_options | Support options are publicly readable | SELECT |
| team_coaches | Public can view active team coaches | SELECT |
| teams | Public can view active teams | SELECT |
| venue_fields | Public can view active venue fields | SELECT |
| venues | Public can view active venues | SELECT |

`teams` and `team_coaches` are included — the earlier chat missed them and you were right to catch it.

### 2. ANON_SUBMIT_SINK — 5 policies, PUBLIC → `TO anon`

Explicit anon writes. Moving to `TO anon` makes intent legible in the catalog; expressions unchanged.

| Table | Policy | Cmd | Current WITH CHECK |
|---|---|---|---|
| contact_messages | Anyone can submit contact messages | INSERT | `true` |
| platform_feedback | Anyone can insert feedback | INSERT | `true` |
| registration_submissions | Public can submit registrations | INSERT | `true` |
| role_requests | Users can create own role requests | INSERT | `((auth.uid() = user_id) AND (status = 'pending'::text))` |
| volunteer_signups | Anyone can submit volunteer signups | INSERT | `true` |

`role_requests` is included per your instruction even though its check already denies anon — explicitness is the point.

### 3. Rewrite to `TO authenticated` — 130 policies

Every `PUBLIC` policy not in the two lists above. Full verbatim listing (table, policy, cmd, USING, WITH CHECK) is in the attached TSV — 130 rows across 54 tables.

<presentation-artifact path="rewrite_public_to_authenticated.tsv" mime_type="text/tab-separated-values"></presentation-artifact>

Tables touched: coach_invitations, coaches, commissioner_assignments, committee_tasks, communication_preferences, concession_employees, concession_inventory, concession_shifts, contact_messages (non-sink policies), device_tokens, draft_picks, draft_player_pool, draft_player_queues, draft_teams, drafts, email_send_log, email_send_state, email_suppressions, email_unsubscribe_tokens, external_calendar_events (non-STAY policies), external_calendars, games (non-STAY policies), guardian_households, guardians, household_players, households, league_players, leagues (non-STAY policies), message_templates, messages_sent, notification_configs, notification_queue, notification_recipients, platform_feedback (non-sink policies), player_data_access_log, player_guardians, player_medical, players, practices, profiles, registration_code_uses, registration_codes, registration_submissions (non-sink policies), role_requests (non-sink policies), seasons (non-STAY policies), site_content (non-STAY policies), suppressed_emails, team_coaches (non-STAY policies), team_important_dates, team_rosters, team_tasks, teams (non-STAY policies), user_roles, venue_fields (non-STAY policies), venues (non-STAY policies), volunteer_signups (non-sink policies).

**Expression preservation guarantee:** each rewrite is programmatic — the migration reads `pg_get_expr(polqual)` and `pg_get_expr(polwithcheck)` for each target policy from the live catalog, then emits `DROP POLICY … ; CREATE POLICY … TO authenticated USING (<verbatim>) WITH CHECK (<verbatim>)`. No manual retyping. If the TSV shows any expression that surprises you, tell me before I apply.

### 4. REVOKE ALL … FROM anon — 9 tables

Structural grant removal on the tables holding children and family PII, so RLS is not the only line:

- `players`
- `player_medical`
- `player_guardians`
- `guardians`
- `households`
- `guardian_households`
- `household_players`
- `league_players`
- `team_rosters`

## Mechanics

- Postgres has no `ALTER POLICY … TO`. Each rewrite is a **DROP POLICY + CREATE POLICY** pair. Confirmed.
- The entire pass — 130 drop/create pairs, 5 submit-sink rewrites, 9 revokes — runs in **one transaction**. If any statement fails, the transaction rolls back and no policy is left dropped. This is the reason for the single-transaction requirement.
- The migration is generated dynamically from the catalog inside a `DO $$ … $$` block: iterate `pg_policy` filtered by the two exclusion sets, format `DROP … ; CREATE …` with `pg_get_expr` output, `EXECUTE` each. This eliminates the class of bug where a hand-transcribed expression drifts from the live one.
- `TO authenticated` policies still evaluate their existing `auth.uid()` / helper expressions the same way — no behavior change for signed-in users, admins, commissioners, coaches, or guardians.
- Anon users lose the ability to *match* any of the 130 rewritten policies. They already couldn't (every expression denies them), so no live user path breaks. What changes is that a future edit turning an expression into `true` no longer opens the table to the world.

## Readback after apply

- `pg_policy` for the whole `public` schema with roles, one row per policy.
- Count of policies still applying to `PUBLIC`. Expected: **16** (the STAY_ANON_READ set exactly).
- `has_table_privilege('anon', <table>, verb)` for all four verbs on the nine revoked tables. Expected: **false everywhere**.

You then load the public site and check the Teams page.

## What is NOT in this pass

- No expression edits.
- No changes to STAY_ANON_READ policies.
- No changes to the six league-scoping gaps on `games`/`league_events`/`faqs`/`site_content`/`rules_policies`/`page_visibility`. Those are Phase 2+.
- No `REVOKE` on tables outside the nine PII tables. Grant hygiene on the rest is worth doing but is a separate decision.
