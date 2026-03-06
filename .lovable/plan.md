

## Optimize Fields Page Layout

The current page has excessive vertical spacing — each venue gets a full-width section with `py-16`, large gaps, and the map + info card use a 2-column grid that leaves a lot of whitespace. The bottom sections (Visitor Info, Coach Resources) are narrow `max-w-3xl` centered cards with big padding.

### Changes — `src/pages/Fields.tsx`

1. **Tighter venue sections**: Reduce `py-16` to `py-8`, `mb-12` gaps to `mb-6`, and `gap-12` to `gap-6`. Shrink heading sizes from `text-3xl md:text-4xl` to `text-2xl font-bold`.

2. **Compact map + info row**: Keep the 2-col grid but make the map smaller (`aspect-[16/10]` instead of `aspect-video` with `mb-6`). Move the address details inline rather than inside a full Card — just text with icon, no card chrome. This saves significant vertical space per venue.

3. **Inline field status row**: Replace the `grid md:grid-cols-2 lg:grid-cols-4` field cards with a compact horizontal list/table row. Each field becomes a single row: name, divisions badge, status badge, and notes — no card wrapper. This cuts the field section height dramatically.

4. **Merge bottom sections**: Combine "Visitor Information" and "For Coaches" side-by-side in a 2-column grid instead of stacking them full-width, halving the vertical footprint.

5. **Reduce hero padding**: `py-16 md:py-24` → `py-12 md:py-16`.

Single file change: `src/pages/Fields.tsx`.

