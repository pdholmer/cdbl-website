

## Simplify Location Filter to 4 Categorical Options

### Change

Replace the dynamic location dropdown (which currently lists every distinct venue string from synced events) with a fixed 4-option categorical filter:

- **All Locations** (default)
- **Stonecrest**
- **Plato**
- **Burlington**
- **Other** (anything that doesn't match the three above)

This gives parents/coaches a quick way to check field activity at our three primary local sites without wading through dozens of away-game venue names.

### Matching logic (`src/pages/Schedule.tsx`)

Case-insensitive substring match on `event.location`:

| Filter value | Matches when `event.location` contains… |
|---|---|
| `stonecrest` | "stonecrest" |
| `plato` | "plato" (covers "Plato Center", "Plato Center Park", etc.) |
| `burlington` | "burlington" |
| `other` | none of the above three keywords (and location is non-empty OR empty — included so parents can find off-site/TBD games too) |
| `all` | no filter applied |

Remove the `availableLocations` `useMemo` derivation — no longer needed since options are static.

### Toolbar styling (`src/components/UnifiedScheduleToolbar.tsx`)

- Remove the `MapPin` icon from the Location trigger so it matches Program / Division / Team (which use plain text triggers, no icons).
- Replace dynamic `availableLocations.map(...)` with hardcoded `SelectItem`s for the four options.
- Drop the `availableLocations` prop from the component interface.
- Keep the same desktop placement (after Team, `w-[200px]`, `rounded-2xl border-2`) and the mobile full-width row.
- Update the active filter badge text to display the chosen label (e.g. `📍 Stonecrest`) — emoji is on the badge in the page, not on the trigger.

### Files touched

- `src/pages/Schedule.tsx` — swap dynamic location list for fixed 4 options + categorical match logic; remove `availableLocations` memo.
- `src/components/UnifiedScheduleToolbar.tsx` — remove `MapPin` icon, hardcode the 4 `SelectItem`s, drop `availableLocations` prop.

