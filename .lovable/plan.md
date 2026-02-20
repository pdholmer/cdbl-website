
## Make In-House and Travel Hero Sections Match the Home Page

The home page hero carousel slides use a specific set of styles that are missing or inconsistent on the two program pages. The fix is purely cosmetic — matching class names and structure, no logic changes.

### What the Home Page Hero Has (the standard)

```text
- min-h: [320px / 360px / 420px / 480px] responsive
- py-16 md:py-24
- backgroundImage: gradient overlay on image
- container > max-w-3xl wrapper
- H1: text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight
- Subtitle: text-base sm:text-lg md:text-xl opacity-95
- Subtitle 2 (italic): text-base sm:text-lg md:text-xl opacity-80 italic
- Primary CTA: bg-white text-primary hover:bg-white/90 shadow-lg font-semibold
- Secondary CTA: border-2 border-white bg-transparent text-white hover:bg-white hover:text-carolina font-semibold
```

### What's Different on the Program Pages

**In-House (`/in-house`)**
- Missing `min-h` classes — hero has no minimum height, so it collapses on large screens compared to the home page
- Only one subtitle line (no `subtitle2` italic line) — minor, but the structure differs
- `relative z-10` is on the `container` but the section itself is missing it compared to home page structure
- H1 font sizes match ✓, button styles match ✓

**Travel (`/travel`)**
- Missing `min-h` classes — same collapse issue
- Missing `max-w-3xl` content wrapper — text runs full width on large screens
- H1 only has `text-4xl md:text-6xl`, missing the `sm:` and `lg:` breakpoints and `leading-tight`
- Subtitle text has different structure: a short tagline + a separate `<p>` for description — needs to match the two-line subtitle pattern with `opacity-95` and `opacity-80 italic`
- The `flex items-center` on the section is missing — home page vertically centers content

### Changes

**`src/pages/InHouse.tsx`** — Hero section only
- Add `min-h-[320px] sm:min-h-[360px] md:min-h-[420px] lg:min-h-[480px] flex items-center` to the `<section>` class
- Add a second subtitle line: `"No tryouts. No cuts. Just baseball."` styled with `opacity-80 italic` to match the home page two-line pattern

**`src/pages/Travel.tsx`** — Hero section only
- Add `min-h-[320px] sm:min-h-[360px] md:min-h-[420px] lg:min-h-[480px] flex items-center` to the `<section>` class
- Wrap content in `<div className="max-w-3xl">` to constrain width like the home page
- Update H1 to `text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight`
- Restructure the tagline + description into two subtitle lines:
  - Line 1 (`opacity-95`): `"Elite travel baseball building the pipeline to Burlington Central High School and beyond."`
  - Line 2 (`opacity-80 italic`): `"Tryouts required. Ages 8–14."`

### Files to Modify
- `src/pages/InHouse.tsx` — Add min-height, flex centering, second subtitle line
- `src/pages/Travel.tsx` — Add min-height, flex centering, max-w-3xl wrapper, updated H1 sizing, restructured subtitles

### Files Not Changing
- `src/components/Hero.tsx` — Already correct, this is the reference
- The sub-page navigation grids, body content, and CTA sections on both pages remain untouched
