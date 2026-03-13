

## Move Events Tab First

Single change in `src/pages/admin/Schedule.tsx`: reorder the tabs so Events is first (and the default), followed by Games, then Practices.

### File: `src/pages/admin/Schedule.tsx`
- Change `defaultValue="games"` to `defaultValue="events"`
- Reorder `TabsTrigger` elements: Events, Games, Practices
- Reorder `TabsContent` elements to match

