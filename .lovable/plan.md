

## Fix: DivisionFinder Cost Mismatch — Use Database-Driven Costs

### Problem
The `DivisionFinder` component (`src/components/DivisionFinder.tsx`) determines the age group from a birth year and displays a hardcoded cost (lines 21-60). Meanwhile, the In-House page (`src/pages/InHouse.tsx`) and Registration page pull costs dynamically from the database via `usePrograms`. If database costs are updated, the DivisionFinder will show stale values, creating a mismatch.

Currently both sources happen to agree (T-Ball $195, Pinto $250, Mustang $275, Bronco $290, Pony $335), but the architecture guarantees future drift. The fix is to make DivisionFinder consume the same database-driven division data.

### Solution
Refactor `DivisionFinder` to use the `usePrograms` hook for cost data instead of hardcoding it.

### Technical Details

**File: `src/components/DivisionFinder.tsx`**

1. Import and call `usePrograms()` to get `inHouseDivisions`
2. Keep the birth-year-to-division-name mapping (the age ranges are structural and won't change), but replace the hardcoded `cost` field with a lookup into `inHouseDivisions` by matching on division name
3. The `getDivisionFromBirthYear` function will accept the divisions array as a parameter and pull `cost` from the matching database record
4. Show a loading state or fallback ("TBD") if the hook is still loading or cost is null

The static `BIRTH_YEAR_OPTIONS` array (used for the dropdown labels) will remain hardcoded for the division name/age labels since those are structural, but the cost shown in the result card will come from the database.

### Scope
- 1 file modified: `src/components/DivisionFinder.tsx`
- No database changes needed

