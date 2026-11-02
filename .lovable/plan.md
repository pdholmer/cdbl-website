# 2027 in-house registration: real flow, then the builder layout

Replaces the Prompt 6 restyle plan. Each phase is built only after a written "approved" for that phase, and every database change is shown as full SQL first.

## 1. Current state (checked in the database today)

**Households and people: mostly there**
- `households` (name, address, city, state, zip), `guardians` (linked to a login by auth_user_id), `guardian_households` (primary, receives comms), `household_players` (role, can edit medical).
- Families can read and update their own household, but **cannot create** a household, guardian link, or player. Only admin and registrar can insert. So a new family has no way in yet.

**Players: there, but old-style**
- `players` has 46 columns. Many are old copies of parent, address, payment and team data (parent_email, amount_due, team_id, team_name). These stay untouched; the new flow writes only child basics (name, date of birth, gender, preferred name, school, jersey size).
- `player_medical` exists (conditions, allergies, medications). Families can read it but not write it.
- Inserting a player now goes through `create_player_in_league`, which allows admin or registrar only.

**Registrations: the right table already exists**
- `registrations` has player, season, program, division, kind (division or ihtt), baseball_age, lifecycle, seat, payment, offer, waiver_status, on-hold fields, submitted/approved, checkout_id.
- Database guards already in place: no registration in a division with no fee (hides Colt and 15U); no registration while the season's age cutoff is empty; no opening a program while cutoff is empty; IHTT needs an in-house registration in the same checkout or already paid.
- Policies: admin manage; registrar read/insert/update; treasurer read; commissioner read for assigned programs; guardians read their own. **Guardians cannot create one yet.**

**Programs, seasons, divisions: there**
- 2027 rows exist for In-House (T-Ball 195, Pinto 250, Mustang 275, Bronco 290, Pony 335, Colt blank), Travel, and IHTT (8U to 14U, 1500 to 2250, matching travel fees). All closed. 2027 season cutoff date is empty, so registration correctly cannot open.
- **No clinic program row** exists for 2027.
- No age-range-to-birthdate rule stored in a usable form (divisions only have a text `age_range`).

**Documents: there, upload-based**
- `player_documents` (doc type, file path, verified). Commissioners have no policy on it, which is what you want. Not suited to signed waivers since it expects an uploaded file.

**Discounts:** `registration_codes` and `registration_code_uses` exist (code-based discounts). No early bird date, sibling, late fee or coach-child rule.

**Payments: missing.** No payment, ledger or checkout tables. `checkout_id` on registrations points at nothing yet. No Stripe connection.

**Old public path**
- `registration_submissions`: today only an admin policy exists, so anonymous inserts are already blocked by the rules. I still need to confirm and remove any leftover anonymous table permission on it, and retire it (no new writes).
- `register-player` function: no page calls it. It writes the old `players` style with parent fields and no sign-in. **Recommend retiring it** and removing it in phase 1.

**Missing, in short:** family self-signup into a household, family-created players and registrations, a waiver/form record, fee settings (early bird date, sibling, late fee, IHTT-also-pays-in-house switch), age placement rule, clinic program, payments/ledger, Stripe test setup.

## 2. Phased plan

Each phase ends with a test run in preview using test families.

**Phase 1: household and add player**
- Database: a secure function so a signed-in parent can create their own household and guardian record once; a secure function to add a player to their own household (child basics only, plus medical); family write policy on `player_medical` for their own players. Close leftover anonymous access on `registration_submissions`; retire `register-player`.
- Screens: Household "+ Add" opens an add-player sheet; first-time families see a short household setup (names, phone, address, D301 attestation).
- Test: new family signs up, confirms email, creates household, adds two kids; a second family cannot see them.

**Phase 2: registration record and division placement**
- Database: store an age-placement rule per division (birth date range from the season cutoff); add a 2027 clinic program; secure function for a parent to start a draft registration for their own player (in_house, ihtt, clinic only), which picks the division by birth date.
- Screens: program chips, division shown (not chosen), clear "not open yet" state until cutoff is set and the date arrives.
- Test: kids of different ages land in the right division; Colt/15U ages see "not offered"; empty cutoff blocks.

**Phase 3: forms and waivers**
- Database: a `registration_forms` table (one row per registration and form, typed name signature, signed time, version). Insert-only. Photo release stored as opt-out choice. Commissioners get no access.
- Screens: waiver rows with "Sign" action; next unsigned is the flood row.
- Test: sign, reload, status stays; commissioner cannot read.

**Phase 4: fees, discounts and cart total**
- Database: a season settings record (early bird end date, $25 sibling, $25 late fee, $25 early bird, IHTT-also-pays-in-house switch); head-coach-child rule read from active head coach on `team_coaches`. One secure function computes the cart total server-side.
- Screens: cart with line items and total.
- Test: tests for each rule with concrete numbers (two kids, early bird, late, coach child, IHTT both ways).

**Phase 5: Stripe test checkout and paid status**
- Database: insert-only `payments` ledger with league_id. Backend functions to create a Stripe test checkout and to receive Stripe's confirmation and mark registrations paid.
- Needs: a Stripe test key from you. Connect and Mercury payouts wait for the board.
- Test: test card pays, registrations show Paid, refund adds a reversing row.

**Phase 6: league office views**
- Registrar and admin list of registrations with status, forms and payment; treasurer read-only money view. Household to-dos switch from "Not tracked yet" to real Forms and Pay status.

**Phase 7: builder layout**
- Split stage on desktop/iPad, stacked on phone, action bar with counter and blue pill, on top of the real steps. All visual rules apply.

## 3. Decisions only the league can make

1. Does an IHTT family also pay in-house? Recommend: a setting, default "yes" since the database already requires an in-house registration.
2. Early bird end date (6 weeks before Apr 24 is Mar 13, after registration closes). Recommend: confirm the intended date.
3. Sibling discount: $25 off each additional child, or per family once? Recommend: each additional child.
4. Late fee start: after which date? Recommend: Feb 15.
5. Do discounts stack (early bird plus sibling)? Recommend: yes.
6. Head coach child free: in-house only, and does it apply before teams exist? Recommend: board marks coaches after the Mar 9 vote and the registrar refunds.
7. D301 check: realistic is a typed attestation plus the address on file, with registrar spot checks. Recommend that; no uploads.
8. Exact waiver list and wording (medical, concussion, code of conduct, photo release opt-out). Needed from the league.
9. Clinic: price, dates, and age range. Needed.
10. Age cutoff date for 2027. Needed before opening.
11. Payment plans (3 installments) in 2027 or later. Recommend: later.
12. Refund policy wording.

## 4. Risks to Dec 21

- Waiver wording, clinic details and cutoff date not yet supplied.
- Stripe test key and account not yet set up; live mode depends on the Nov 17 vote.
- Old `players` columns could confuse staff views; mitigated by writing only to the new tables.
- Email confirmation delivery for new families should be tested early.
- Preview testing of signed-in flows has been unreliable in my test browser, so you will need to click through each phase on the real preview.

## Technical details
- Every new table: league_id not null, RLS on, policies by current_league_id(), anonymous privileges revoked. Money rows insert-only.
- Family writes go through security-definer functions checking `is_guardian_of_household` / `is_guardian_of_player`, not open insert policies.
- No existing policy changes unless named here (only the `registration_submissions` anonymous cleanup).
- roadmap.md will get these seven phases when building starts (plan mode allows no other file edits).
