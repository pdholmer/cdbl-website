
# Homepage Content & UX Improvements — Audit Results & Plan

## Audit Findings

### VALID — Will Fix

**[HIGH] Mission statement and Core Values duplicated on /about**
Confirmed. `AboutSection.tsx` (rendered on the homepage) contains a full "Welcome to CDBL" mission statement and a complete 4-card "Our Core Values" section with a Safety highlight. These are also in `About.tsx` verbatim. Fix: Replace `AboutSection` with a slim 2-sentence teaser + "Learn More About CDBL" CTA linking to `/about`. The Safety highlight and core values cards stay on the About page only.

**[MEDIUM] Stats repeated (38 years, 400+ players)**
Confirmed. The `RegistrationSection` value props show "400+ players and families in the Burlington area." The `About.tsx` page has a dedicated "By The Numbers" grid with all four stats. Fix: Rephrase the homepage value prop copy to remove the stat — e.g., change "400+ players and families" to "A welcoming community of players and families."

**[MEDIUM] Hero carousel has 6 slides — too many**
Confirmed. `Hero.tsx` defines 6 slides. Fix: Reduce to 3 highest-priority slides: (1) New to CDBL?, (2) 2026 Registration, (3) Game Schedule. Remove Find Your Program, Shop Rockets Gear, and Volunteer slides. Add dot progress indicators and pause-on-hover behavior.

**[MEDIUM] Sponsor section shows placeholder names**
Confirmed. `SponsorsSection.tsx` has a hardcoded array of 6 placeholder sponsors. Fix: Remove the placeholder sponsor grid entirely. Display only the "Become a Sponsor" CTA panel. The heading changes to "Support CDBL" and a brief description explains why sponsorship matters.

**[LOW] Quick-action cards for mobile users**
Valid improvement. Nothing like this exists. Fix: Add a `QuickActions` section below the Hero with 4 cards: Register Now, View Schedule, Find a Field, Contact Us. 2×2 grid on mobile, 4-column on desktop. Min 44px tap targets throughout.

---

### NOT VALID / ALREADY WORKS — Will Not Fix

**[LOW] #contact anchor link likely broken**
Not valid. Inspecting the code: `Footer.tsx` already has `id="contact"` on the `<footer>` element (line 7). The `SponsorsSection` "Get in Touch →" link using `href="#contact"` will correctly scroll to the footer on the same page. No fix needed.

---

## Changes to Make

### 1. `src/components/AboutSection.tsx` — Replace with slim teaser
Replace the full mission + core values + safety content with a compact section containing:
- A 2-sentence mission teaser
- A "Learn More About CDBL →" button linking to `/about`
- A simple stat strip: "38 Years · 400+ Players · 50+ Teams · 100+ Volunteers" as a horizontal banner (not a full grid)

This cuts ~100 lines down to ~30, and the full content lives exclusively on `/about`.

### 2. `src/components/RegistrationSection.tsx` — Remove stat from value prop
Change the "Community First" card text from "400+ players and families in the Burlington area" to "A welcoming community of players and families" to avoid stat duplication with the About page.

### 3. `src/components/Hero.tsx` — Reduce to 3 slides + add dots + pause-on-hover
Keep slides 1, 3, 4 (New to CDBL, 2026 Registration, Game Schedule). Remove slides 2, 5, 6 (Find Your Program, Shop Rockets Gear, Volunteer). Add:
- Dot indicators (progress dots) at the bottom of the carousel
- `stopOnInteraction: false` + `stopOnMouseEnter: true` for pause-on-hover behavior via the Autoplay plugin

### 4. `src/components/SponsorsSection.tsx` — Remove placeholders, show CTA only
Remove the 6 placeholder sponsor cards and the mapping loop. Show only the "Become a Sponsor" CTA panel, centered. Rename the section heading to "Support CDBL." Keep the heart icon.

### 5. `src/pages/Index.tsx` + new `src/components/QuickActions.tsx` — Add mobile quick-action grid
Create a new `QuickActions` component with 4 tap-friendly cards:
- Register Now → `/registration`
- View Schedule → `/schedule`  
- Find a Field → `/fields`
- Contact Us → `/contact`

Cards use large icons, bold labels, and `min-h-[88px]` with `min-w-[44px]` for accessibility. On mobile: 2×2 CSS grid. On desktop: single 4-column row. Place it in `Index.tsx` immediately after `<Hero />`.

## Files to Modify
- `src/components/Hero.tsx` — Slide reduction + dots + pause-on-hover
- `src/components/AboutSection.tsx` — Replace with slim teaser
- `src/components/RegistrationSection.tsx` — Remove stat duplication
- `src/components/SponsorsSection.tsx` — Remove placeholders
- `src/pages/Index.tsx` — Add QuickActions import

## New File
- `src/components/QuickActions.tsx` — New mobile-first quick-action grid

## Not Changing
- `src/components/Footer.tsx` — `id="contact"` already works correctly
- `src/pages/About.tsx` — All full content stays here as intended
