

## Redesign Admin Facilities Page with Inline Field Status Management

Currently, admins must click into each venue's edit form to change individual field statuses — too many clicks for a frequent operation like marking fields open/closed.

### Approach

Redesign the admin Venues page (`src/pages/admin/Venues.tsx`) to surface all fields with inline status controls directly on the main page. The page will shift from a venue-centric table to a **field-status dashboard** with venue grouping.

### Layout

```text
┌──────────────────────────────────────────────────┐
│  Facility Management                [Add Facility]│
├──────────────────────────────────────────────────┤
│  [3 Open] [6 Closed] [0 Maintenance]  ← stat cards│
│  [Set All Open]  [Set All Closed]    ← bulk actions│
├──────────────────────────────────────────────────┤
│  🔍 Search...          Status filter ▼            │
├──────────────────────────────────────────────────┤
│  Burlington Fields                    [Edit ✏️]   │
│  ┌─────────────────┬─────────────┬────────────┐  │
│  │ Burlington Lower │ Bronco      │ [●Open ▼]  │  │
│  │ Burlington Upper │ Mustang,Pin │ [●Closed▼] │  │
│  └─────────────────┴─────────────┴────────────┘  │
│                                                    │
│  Stonebrook Fields                    [Edit ✏️]   │
│  ┌─────────────────┬─────────────┬────────────┐  │
│  │ Field 1          │ Pony        │ [●Open ▼]  │  │
│  │ ...               │             │            │  │
│  └─────────────────┴─────────────┴────────────┘  │
└──────────────────────────────────────────────────┘
```

### Changes

**File: `src/pages/admin/Venues.tsx`** — Major rewrite

1. **Fetch all venue fields** alongside venues using a new query for `venue_fields` (join with venue name).
2. **Stat cards**: Show counts for Open / Closed / Maintenance fields (not just venue counts).
3. **Bulk actions**: "Set All Open" and "Set All Closed" buttons that call `useVenueFieldMutations` to update all fields at once.
4. **Venue-grouped card layout**: Replace the table with cards grouped by venue. Each card shows the venue name, an "Edit" link, and a compact table/grid of its fields.
5. **Inline status select**: Each field row has a `<Select>` dropdown (Open/Closed/Maintenance) that immediately saves via `updateField.mutate()` — no form submission needed.
6. **Notes field**: Show an inline editable notes input next to closed/maintenance fields for context (e.g., "Rain damage").
7. **Color-coded status badges**: Green for open, red for closed, yellow for maintenance — consistent with the public Fields page.

**File: `src/hooks/useVenueFields.ts`** — Minor update

- Add an `useAllVenueFields` hook (or modify existing) that fetches all fields across all venues (no `venueId` filter, `enabled: true`), joining venue name for display.

### No database changes needed
The `venue_fields` table already has `status`, `notes`, and the admin-only RLS policy for full access. The `useVenueFieldMutations` hook already supports `updateField`.

### Key UX details
- Status changes save instantly on select change (optimistic or with toast confirmation)
- Bulk actions show a confirmation count ("Update 9 fields to Open?")
- The existing venue edit page remains for full facility editing (address, features, adding/removing fields)

