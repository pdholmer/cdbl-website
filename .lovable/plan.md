# Fix "Bronco" mislabel on synced games

## What you're seeing

The Apr 28 card titled **"Bronco: Rays vs White Sox"** is actually a **Pinto** game (`Pinto Rays @ Pinto White Sox`) synced from BlueSombrero. The Bronco label is wrong, and that's also why our Bronco-skip filter didn't catch it — the event's real division is Pinto, not Bronco.

## Root cause

The same team names (`Rays`, `White Sox`, etc.) exist in multiple in-house divisions, but our sync resolves teams **by name only**. So:

- The synced Pinto game's home team "Pinto Rays" gets matched to the single `teams` row named "Rays" — which happens to be the **Bronco** Rays.
- `useScheduleEvents.ts` then builds the title using the **home team's** division ("Bronco") instead of the **event's** division ("Pinto").

Result: a Pinto game wears a Bronco label, and the Bronco filter (which checks the event's division) lets it through correctly — it's not a Bronco game at all.

## The fix (3 parts)

### 1. Title uses the event's own division (display fix — immediate)

In `src/hooks/useScheduleEvents.ts`, when classifying external events, prefer `e.division_id` (the event's own division) over the team's division for the display prefix. Look up the division name from a `divisions` map (we already have programs/teams; add a quick lookup via existing data or pass through `division_name` from the calendar event).

Effect: the Apr 28 card becomes **"Pinto: Rays vs White Sox"** even with the wrong team match.

### 2. Sync matches teams by (name + division), not name alone (data fix — correctness)

In `supabase/functions/sync-external-calendar/index.ts`, change team resolution so that when classifying an event:
- First determine the event's division from the title keyword (Pinto/Mustang/Bronco/Pony/T-Ball).
- Then match the home/away team by **name AND division_id** within that division.
- Fall back to name-only match (current behavior) only if no division was detected.

Effect: "Pinto Rays" maps to the Pinto Rays team, "Mustang Rays" to the Mustang Rays team, etc. Subsequent re-syncs will store the correct `home_team_id` / `away_team_id`.

### 3. Backfill the existing mismatched rows (one-time cleanup)

After deploying the sync fix, trigger a re-sync of the BlueSombrero calendar so the existing two mis-mapped rows (the Apr 28 Pinto game and the May 9 Mustang game already in the DB) get repointed to the correct team IDs.

## Files to change

- `src/hooks/useScheduleEvents.ts` — prefer event `division_id` for title prefix; surface division name via existing hooks (likely add `useDivisions` or reuse `useTeamHierarchy`'s programs→divisions).
- `supabase/functions/sync-external-calendar/index.ts` — scope team-by-name lookup to the detected division.

## Note on the Bronco skip filter

The existing filter is still correct and should stay — it skips events where the **event's** division is Bronco. Once team matching is fixed, it'll continue to work as intended. Today's Apr 28 game was never a Bronco game in the source data, so it shouldn't be filtered out — it should just be labeled "Pinto" correctly.
