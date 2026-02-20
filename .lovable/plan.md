
## Replace "New to CDBL" Carousel Image

A straightforward asset swap — overwrite the existing file so no import changes are needed.

### Change

**Copy asset**
`user-uploads://image-12.png` → `src/assets/hero-new-to-cdbl.jpg`

This overwrites the existing `hero-new-to-cdbl.jpg` in place. Both `Hero.tsx` (carousel) and `NewToCDBL.tsx` (page hero) already import this file by name, so both will automatically pick up the new image with no code changes required.

### Files to Modify
- `src/assets/hero-new-to-cdbl.jpg` — replaced with the new upload

### No Changes Needed
- `src/components/Hero.tsx` — import path stays the same
- `src/pages/NewToCDBL.tsx` — import path stays the same
