

## Reduce Bounce Rate — Implementation Plan

Based on the analytics, three targeted changes will have the most impact:

### 1. Convert Registration Page to "Registration Closed" Landing Page
**Why**: `/registration` is the 2nd most visited page (198 views). It's currently gated by PageGate which shows a dead-end "Page Unavailable" screen — guaranteed bounce. Instead, show useful content with onward links.

**File**: `src/pages/Registration.tsx`
- Replace the hero text: "2026 Registration is Closed" with season dates context
- Remove the "Start Registration" button and "How to Register" steps
- Keep the program comparison table, FAQ, and "All Players Welcome" sections (useful content)
- Add prominent CTAs: "View Schedule", "View Teams", "Volunteer" to guide users forward

**File**: `src/components/PageGate.tsx`  
- Add next-step links below "Go Home" button — e.g., "View Schedule", "View Teams" — so even the generic gate page offers onward navigation

**Database**: Update `page_visibility` for `registration` slug — set `is_visible = true` and update `hidden_message`. The page itself will communicate that registration is closed while keeping users engaged.

### 2. Add Cross-Links to High-Traffic Pages
**Why**: Pages-per-visit is 1.85. Users land and leave. Adding "next step" CTAs keeps them moving.

**File**: `src/components/RegistrationSection.tsx` (homepage)
- Add a small "View Schedule →" or "See Upcoming Games →" link below the program cards to bridge users into deeper content

### 3. Improve Mobile Above-the-Fold CTAs
**Why**: 66% of traffic is mobile. The hero carousel auto-rotates but CTAs may not be immediately tapped.

**File**: `src/components/Hero.tsx`
- Make the primary CTA buttons slightly larger on mobile (`text-base` instead of default)
- Add a subtle animation or pulse to the primary CTA on first load to draw attention

### Summary of Changes
| File | Change |
|------|--------|
| `src/pages/Registration.tsx` | Convert to "closed" landing page with forward links |
| `src/components/PageGate.tsx` | Add navigation links to the unavailable page |
| `src/components/RegistrationSection.tsx` | Add cross-link to schedule |
| `src/components/Hero.tsx` | Slightly larger mobile CTAs |
| Database migration | Re-enable registration page visibility |

