

## Fix Equipment Requirements: Faceguards & Cups

### Problem
Equipment lists across several pages incorrectly state:
- **Faceguards**: Listed as mandatory ("Batting helmet with face guard") — they should be **optional/recommended**, not required
- **Athletic cups**: Listed as "required for catchers" only — they should be **recommended for all players**

### Affected Files & Changes

**4 files need updates** (all text-only changes, no logic):

#### 1. `src/pages/NewToCDBL.tsx` — Print checklist (line 62)
- Change: `☐ Batting helmet with face guard` → `☐ Batting helmet (face guard optional)`

#### 2. `src/pages/NewToCDBL.tsx` — Equipment Needs card (line 177)
- Change: `• Batting helmet with face guard` → `• Batting helmet (face guard optional)`

#### 3. `src/pages/NewToCDBL.tsx` — Print checklist cup line (line 65)
- Change: `☐ Athletic cup (required for catchers)` → `☐ Athletic cup (recommended for all players)`

#### 4. `src/pages/NewToCDBL.tsx` — Equipment Needs card cup line (line 180)
- Change: `• Athletic cup (required for catchers)` → `• Athletic cup (recommended for all players)`

#### 5. `src/pages/Registration.tsx` — FAQ answer (line 277)
- Change: `helmet with face guard (ages 4-12)` → `helmet (face guard optional)`
- Change: `athletic cup (required for catchers and recommended for all)` → `athletic cup (recommended for all players)`

#### 6. `src/pages/Teams.tsx` — Travel equipment list (line 364)
- Change: `Athletic cup (required)` → `Athletic cup (recommended for all players)`

### Scope
- 3 files modified, text-only changes
- No database, logic, or component structure changes

