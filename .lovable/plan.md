
## Replace 2026 Registration Hero Image

A straightforward asset swap — copy the uploaded image into the project and update the Hero component to use it.

### Changes

**1. Copy asset**
Copy `user-uploads://image-11.png` → `src/assets/hero-registration.jpg`

This overwrites the existing `hero-registration.jpg` file, so no import path changes are needed in `Hero.tsx` — the file name stays the same.

### Files to Modify
- `src/assets/hero-registration.jpg` — replaced with the new upload (overwrite in place)
- No changes to `Hero.tsx` needed since the import already references `hero-registration.jpg`
