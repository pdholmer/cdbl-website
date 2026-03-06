

## Fix Division Cards Layout for Desktop

The current grid is `md:grid-cols-2`, which means 3 cards display as 2 on top and 1 orphaned below — an awkward layout.

### Change

**File: `src/pages/InHouseSchedule.tsx` (line 103)**

Change the grid from `md:grid-cols-2` to `lg:grid-cols-3` so all three cards sit side-by-side on desktop. Also widen `max-w-4xl` to `max-w-6xl` to give them room.

```
grid md:grid-cols-2 gap-6 max-w-4xl mx-auto
→
grid md:grid-cols-3 gap-6 max-w-6xl mx-auto
```

Single line change. Cards will stack on mobile and display as a clean 3-column row on desktop.

