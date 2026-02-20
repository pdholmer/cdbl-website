
## Registration Page Fixes

### Summary of Claude's Recommendations — What's Real vs. Not

| Issue | Status | Action |
|---|---|---|
| Fee amounts contradict across pages | Confirmed — 3 different fee sets across DB, /registration, and /in-house/registration | Fix |
| Pony pricing bare '$' | Confirmed — DB has null, no null guard on Registration.tsx | Fix |
| FAQ references board@cdbl.org | Not accurate — scholarship FAQ already uses correct `cdbaseball.org` domain | Skip |
| 'ALL users must create new account' warning | Confirmed alarming — exists in both Registration and InHouseRegistration | Fix |
| Interstitial before redirect | target=_blank already exists; add a brief info note explaining the redirect | Fix |

---

### Root Cause: Fee Data Mismatch

The database has In-House fees set to: T-Ball $125, Pinto $150, Mustang $175, Bronco $200, Pony (null). These are likely outdated/incorrect values. The hardcoded fees ($195, $250, $275, $290, $335) in `InHouseRegistration.tsx` appear to be the correct 2026 fees per the stored memory. The comparison table in `Registration.tsx` already uses $195-$335, which matches those correct values.

**Solution:** Update the database divisions to reflect the correct 2026 fees, then remove all hardcoded fee values so every page pulls dynamically from the single source of truth.

---

### Changes

**1. Update database fees (data operation)**
Update the `divisions` table to set correct 2026 In-House fees:
- T-Ball: $195
- Pinto: $250
- Mustang: $275
- Bronco: $290
- Pony: $335

**2. `src/pages/InHouseRegistration.tsx`**
- Replace the hardcoded fee list with a dynamic query using `usePrograms()` hook (same pattern as `Registration.tsx` already uses)
- Add a null guard on cost: show `TBD — Contact registrar@cdbaseball.org` if cost is null (matching the `/in-house` page pattern)

**3. `src/pages/Registration.tsx`**
- Add a null guard on the fee card render: `division.cost != null ? \`$${division.cost}\` : 'TBD'` (line 91)
- The comparison table row already hardcodes `$195-$335` — update to reflect the real range dynamically or keep as accurate static text after the DB is corrected

**4. Soften the "ALL users must create new account" warning**
- `Registration.tsx` line 251: Change bold alarming text to: *"If you've registered with CDBL before, you'll need to create a new account in our updated registration system — it only takes 2 minutes."*
- `InHouseRegistration.tsx` line 201: Same softened language

**5. Add redirect notice before SportsConnect**
- On both registration pages, add a small info callout above (or below) the "Register Now" button:  
  *"Clicking Register Now will open our secure registration partner, SportsConnect, in a new tab. Return here any time for program information."*
- This is a static `<p>` or `<Alert>` — no modal needed, keeps it lightweight

### Files to Modify
- `src/pages/InHouseRegistration.tsx` — dynamic fees, soften warning, redirect notice
- `src/pages/Registration.tsx` — null guard on fees, soften warning, redirect notice
- Database `divisions` table — correct fee values for all 5 In-House divisions
