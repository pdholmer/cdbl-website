
# Onboarding Workflow Audit & UX Improvement Plan

## Executive Summary
Testing the site as a new user reveals several dead ends, broken links, unclear pathways, and missing guidance that could frustrate first-time visitors. This plan addresses **15 issues** across navigation, forms, and content clarity to ensure users understand how to navigate and take action with confidence.

---

## Critical Issues Identified

### Category A: Broken Navigation Links (High Priority)

#### Issue 1: Mobile Menu Has Broken `/travel/registration` Link
**Location**: `src/components/Header.tsx` (line 176-177)
**Problem**: The mobile menu still links to `/travel/registration` which was never created as a route. Desktop navigation was fixed previously but mobile was missed.
**User Impact**: Mobile users clicking "Tryouts & Registration" get a 404 error.
**Fix**: Change link from `/travel/registration` to `/travel#tryouts` to match the desktop navigation.

---

### Category B: Missing Guidance for New Users (Medium-High Priority)

#### Issue 2: No Clear "Start Here" Path on Homepage
**Location**: Homepage hero carousel (`src/components/Hero.tsx`)
**Problem**: The carousel rotates through 5 slides, but none directly addresses the #1 question: "I'm new - where do I start?" The "New to CDBL?" page exists but isn't prominently featured.
**User Impact**: New users may miss the orientation content and feel overwhelmed.
**Fix**: Add a dedicated "Start Here" slide or persistent "New? Start Here" button visible on all carousel slides.

#### Issue 3: No Visual Indicator of Current Registration Status on Homepage
**Location**: Hero carousel registration slide (`src/components/Hero.tsx`)
**Problem**: The hero says "2026 Registration" but doesn't show if registration is currently OPEN or CLOSED. The RegistrationSection shows dynamic badges but the hero doesn't.
**User Impact**: Users don't immediately know if action is needed now or later.
**Fix**: Add dynamic "REGISTRATION OPEN" badge to the hero registration slide, similar to the RegistrationSection cards.

#### Issue 4: "New to CDBL?" Page Lacks Division Finder Tool
**Location**: `src/pages/NewToCDBL.tsx`
**Problem**: Parents reading the timeline want to know which division their child belongs to, but there's no tool to calculate this from birth year.
**User Impact**: Parents have to navigate elsewhere or guess.
**Fix**: Add a simple birth year input that calculates and displays the appropriate division with direct registration link.

---

### Category C: Unclear Call-to-Action Destinations (Medium Priority)

#### Issue 5: Multiple Registration Paths Create Confusion
**Problem**: The site has 4+ ways to reach registration:
- Homepage RegistrationSection links to `/in-house/registration`
- Hero carousel links to `/registration`
- InHouse.tsx hero links to external SportsConnect
- NewToCDBL.tsx links to `/registration`

All paths eventually lead to the same external SportsConnect portal, but users may wonder if they're in the right place.
**User Impact**: Users second-guess their path and may abandon.
**Fix**: Create a consistent "Register Now" component that explains the external redirect before sending users to SportsConnect. Add a visual confirmation step.

#### Issue 6: External Links Lack "Leaving Site" Indicators
**Locations**: Multiple pages (Registration, InHouse, Travel, Shop)
**Problem**: Links to SportsConnect, Strawberry Creek Creations, and Wilson Store open in new tabs but don't clearly indicate users are leaving CDBL.
**User Impact**: Users may feel lost when landing on a completely different site.
**Fix**: Add "(external link)" text or an icon, and consider a brief modal explaining "You're about to register through our partner SportsConnect" before redirecting.

---

### Category D: Dead End Pages & Missing Content (Medium Priority)

#### Issue 7: `/rules` Page Exists But Not Clearly Accessible
**Location**: `src/pages/Rules.tsx` (referenced in Footer and Teams page)
**Problem**: The main Rules page isn't in the primary navigation. Users looking for rules must find it via footer or indirect links.
**User Impact**: Users searching for rules may not find them easily.
**Fix**: Add "Rules & Policies" to the In-House Program dropdown or create a consolidated "Resources" section in navigation.

#### Issue 8: Generic `/teams` Page Duplicates Content
**Location**: `src/pages/Teams.tsx`
**Problem**: There are 3 teams-related pages:
- `/teams` - General overview with tabs
- `/in-house/teams` - In-House specific
- `/travel/teams` - Travel specific

The generic `/teams` page mostly repeats content from the program-specific pages.
**User Impact**: Users may land here from the Footer and be confused about which tab applies.
**Fix**: Consider redirecting `/teams` to a landing page that immediately offers a choice between In-House and Travel, or consolidate into the program-specific pages only.

#### Issue 9: Schedule Page Has No Team Data Populated
**Location**: `src/pages/Schedule.tsx`
**Problem**: The "Find My Team" modal works correctly, but if no games/events are in the database for that team, users see an empty state.
**User Impact**: Users may think the feature is broken rather than understanding the season hasn't started.
**Fix**: Add clearer messaging: "No scheduled events for [Team Name] yet. The 2026 season schedule will be posted by March 2026."

---

### Category E: Form & Interaction Improvements (Medium Priority)

#### Issue 10: Contact Form Success State Could Be Clearer
**Location**: `src/pages/Contact.tsx`
**Problem**: After submission, only a toast appears briefly. Users may miss it and wonder if their message was sent.
**User Impact**: Uncertainty about whether contact was successful.
**Fix**: Replace form with success message card showing "Message Sent!" with expected response time.

#### Issue 11: Volunteer Modal Has No Confirmation Summary
**Location**: `src/components/VolunteerSignupModal.tsx`
**Problem**: After successful signup, users only see a toast. No confirmation of what they signed up for.
**User Impact**: Users can't verify their submission.
**Fix**: Add a confirmation step showing selected interests before final submit, then display a success card.

---

### Category F: Navigation & Information Architecture (Lower Priority)

#### Issue 12: Footer Has Duplicate "Schedule" and "Calendar" Links
**Location**: `src/components/Footer.tsx` (lines 48-60)
**Problem**: Both "Schedule" and "Calendar" link to the same `/schedule` page.
**User Impact**: Minor confusion about whether these are different pages.
**Fix**: Remove the duplicate "Calendar" link or differentiate functionality.

#### Issue 13: Search Feature Could Be More Helpful
**Location**: `src/components/SearchTray.tsx`
**Problem**: The search tray exists but results may not cover all user intents (e.g., "when does registration open").
**User Impact**: Users may not find answers to common questions.
**Fix**: Enhance search index to include FAQ content and common queries with direct action links.

#### Issue 14: No "Quick Start" Guide for Returning Users
**Problem**: Returning users who know the site still have to navigate through programs. There's no "returning family" shortcut.
**User Impact**: Experienced users waste time.
**Fix**: Add a "Returning Family? Sign in for quick access" prompt on registration pages.

#### Issue 15: Mobile Navigation Chevrons Don't Animate Properly
**Location**: `src/components/Header.tsx` (lines 142, 167, 192, 214)
**Problem**: The chevrons have `[&[data-state=open]]:rotate-180` but Collapsible may not set this attribute.
**User Impact**: Visual feedback for expanded/collapsed state may not work.
**Fix**: Test and fix chevron rotation animation on mobile menu collapsibles.

---

## Implementation Phases

### Phase 1: Critical Bug Fixes (Immediate)
| Task | File | Complexity |
|------|------|------------|
| Fix mobile `/travel/registration` broken link | `Header.tsx` | Low |
| Add clearer empty state messaging on Schedule | `Schedule.tsx` | Low |
| Remove duplicate Footer calendar link | `Footer.tsx` | Low |

### Phase 2: User Clarity Improvements
| Task | File | Complexity |
|------|------|------------|
| Add "New? Start Here" persistent CTA to Hero | `Hero.tsx` | Medium |
| Add dynamic registration status to Hero slide | `Hero.tsx` | Medium |
| Create division finder on NewToCDBL page | `NewToCDBL.tsx` | Medium |
| Improve Contact form success state | `Contact.tsx` | Low |
| Improve Volunteer modal confirmation | `VolunteerSignupModal.tsx` | Low |

### Phase 3: Navigation Optimization
| Task | File | Complexity |
|------|------|------------|
| Consolidate or differentiate `/teams` page | `Teams.tsx`, `App.tsx` | Medium |
| Add "Rules" to navigation dropdown | `DropdownNav.tsx` | Low |
| Add external link indicators | Multiple | Low |

---

## Technical Implementation Notes

**Header.tsx Mobile Menu Fix (Line 176-177):**
```text
Current:  <Link to="/travel/registration">Tryouts & Registration</Link>
Fixed:    <Link to="/travel#tryouts">Tryouts & Registration</Link>
```

**Hero.tsx New User CTA:**
Add persistent floating badge or dedicated carousel slide:
```text
Position: Overlaid on all carousel slides or as dedicated first slide
Content: "New to CDBL? Start your journey here"
Link: /new-to-cdbl
```

**Division Finder Logic (NewToCDBL.tsx):**
```text
Input: Birth year (2010-2022)
Logic:
  - 2020-2022 (ages 4-6) -> T-Ball
  - 2018-2019 (ages 7-8) -> Pinto
  - 2016-2017 (ages 9-10) -> Bronco
  - 2014-2015 (ages 11-12) -> Pony
  - 2012-2013 (ages 13-14) -> Colt
Output: Division name with description and registration link
```

---

## Success Metrics

After implementation, a new user should be able to:
1. Understand within 10 seconds that CDBL offers youth baseball programs
2. Identify whether In-House or Travel is right for them within 30 seconds
3. Find the correct division for their child within 1 minute
4. Complete registration (reach SportsConnect) within 2 minutes
5. Never encounter a 404 error or dead-end button

