
## Update Travel Page Hero Image

Replace the current `hero-travel-teams.jpg` with the uploaded Rockets team photo.

### Changes

**1. Copy image to assets**
- Copy `user-uploads://image-14.png` → `src/assets/hero-travel-rockets.jpg`

**2. `src/pages/Travel.tsx`**
- Swap the import: replace `import heroTravelTeams from "@/assets/hero-travel-teams.jpg"` with `import heroTravelRockets from "@/assets/hero-travel-rockets.jpg"`
- Update the `backgroundImage` style to reference `heroTravelRockets`

### Files to Modify
- `src/assets/hero-travel-rockets.jpg` — new asset (copied from upload)
- `src/pages/Travel.tsx` — updated import and background image reference
