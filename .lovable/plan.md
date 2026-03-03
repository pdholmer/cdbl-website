

## Fix Youth Umpire Section Responsive Layout

**Problem**: The image in the 2-column (md:col-span-2) right side is small and vertically centered against the tall left card, creating large empty gaps — especially visible on tablet (768px) and desktop.

### Changes

**File: `src/components/UmpiresSection.tsx`**

1. **Change grid alignment** from `items-center` to `items-start` so the image aligns to the top of the card instead of floating in the middle.

2. **Make the image fill its column** by using `object-cover` with a fixed height that adapts per breakpoint, and add `sticky top-24` on large screens so the image stays visible as users scroll the longer card content.

3. **Adjust the grid ratio** from `md:grid-cols-5` (3+2) to `lg:grid-cols-5` with a stacked layout at `md` breakpoint (tablet). At `md` the image should sit above the card at a reasonable max-height; at `lg+` it goes side-by-side.

Specifically:
- **Line 17**: Change `grid md:grid-cols-5` to `grid lg:grid-cols-5` so tablet gets a stacked (single-column) layout, and change `items-center` to `items-start`.
- **Line 18**: Change `md:order-1 md:col-span-3` to `lg:order-1 lg:col-span-3`.
- **Line 82**: Change `order-1 md:order-2 md:col-span-2` to `order-1 lg:order-2 lg:col-span-2`.
- **Line 83**: Add `object-cover h-64 md:h-80 lg:h-full max-h-[500px]` to the image so it crops nicely at every breakpoint instead of displaying at its natural (sometimes too-small) size.

This gives:
- **Mobile** (< 768px): Image on top, card below (stacked) — unchanged.
- **Tablet** (768-1023px): Same stacked layout with a controlled image height instead of the awkward side-by-side with a tiny image.
- **Desktop** (1024px+): Side-by-side with the image filling its column height, top-aligned.

