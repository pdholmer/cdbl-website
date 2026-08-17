# Pre-Roster Cleanup: Derived Counts, Division Roster Bounds, Display Names

Read-only investigation is complete. Nothing has been applied. All SQL below waits for your explicit "approved".

## What I found

**1. Stored roster count**

`update_team_roster_count()` is a `SECURITY DEFINER` trigger function on `team_rosters` (`AFTER INSERT OR UPDATE OR DELETE`, FOR EACH ROW). It rewrites `teams.current_roster_count` with a count of `team_rosters` rows where `status = 'active'`.

Every reader of `current_roster_count` (3 files, 4 sites; nothing in edge functions):

| File | Line | Use |
|---|---|---|
| `src/pages/admin/Teams.tsx` | 206 | `{team.current_roster_count} / {team.max_roster_size}` |
| `src/pages/admin/TeamEdit.tsx` | 352 | `Manage players ({team?.current_roster_count || 0} / {team?.max_roster_size || 12})` |
| `src/pages/commissioner/Teams.tsx` | 214 | `{team.current_roster_count || 0} / {team.max_roster_size || 12}` |
| `src/pages/admin/Reports.tsx` | 115-116 | CSV columns `Current Roster` / `Max Roster` |

All four also hardcode the magic 12 as a fallback or default (`TeamEdit.tsx:73` defaults new teams to `max_roster_size: 12`).

**2. Divisions and roster sizes**

`divisions` has: `id, program_id, name, age_range, cost, season_length, features, schedule_notes, display_order, created_at, updated_at, league_id`. No roster-bound columns exist.

All 44 teams have `max_roster_size = 12` and `current_roster_count = 0`. 14 divisions: In-House (T-Ball, Pinto, Mustang, Bronco, Pony, Colt) and Travel (8U-15U).

**3. Team names vs aliases**

All 44 teams have exactly one `team_aliases` row, and in every case `external_name` is byte-identical to the current `teams.name` (source `sportsconnect`, `match_method = reviewed_name`). So renaming `teams.name` loses nothing — the Sports Connect string stays intact in the alias, which is the join key.

**4. "Colt Carte" — flagged, not changed**

Alias row `71a0f30d-7c29-4b01-96e0-2399de75a693`, `external_name = 'Colt Carte'`, `source_division = 'Colt (High School & Up Ages 15+)'`, `external_id` empty.
Source row in `import_sc_teams`: `source_team = 'Colt Carte'`, allocated players **0**, unallocated 1, allocated volunteers **0**. Compare its siblings: Colt 17U (10 players, 2 volunteers), Colt 17O (11 players, 2 volunteers). It looks like a stray or placeholder entry in Sports Connect rather than a real team, but that is your call — no change proposed.

## Change 1 — derived roster counts

Create the view, repoint the four readers, verify. The trigger and column drop come in a separate follow-up you approve on its own.

```sql
CREATE OR REPLACE VIEW public.team_roster_counts
WITH (security_invoker = on) AS
SELECT t.id AS team_id,
       count(tr.id) FILTER (WHERE tr.status = 'active') AS active_count
FROM public.teams t
LEFT JOIN public.team_rosters tr ON tr.team_id = t.id
GROUP BY t.id;

REVOKE ALL ON public.team_roster_counts FROM anon;
GRANT SELECT ON public.team_roster_counts TO authenticated;
```

`security_invoker = on` plus the LEFT JOIN means a caller with no `team_rosters` policy sees the team with a count of 0 rather than losing the row.

Code changes (each page adds a `team_roster_counts` fetch keyed by `team_id` and renders `counts[team.id] ?? 0` in place of `team.current_roster_count`):

- `src/pages/admin/Teams.tsx:206`
- `src/pages/admin/TeamEdit.tsx:352`
- `src/pages/commissioner/Teams.tsx:214`
- `src/pages/admin/Reports.tsx:115`

Follow-up migration, separate approval only after the UI is verified:

```sql
DROP TRIGGER update_team_roster_count_trigger ON public.team_rosters;
DROP FUNCTION public.update_team_roster_count();
ALTER TABLE public.teams DROP COLUMN current_roster_count;
```

## Change 2 — division roster bounds

```sql
ALTER TABLE public.divisions
  ADD COLUMN default_min_roster_size integer,
  ADD COLUMN default_max_roster_size integer;

COMMENT ON COLUMN public.divisions.default_min_roster_size IS 'Division roster floor. teams.max_roster_size NULL means use the division default.';

-- PLACEHOLDER VALUES - replace with the real numbers at approval
UPDATE public.divisions SET default_min_roster_size = 8,  default_max_roster_size = 12 WHERE name = 'T-Ball';
UPDATE public.divisions SET default_min_roster_size = 9,  default_max_roster_size = 12 WHERE name = 'Pinto';
UPDATE public.divisions SET default_min_roster_size = 10, default_max_roster_size = 13 WHERE name = 'Mustang';
UPDATE public.divisions SET default_min_roster_size = 10, default_max_roster_size = 13 WHERE name = 'Bronco';
UPDATE public.divisions SET default_min_roster_size = 10, default_max_roster_size = 14 WHERE name = 'Pony';
UPDATE public.divisions SET default_min_roster_size = 10, default_max_roster_size = 16 WHERE name = 'Colt';
UPDATE public.divisions SET default_min_roster_size = 9,  default_max_roster_size = 12 WHERE name LIKE '%U Travel';

-- teams.max_roster_size becomes an override; every current 12 is the old magic number, not a decision
ALTER TABLE public.teams ALTER COLUMN max_roster_size DROP NOT NULL;
ALTER TABLE public.teams ALTER COLUMN max_roster_size DROP DEFAULT;
COMMENT ON COLUMN public.teams.max_roster_size IS 'Per-team override. NULL means use divisions.default_max_roster_size.';
UPDATE public.teams SET max_roster_size = NULL WHERE max_roster_size = 12;
```

**Every number above is a placeholder.** Give me the real per-division min/max at approval and I will substitute them before applying.

Code: the four readers stop defaulting to 12 and instead read the effective cap (team override, else division default), which the view can carry:

```sql
CREATE OR REPLACE VIEW public.team_roster_counts
WITH (security_invoker = on) AS
SELECT t.id AS team_id,
       count(tr.id) FILTER (WHERE tr.status = 'active') AS active_count,
       COALESCE(t.max_roster_size, d.default_max_roster_size) AS effective_max,
       d.default_min_roster_size AS effective_min
FROM public.teams t
LEFT JOIN public.divisions d ON d.id = t.division_id
LEFT JOIN public.team_rosters tr ON tr.team_id = t.id
GROUP BY t.id, t.max_roster_size, d.default_max_roster_size, d.default_min_roster_size;
```

`TeamEdit.tsx:73` drops the `max_roster_size: 12` default (new teams inherit the division), and the Max Roster Size field label becomes "Max Roster Size (leave blank to use division default)".

## Change 3 — display names

Rule applied: strip the leading division word only where the team name is exactly `<Division> <Mascot>` and a non-empty mascot remains. That covers T-Ball, Pinto and Mustang. Travel names keep their full form. `Bronco` (no mascot), `CDBL Pony 14u`, and the three Colt teams are left alone. `team_aliases` is untouched.

24 of 44 names change:

| Current | New |
|---|---|
| T-Ball Bulls | Bulls |
| T-Ball Grasshoppers | Grasshoppers |
| T-Ball Hooks | Hooks |
| T-Ball Hot Rods | Hot Rods |
| T-Ball Iron Pigs | Iron Pigs |
| T-Ball Lugnuts | Lugnuts |
| T-Ball Maurauders | Marauders (spelling corrected) |
| T-Ball Mud Cats | Mud Cats |
| T-Ball River Dogs | River Dogs |
| T-Ball Yard Goats | Yard Goats |
| Pinto Brewers | Brewers |
| Pinto Cardinals | Cardinals |
| Pinto Cubs | Cubs |
| Pinto Orioles | Orioles |
| Pinto Pirates | Pirates |
| Pinto Rays | Rays |
| Pinto White Sox | White Sox |
| Mustang Brewers | Brewers |
| Mustang Cardinals | Cardinals |
| Mustang Cubs | Cubs |
| Mustang Orioles | Orioles |
| Mustang Pirates | Pirates |
| Mustang Rays | Rays |
| Mustang White Sox | White Sox |

Unchanged (20): Bronco; CDBL Pony 14u; Colt 17O; Colt 17U; Colt Carte; CDBL Rockets 8u Blue; 9u Blue; 10u Blue; 10u IHTT; 10u White; 11u Blue; 11u Gray; 11u White; 12u Blue; 12u White; 13u Blue; 13u Gray; 13u White; 14u Blue; 15u Blue.

Note: Pinto and Mustang both field Brewers, Cardinals, Cubs, Orioles, Pirates, Rays and White Sox. After the strip, seven mascot names appear twice league-wide, unique only within a division. Any UI listing teams across divisions must render division alongside name. If you would rather keep names globally unique, say so and I will leave Mustang or Pinto prefixed instead.

```sql
UPDATE public.teams t
SET name = btrim(regexp_replace(t.name, '^' || d.name || '\s+', ''))
FROM public.divisions d
WHERE d.id = t.division_id
  AND d.name IN ('T-Ball', 'Pinto', 'Mustang')
  AND t.name ~ ('^' || d.name || '\s+\S')
  AND btrim(regexp_replace(t.name, '^' || d.name || '\s+', '')) <> '';

UPDATE public.teams SET name = 'Marauders' WHERE name = 'Maurauders';
```

Verification after applying: re-list all 44 `teams.name` values next to their `team_aliases.external_name`, and assert every alias `external_name` is unchanged and every team still resolves through its alias.

## Sequencing

1. Change 1 view + code rewrite, verified in the UI.
2. Change 2 (with your real numbers).
3. Change 3 rename + verification.
4. Separate approval: drop the trigger, function and `current_roster_count` column.

## Open items for you

- Real min/max roster numbers per division.
- Duplicate mascot names across Pinto and Mustang: acceptable or not.
- "Colt Carte": leave, rename, or retire.
