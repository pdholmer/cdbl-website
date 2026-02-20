
## Replace 2026 Registration Carousel Image

A simple asset swap — overwrite the existing file so no import changes are needed.

### Change

**Copy asset**
`user-uploads://image-13.png` → `src/assets/hero-registration.jpg`

This overwrites `hero-registration.jpg` in place. `Hero.tsx` already imports this file by name, so the carousel will automatically pick up the new image with no code changes required.

### Files to Modify
- `src/assets/hero-registration.jpg` — replaced with the new upload

### No Changes Needed
- `src/components/Hero.tsx` — import path stays the same
- `src/pages/Registration.tsx` (if it uses this asset) — import path stays the same
