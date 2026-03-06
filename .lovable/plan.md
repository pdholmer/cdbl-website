

## Make Schedule Dynamic and Show Upcoming Events

Currently the Schedule page and Featured Events carousel use hardcoded static data from `src/data/calendarEvents.ts`. The request is to:
1. Make the Featured Events section dynamic, pulling from the database (games + practices + static league events)
2. Filter the interactive schedule to show only upcoming events by default (archiving past dates)

### Approach

**1. Create a unified events hook (`useScheduleEvents`)**

A new hook that merges data from three sources into `CalendarEvent[]`:
- **Games** from the `games` table (via `useGames`) — mapped to `category: 'game'`
- **Practices** from the `practices` table (existing) — mapped to `category: 'practice'`
- **Static league events** from `calendarEvents.ts` — kept for board meetings, tournaments, ceremonies, etc. that aren't in the DB

Each DB record gets mapped to the `CalendarEvent` interface so all downstream components (carousel, calendar grid, list view) work unchanged.

**2. Update Featured Events Carousel**

Pass the merged events list filtered to upcoming-only, sorted by date, sliced to 6. The carousel component itself needs no changes — only the data source in `Schedule.tsx`.

**3. Default interactive schedule to upcoming events**

- Add a date filter that defaults to showing events from today onward
- Past events are still accessible (e.g., a "Show Past" toggle or filter), but the default view shows upcoming only
- The `filteredEvents` memo in `Schedule.tsx` will add a `>= today` check by default

**4. Update League Stats to use dynamic counts**

The stats cards currently count from the static array — update to count from the merged events.

### Files to Change

- **New file: `src/hooks/useScheduleEvents.ts`** — Merges games, practices, and static events into a unified `CalendarEvent[]`
- **Modified: `src/pages/Schedule.tsx`** — Use the new hook instead of static `calendarEvents` import; add upcoming-only default filter; add "Show Past Events" toggle
- **Modified: `src/components/FeaturedEventsCarousel.tsx`** — Minor: accept loading state prop for skeleton display

### Technical Details

The hook will:
```typescript
// Pseudocode
const useScheduleEvents = () => {
  const { data: games } = useGames();
  const { data: practices } = usePractices(); // may need to create
  
  const events = useMemo(() => {
    const gameEvents = (games || []).map(g => ({
      id: g.id,
      title: `${g.home_team?.name} vs ${g.away_team?.name}`,
      date: g.game_date,
      time: g.game_time,
      location: g.venue?.name,
      category: 'game' as const,
      // ... map remaining fields
    }));
    
    // Static events (board meetings, tournaments, etc.)
    const staticEvents = calendarEvents.filter(e => e.category === 'event');
    
    return [...gameEvents, ...practiceEvents, ...staticEvents];
  }, [games, practices]);
  
  return { events, isLoading };
};
```

For the upcoming filter, the default in `Schedule.tsx` will be:
```typescript
const [showPast, setShowPast] = useState(false);

// In filteredEvents memo:
if (!showPast) {
  events = events.filter(e => parseISO(e.date) >= startOfToday());
}
```

A simple toggle button ("Show Past Events" / "Show Upcoming Only") will be added to the toolbar area.

