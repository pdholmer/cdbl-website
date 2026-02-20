
## Update In-House Hero Image

Replace the current `hero-inhouse.jpg` with the uploaded kids baseball photo.

### Changes

**1. Copy image to assets**
- Copy `user-uploads://image-15.png` → `src/assets/hero-inhouse.jpg`

**2. `src/pages/InHouse.tsx`**
- The import `import heroInhouse from "@/assets/hero-inhouse.jpg"` already exists and is already referenced in the `backgroundImage` style — no import change needed, just the asset file itself gets replaced.

### Files to Modify
- `src/assets/hero-inhouse.jpg` — replaced with the uploaded image
- `src/pages/InHouse.tsx` — no code changes needed (import and reference are already correct)
