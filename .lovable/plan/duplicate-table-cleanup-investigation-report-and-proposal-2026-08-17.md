# Duplicate table cleanup — investigation report and proposal

Read-only investigation completed. Nothing has been changed.

---

## 1. `player_guardians` vs the people spine

### Current state (verified)

- `player_guardians`: 2 rows. `guardians`: 2 rows. `households`: 1. `household_players`: 1.
- `guardians` carries `legacy_player_guardian_id`, so the two legacy rows are traceable.

### Row-level comparison — both legacy rows are already fully represented

| legacy `player_guardians` row | spine equivalent | match |
|---|---|---|
| Paul Holmer · pdholmer@gmail.com · 8474890218 · primary · 4372 John Milton Road, Elgin IL 60124 | guardian `2321d4f3…` (same name/email/phone) → `guardian_households.is_primary = true` → household "Holmer Household" (same address) → `household_players` → player `65907f0a…` | complete |
| Jessica Holmer · jlkenn2@gmail.com · 6305080192 · not primary · same address | guardian `bec3a384…` (same name/email/phone) → `guardian_households.is_primary = false` → same household → same player | complete |

Nothing needs migrating. Names, emails, phones, primary flag and address all agree. No ambiguous rows.

Two differences worth naming, neither blocking:
- `player_guardians.relationship = 'parent'` on both rows; the spine stores `household_players.role = 'manager'` (a household-level role, not a per-guardian relationship). The relationship word is not carried anywhere in the spine.
- Both `guardians.auth_user_id` are NULL, so `is_guardian_of_player()` currently returns false for these two people. That is a separate live gap, not a migration blocker — flagging it, not fixing it here.

### Every reference to `player_guardians`

Code:
- `src/hooks/useGuardians.ts` — `useGuardians(playerId)` SELECT
- `src/hooks/useGuardianMutations.ts` — INSERT, UPDATE, DELETE
- Consumers: `src/components/GuardianDialog.tsx`, `src/pages/admin/PlayerEdit.tsx`
- `src/integrations/supabase/types.ts` (generated)

Database:
- FK out: `player_guardians_player_id_fkey → players`. No FK points *at* it.
- Policies on it: "Admins have full access to player guardians" (ALL), "Guardians view via household path" (SELECT)
- No trigger except `updated_at`, no function references it, no view references it.

---

## 2. `suppressed_emails` vs `email_suppressions`

- `suppressed_emails`: 0 rows, columns `id, email, reason(text), metadata, created_at`. Policies are both gated on `auth.role() = 'service_role'` but granted `TO authenticated` — dead as written.
- `email_suppressions`: 0 rows, richer: `league_id`, `reason` (enum `suppression_reason`), `detail`, `source`, `released_at`, `released_by`. Admin/board policy.
- **Readers of `suppressed_emails`: none.** No code, no function, no view, no FK, no policy elsewhere.
- Readers of `email_suppressions`: `supabase/functions/send-notifications/index.ts` (suppression check before send), `supabase/functions/resend-webhook/index.ts` (writes on hard bounce/complaint), `src/components/admin/communication/HealthTab.tsx` (read + release).

Winner is `email_suppressions`. `suppressed_emails` is empty and orphaned — nothing to migrate, no code to rewrite.

---

## 3. `players` vs `league_players` — report only, no SQL proposed

What `league_players` adds: `league_id, player_id, status, joined_at, left_at, created_at, updated_at`. `players` has no `league_id` column at all — tenancy lives entirely in `league_players`. It also adds membership lifecycle (`status`, `joined_at`, `left_at`) that `players.status` (a registration-ish status) does not express.

It is also the composite FK anchor `(league_id, player_id)` for eight tables: `registrations`, `team_rosters`, `player_medical`, `player_documents`, `player_notes`, `player_aliases`, `evaluations`, `household_players`. Those tables reference `league_players`, not `players`.

Policies that depend on it: all four `players` policies (SELECT / UPDATE ×2 / DELETE) wrap their check in `EXISTS (SELECT 1 FROM league_players lp WHERE lp.player_id = players.id AND lp.league_id = current_league_id())`, plus the four policies on `league_players` itself (admin ALL, guardian SELECT, and today's coach and commissioner SELECT policies, which stay). `create_player_in_league()` writes both tables in one transaction.

Written recommendation (one page, in the report below) — no drop proposed for either.

---

## Proposal (nothing applied)

### Step 1 — code rewrite, no SQL

`useGuardians` / `useGuardianMutations` move off `player_guardians` onto the spine:
- read: `guardians` joined through `guardian_households` → `households` → `household_players` filtered by `player_id`
- create: insert `guardians`, then `guardian_households` (attach to the player's household, creating one if the player has none), preserving `is_primary`
- update: update `guardians` fields; `is_primary` updates `guardian_households`
- delete: delete the `guardian_households` link (and the `guardians` row if it has no other links)

`GuardianDialog` and `PlayerEdit` keep their current shape; the hook returns the same field names.

No changes needed for suppression — nothing reads `suppressed_emails`.

### Step 2 — migrate + verify migration (no drops)

Because both legacy rows are already represented, this migration carries no data movement. It only:
- backfills `guardians.legacy_player_guardian_id` for the two rows so the link is explicit rather than inferred by email
- revokes write access on `player_guardians` and `suppressed_emails` (freeze read-only), leaving SELECT for admins
- adds a table comment recording supersession and the date

Verification, run after apply: every `player_guardians` row resolves to a guardian + household + player triple; `suppressed_emails` count is still 0.

### Step 3 — drop, separate approval

A follow-up migration you approve separately: `DROP TABLE public.suppressed_emails;` and `DROP TABLE public.player_guardians;`. Only after Step 1 is deployed and Step 2 verified.

### `players` vs `league_players` recommendation

`league_players` owns tenancy and membership; `players` owns identity and person attributes. Keep both, and treat the split as intentional: `players` should never gain a `league_id`, and `league_players` should never gain person fields. The real problem in this pair is not duplication but that `players` still carries `parent_guardian_name`, `parent_email`, `parent_phone`, `address_*` and `team_id`/`team_name` — those are the actual superseded duplicates, of the guardian spine and of `team_rosters` respectively. That is the next cleanup to scope, and it is a bigger one than this.

---

Stopping here for your approval. Nothing will be written until you say so.
