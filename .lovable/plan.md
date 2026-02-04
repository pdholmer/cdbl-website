# Customer Journey Improvement Plan

## Summary
This plan addresses 12 identified issues across the CDBL website to improve the customer journey, fix broken navigation, and make forms functional.

---

## Phase 1: Critical Navigation Fixes ✅ COMPLETED

### 1.1 Fix Missing `/travel/registration` Route ✅
- Updated DropdownNav.tsx link from `/travel/registration` to `/travel#tryouts`
- Added `id="tryouts"` to the Tryout Information section in Travel.tsx

### 1.2 Fix Confusing Travel Page CTAs ✅
- Changed hero CTAs to "Register for 2027 Tryouts" (anchor link) and "View Rockets Teams"
- Updated bottom CTA section to promote Travel-relevant actions

---

## Phase 2: Form Functionality ✅ COMPLETED

### 2.1 Make Contact Form Functional ✅
- Created `contact_messages` database table with RLS policies
- Updated Contact.tsx with controlled form fields and Supabase integration
- Added URL parameter support for pre-filled subjects (?subject=...)

### 2.2 Make Volunteer Form Buttons Functional ✅
- Created `volunteer_signups` database table with RLS policies
- Created VolunteerSignupModal component with interest checkboxes
- Wired all volunteer buttons to open modal with pre-selected interest

---

## Phase 3: Shop Page Improvements ✅ COMPLETED

### 3.1 Fix Spirit Wear Button ✅
- Linked to Strawberry Creek Creations store

### 3.2 Fix "Learn More" and "Contact Us" Buttons ✅
- All buttons now link to Contact page with appropriate pre-filled subjects

---

## Phase 4: Homepage Content Rebalancing ✅ COMPLETED

### 4.1 Rebalanced RegistrationSection ✅
- Renamed section to "Find Your Program"
- Added side-by-side cards: In-House (primary) and Travel (secondary)
- In-House emphasizes: all skill levels, no tryouts, local games
- Travel emphasizes: competitive, tryouts required, regional travel

---

## Phase 5: User Experience Enhancements (Future)

### 5.1 Add Program Finder Quiz
- Create a 4-question quiz modal for homepage and New to CDBL page
- Questions: Age/birth year, Experience level, Commitment preference, Budget

### 5.2 Add Age-Based Division Calculator
- Birth year input to calculate appropriate division
- Add to InHouseRegistration.tsx

---

## Phase 6: Admin Visibility (Future)

### 6.1 Admin Dashboard for Contact Messages
- Add to admin sidebar and create management page

### 6.2 Admin Dashboard for Volunteer Signups
- Add to admin sidebar and create management page
