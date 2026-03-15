

## Take Down Registration Content

Registration is over, so we need to remove or replace registration-related content across the site. This involves both using the existing page visibility system and updating hardcoded content.

### 1. Hide registration pages via database

Update the `page_visibility` table to set `is_visible = false` for these slugs:
- `registration`
- `travel-registration`

This will automatically hide nav links (Header + DropdownNav already use `useHiddenSlugs`).

### 2. Update Hero carousel (`src/components/Hero.tsx`)

Remove the "2026 Registration" slide (index 1) since it advertises registration. Replace it with a season-focused slide, e.g. "2026 Season Underway" pointing to the schedule.

### 3. Update QuickActions (`src/components/QuickActions.tsx`)

Replace the "Register Now" action with something seasonally relevant like "View Teams" linking to `/teams` or "Volunteer" linking to `/volunteer`.

### 4. Update RegistrationSection on homepage (`src/components/RegistrationSection.tsx`)

Replace the "Register for In-House" buttons with "Learn More" or disable them with "Registration Closed" messaging. Remove the "OPEN NOW" badge logic. Update the card CTAs to point to informational pages rather than registration.

### 5. Update "New to CDBL?" slide text (`src/components/Hero.tsx`)

Change "get registered" wording in the subtitle to something like "learn about our programs" since registration is closed.

### Files to modify
- `src/components/Hero.tsx` — remove registration slide, update copy
- `src/components/QuickActions.tsx` — replace Register action
- `src/components/RegistrationSection.tsx` — update CTAs and badges
- Database migration to hide registration pages

