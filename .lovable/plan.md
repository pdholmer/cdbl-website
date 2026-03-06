

## Update Division Groupings on In-House Schedule Page

The "Game Schedules by Division" section currently has three cards:
1. T-Ball & Pinto (Ages 4-8)
2. Bronco & Pony (Ages 9-12)
3. Colt (Ages 13-14)

The user wants them restructured to:
1. **T-Ball & Pinto** (Ages 4-8)
2. **Mustang & Bronco** (Ages 9-12)
3. **Pony & Colt** (Ages 13-14)

### Changes

**File: `src/pages/InHouseSchedule.tsx`**

- **Card 2 (lines 136-166)**: Change title from "Bronco & Pony (Ages 9-12)" to "Mustang & Bronco (Ages 9-12)". Keep existing schedule details.
- **Card 3 (lines 168-198)**: Change title from "Colt (Ages 13-14)" to "Pony & Colt (Ages 13-14)". Keep existing schedule details.

Two line edits, no structural changes.

