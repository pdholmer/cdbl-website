

## Move Umpire Image Inside the Card

The image currently sits in a separate grid column, creating a disjointed look. The fix is to place the image inside the card itself, creating a unified layout.

### Changes

**File: `src/components/UmpiresSection.tsx`**

Remove the 2-column grid layout entirely. Instead, structure the card as:

1. A single full-width card with the image floated/placed at the top-right inside the card
2. Use a inner flex/grid layout: on `lg+`, image sits to the right of the text content inside the card; on mobile/tablet, image sits above the text content
3. Remove the outer `grid lg:grid-cols-5` wrapper — replace with a single card container

Structure:
```
<card>
  <div className="flex flex-col lg:flex-row gap-6">
    <div className="order-2 lg:order-1 lg:flex-1"> <!-- text content -->
    <div className="order-1 lg:order-2 lg:w-2/5"> <!-- image -->
  </div>
</card>
```

This keeps the image and text together in one visual unit, eliminating the gap.

