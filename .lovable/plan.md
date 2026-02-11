

# Re-apply User-Uploaded Hero Carousel Images

## Problem
Three user-provided photos for the hero carousel (Game Schedule, Shop Rockets Gear, and Volunteer With Us) are not displaying correctly. The AI-generated versions may still be in place despite previous replacement attempts.

## Solution
Re-save all three user-uploaded images to their correct asset paths, ensuring the files are properly overwritten. No code changes are needed since `Hero.tsx` already references the correct file paths.

## Steps

1. **Replace Game Schedule image** -- Copy the user-uploaded game schedule photo to `src/assets/hero-schedule.jpg`, overwriting the existing file.

2. **Replace Shop Rockets Gear image** -- Copy the user-uploaded shop/gear photo to `src/assets/hero-shop-gear.jpg`, overwriting the existing file.

3. **Replace Volunteer With Us image** -- Copy the user-uploaded volunteer photo to `src/assets/hero-volunteer.jpg`, overwriting the existing file.

4. **Verify in preview** -- Confirm all three carousel slides display the correct user-provided photos.

## Note
The user will need to re-upload the three images when approving this plan, as the previous uploads may no longer be available. The images should be provided for:
- Game Schedule slide
- Shop Rockets Gear slide
- Volunteer With Us slide

## Technical Details
- No code changes required; `Hero.tsx` already imports from the correct paths (`hero-schedule.jpg`, `hero-shop-gear.jpg`, `hero-volunteer.jpg`)
- Vite may cache old images; a dev server restart or hard refresh may be needed after replacement
- All images are used as CSS `background-image` via inline styles

