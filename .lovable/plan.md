

# Generate Branded Carousel Lifestyle Images

## Overview
Use the Lovable AI image generation model (`google/gemini-2.5-flash-image`) to create 6 new lifestyle images for the hero carousel. Each image will feature youth baseball players wearing the Rockets branding (carolina blue/navy jerseys, white pants with blue piping, blue caps) in scenes relevant to each slide's content.

## Approach
Create an edge function that generates each image via the AI image generation API, uploads the result to file storage, then update the Hero component to reference the new images from storage instead of the static assets.

## Image Prompts (6 images)

| Slide | Prompt Description |
|-------|--------------------|
| **New to CDBL?** | A welcoming scene of a parent and young child (age 5-6) arriving at a youth baseball field for the first time, child wearing a carolina blue baseball jersey with white "Rockets" script, blue cap, carrying a small glove, bright sunny day, green grass field |
| **Find Your Program** | Two groups of youth baseball players on a field - one group in light carolina blue jerseys, another in dark navy blue jerseys with white "Rockets" text, both wearing white pants with blue piping and blue caps, practicing together |
| **2026 Registration** | A smiling youth baseball player (age 8-9) in a carolina blue jersey with number on back, white pants, blue belt, holding a clipboard or tablet, standing at a registration table at a baseball field, welcoming atmosphere |
| **Game Schedule** | An action shot of a youth baseball game in progress - batter at plate wearing carolina blue "Rockets" jersey and white pants, catcher behind, umpire, green field, scoreboard in background, sunny day |
| **Shop Rockets Gear** | A display of youth baseball merchandise - carolina blue and navy jerseys laid out, blue caps, a navy pinstripe hoodie with "Rockets" logo, blue backpack, arranged attractively on a table or rack |
| **Volunteer With Us** | An adult coach in a navy blue polo/quarter-zip with "Rockets" branding coaching a group of young players in carolina blue jerseys on a baseball field, teaching batting stance, warm community feel |

## Implementation Steps

### Step 1: Create Image Generation Edge Function
- Create `supabase/functions/generate-hero-images/index.ts`
- For each of the 6 slides, call the `google/gemini-2.5-flash-image` model with a detailed prompt
- Upload each generated image to a storage bucket called `hero-images`
- Return the public URLs

### Step 2: Create Storage Bucket
- Create a `hero-images` public storage bucket via migration

### Step 3: Run the Edge Function
- Call the function to generate and store all 6 images
- Verify the generated images look good

### Step 4: Update Hero Component
- Replace static asset imports with the storage bucket URLs
- Keep the static assets as fallbacks in case storage is unavailable

## Technical Notes
- The `LOVABLE_API_KEY` secret is already configured, which is needed for the AI gateway
- Images will be stored in a public bucket so they load fast without auth
- Using `gemini-2.5-flash-image` for speed; can upgrade to `gemini-3-pro-image-preview` if quality isn't sufficient
- Each image generation is independent so they can be generated sequentially in one function call
- Generated base64 images will be decoded and uploaded as `.png` files to storage

