
## Update Registration Carousel Image

### What's Changing
Replace the current `hero-registration.png` asset with the newly uploaded desk/CDBL-branded photo (laptop, CDBL shirt, Cubs cap, team photo, 2026 calendar).

### Steps

**1. Copy the uploaded image to the assets folder**
- Copy `user-uploads://image-18.png` → `src/assets/hero-registration.png`
- This overwrites the previous file in place — no import change needed in `Hero.tsx` since the filename stays the same

### Files to Modify
- `src/assets/hero-registration.png` — overwrite with new image (no code changes needed)
