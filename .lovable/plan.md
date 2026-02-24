

## Fix School Name: "Plato Kaneland Middle School" to "Prairie Knolls Middle School"

### What's Changing
The Schedule module displays "Plato Kaneland Middle School" in several calendar events. This is incorrect and should read **"Prairie Knolls Middle School"**.

### Where the Data Lives
The school name is hardcoded in `src/data/calendarEvents.ts` -- it appears in at least 3 event entries (lines 225, 250, 359). This is a static data file used by the Schedule page's calendar/list views.

### Steps

**1. Find-and-replace in `src/data/calendarEvents.ts`**
- Replace every occurrence of `"Plato Kaneland Middle School"` with `"Prairie Knolls Middle School"`
- There are 3 known occurrences across different events (Draft Night, Picture Days, etc.)

### Files to Modify
- `src/data/calendarEvents.ts` -- text replacement only, no logic changes

