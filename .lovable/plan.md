

# Fix Game Schedule Carousel Image

## Problem
The AI-generated "Game Schedule" hero image (`src/assets/hero-schedule.jpg`) has an artifact where the batter appears to be missing an arm.

## Solution
Regenerate just the `hero-schedule.jpg` image using the AI image generation model with an improved prompt that emphasizes correct anatomy -- specifically ensuring the batter has both arms visible and properly holding the bat.

## Steps

1. **Regenerate the image** using `google/gemini-2.5-flash-image` with a refined prompt:
   - "A realistic action photograph of a youth baseball game. A young batter (age 10) stands at home plate in a proper batting stance, both hands gripping the bat, both arms clearly visible. The batter wears a carolina blue jersey with white 'Rockets' script text, white baseball pants with thin blue piping, a carolina blue batting helmet, and blue batting gloves. A catcher crouches behind the plate. Green baseball diamond, blue sky, sunny day. Dynamic sports photography, shallow depth of field, 16:9 aspect ratio, ultra high resolution."
   - Key change: explicit instruction for "both hands gripping the bat, both arms clearly visible"

2. **Save the regenerated image** to `src/assets/hero-schedule.jpg`, replacing the current file.

3. No code changes needed in `Hero.tsx` since it already references this file path.

## Technical Details
- Will use the edge function or direct generation to produce the image
- If the first generation still has anatomy issues, will retry with an alternate composition (e.g., a wider shot or different pose)
- The prompt upgrades to `google/gemini-3-pro-image-preview` if the flash model continues producing artifacts

