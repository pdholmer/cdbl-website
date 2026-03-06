

## Improve VenueEdit Page Layout

The current page stacks 4 full-width cards vertically with a lot of wasted horizontal space. The form is long and requires excessive scrolling.

### Changes — `src/pages/admin/VenueEdit.tsx`

Reorganize into a **two-column layout** on desktop:

```text
┌─────────────────────────┬──────────────────────────┐
│  Basic Information      │  Contact Information     │
│  Name, Address, City,   │  Name, Phone, Email      │
│  State, Zip, Status     │                          │
│  Features: ☐☐☐          │  Additional Info         │
│                         │  Parking, Directions     │
├─────────────────────────┴──────────────────────────┤
│  Individual Fields                    [+ Add Field] │
│  ┌─ Field 1 ──────────────────────────────────────┐ │
│  │ #  Name  Status  Divisions  Notes    [🗑]      │ │
│  └────────────────────────────────────────────────┘ │
│  ┌─ Field 2 ──────────────────────────────────────┐ │
│  │ ...                                             │ │
│  └────────────────────────────────────────────────┘ │
│                              [Save]  [Cancel]       │
└─────────────────────────────────────────────────────┘
```

1. **Two-column top section**: Merge "Basic Information" and "Contact + Additional Info" side-by-side using `grid lg:grid-cols-2`. Left column has name/address/features. Right column has contact details and parking/directions.

2. **Compact field rows**: Replace the current stacked card-per-field layout with a denser inline row layout. Each field becomes a single horizontal row with all inputs on one line (field number, name, status select, divisions, notes) plus a delete button. This drastically reduces vertical space.

3. **Sticky save bar**: Move Save/Cancel buttons into a sticky footer bar at the bottom of the form for easy access without scrolling.

4. **Wider field inputs**: Use `grid-cols-5` or flex layout for field rows so all columns fit on one line on desktop, collapsing to stacked on mobile.

Single file change: `src/pages/admin/VenueEdit.tsx`.

