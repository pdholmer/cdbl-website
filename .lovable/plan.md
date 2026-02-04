

# Customer Journey Improvement Plan

## Summary
This plan addresses 12 identified issues across the CDBL website to improve the customer journey, fix broken navigation, and make forms functional. The improvements are organized by priority with clear implementation steps.

---

## Phase 1: Critical Navigation Fixes (High Priority)

### 1.1 Fix Missing `/travel/registration` Route

**Problem**: The navigation menu links to `/travel/registration`, but this route doesn't exist in App.tsx.

**Solution**:
- The Travel.tsx page currently shows CTAs for "In-House Registration" which is confusing since it's a Travel program page
- Fix the CTAs on Travel.tsx to link to `/travel` tryout section (anchor link) instead of non-existent registration routes
- Update the DropdownNav.tsx link from `/travel/registration` to `/travel#tryouts`

**Files to modify**:
- `src/components/DropdownNav.tsx` (line 50)
- `src/pages/Travel.tsx` (lines 47-51, 254-256, 270-274)

### 1.2 Fix Confusing Travel Page CTAs

**Problem**: The Travel.tsx hero section has buttons that say "Register for In-House Season" and "Learn About In-House" which doesn't make sense on a Travel program page.

**Solution**:
- Change primary CTA to "Register for 2027 Tryouts" with anchor link to tryout section
- Change secondary CTA to "View Rockets Teams" linking to `/travel/teams`

**Files to modify**:
- `src/pages/Travel.tsx`

---

## Phase 2: Form Functionality (High Priority)

### 2.1 Make Contact Form Functional

**Problem**: The Contact page form only shows a toast message but doesn't save data or notify anyone.

**Solution**:
- Create a `contact_messages` database table to store submissions
- Create an edge function to handle form submission and optionally send email notification
- Update Contact.tsx to use controlled form fields and submit to the backend
- Add validation for required fields

**Database schema**:
```text
+---------------------------+
| contact_messages          |
+---------------------------+
| id (uuid, PK)            |
| name (text)              |
| email (text)             |
| phone (text, nullable)   |
| subject (text)           |
| message (text)           |
| status (text)            |
| created_at (timestamp)   |
| read_at (timestamp)      |
+---------------------------+
```

**Files to create/modify**:
- Create migration for `contact_messages` table
- `src/pages/Contact.tsx`

### 2.2 Make Volunteer Form Buttons Functional

**Problem**: All volunteer signup buttons on Volunteer.tsx are dead ends with no functionality.

**Solution**:
- Create a `volunteer_signups` database table
- Create VolunteerSignupModal component with interest form
- Wire all buttons to open the modal with pre-selected interest area
- Show success confirmation and save to database

**Database schema**:
```text
+---------------------------+
| volunteer_signups         |
+---------------------------+
| id (uuid, PK)            |
| name (text)              |
| email (text)             |
| phone (text, nullable)   |
| interest_areas (text[])  |
| experience (text)        |
| notes (text, nullable)   |
| status (text)            |
| created_at (timestamp)   |
+---------------------------+
```

**Files to create/modify**:
- Create migration for `volunteer_signups` table
- Create `src/components/VolunteerSignupModal.tsx`
- `src/pages/Volunteer.tsx`

---

## Phase 3: Shop Page Improvements (Medium Priority)

### 3.1 Fix Spirit Wear Button

**Problem**: The "Shop Spirit Wear" button (line 44-47) has no href and doesn't do anything.

**Solution**:
- Link to the actual Strawberry Creek Creations store (already referenced in Footer.tsx)
- Add proper external link handling

**Files to modify**:
- `src/pages/Shop.tsx`

### 3.2 Fix "Learn More" and "Contact Us" Buttons

**Problem**: The "Learn More" button for Fundraiser Items and "Request Custom Quote" / "Contact Us" buttons are non-functional.

**Solution**:
- "Learn More" should scroll to a fundraiser info section or link to Contact
- "Request Custom Quote" and "Contact Us" should link to Contact page with pre-filled subject

**Files to modify**:
- `src/pages/Shop.tsx`

---

## Phase 4: Homepage Content Rebalancing (Medium Priority)

### 4.1 Add In-House Registration Section

**Problem**: The homepage RegistrationSection only promotes Travel baseball, but most families (80%+) want In-House which is the recreational program.

**Solution**:
- Rename section to "Registration" (generic)
- Add side-by-side cards for In-House (primary, larger) and Travel (secondary)
- In-House card should emphasize: no tryouts, affordable, all skill levels, local games
- Travel card should emphasize: competitive, tryouts required, for experienced players

**Files to modify**:
- `src/components/RegistrationSection.tsx`

---

## Phase 5: User Experience Enhancements (Lower Priority)

### 5.1 Add Program Finder Quiz

**Problem**: New families don't know whether their child should join In-House or Travel.

**Solution**:
- Create a simple 4-question quiz modal accessible from homepage and New to CDBL page
- Questions: Age/birth year, Experience level, Commitment preference, Budget range
- Result shows recommended program with direct registration link

**Files to create**:
- `src/components/ProgramFinderModal.tsx`

**Files to modify**:
- `src/pages/Index.tsx`
- `src/pages/NewToCDBL.tsx`

### 5.2 Add Age-Based Division Calculator

**Problem**: Parents don't know which division their child belongs to.

**Solution**:
- Create a birth year input that calculates the appropriate division
- Show division details, schedule type, and cost
- Include direct link to register for that division

**Implementation**:
- Add to InHouseRegistration.tsx as a "Find Your Division" tool
- Use divisions data from usePrograms hook

**Files to modify**:
- `src/pages/InHouseRegistration.tsx`

---

## Phase 6: Admin Visibility (Lower Priority)

### 6.1 Admin Dashboard for Contact Messages

**Solution**:
- Add Contact Messages to admin sidebar
- Create admin page to view/manage contact submissions
- Allow marking messages as read/replied

**Files to create**:
- `src/pages/admin/ContactMessages.tsx`

**Files to modify**:
- `src/components/AdminSidebar.tsx`
- `src/App.tsx`

### 6.2 Admin Dashboard for Volunteer Signups

**Solution**:
- Add Volunteer Signups to admin sidebar
- Create admin page to view/manage volunteer interest forms

**Files to create**:
- `src/pages/admin/VolunteerSignups.tsx`

**Files to modify**:
- `src/components/AdminSidebar.tsx`
- `src/App.tsx`

---

## Implementation Order

| Step | Task | Complexity | Impact |
|------|------|------------|--------|
| 1 | Fix Travel.tsx CTAs and navigation links | Low | High |
| 2 | Create contact_messages table and fix Contact form | Medium | High |
| 3 | Create volunteer_signups table and signup modal | Medium | High |
| 4 | Fix Shop.tsx button links | Low | Medium |
| 5 | Rebalance RegistrationSection for In-House focus | Medium | High |
| 6 | Add Program Finder quiz | Medium | Medium |
| 7 | Add Division Calculator to registration | Low | Medium |
| 8 | Create admin pages for messages and volunteers | Medium | Low |

---

## Technical Notes

**Database Tables to Create**:
- `contact_messages` with RLS allowing public inserts, admin reads
- `volunteer_signups` with RLS allowing public inserts, admin reads

**Navigation Fixes Summary**:
- `/travel/registration` link should become `/travel#tryouts`
- Travel.tsx CTAs currently promote In-House (wrong program)
- Shop.tsx Spirit Wear button needs external link to Strawberry Creek store

**Forms to Wire Up**:
- Contact.tsx: name, email, phone, subject, message
- Volunteer.tsx: 8 different signup buttons all need modal with interest selection

