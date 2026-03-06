

## Page Visibility Management System

Add the ability for admins and board members to toggle public-facing pages on/off, with an optional message explaining why a page is unavailable.

### Database

**New table: `page_visibility`**

| Column | Type | Default |
|--------|------|---------|
| id | uuid | gen_random_uuid() |
| page_slug | text (unique) | required |
| page_label | text | required |
| is_visible | boolean | true |
| hidden_message | text | null |
| hidden_by | uuid | null |
| hidden_at | timestamptz | null |
| updated_at | timestamptz | now() |

RLS policies:
- Public SELECT (everyone needs to check visibility)
- Board members (admin + board_member) can UPDATE
- Admin-only INSERT/DELETE

Seed the table with all current public pages (registration, travel, in-house, schedule, fields, shop, volunteer, etc.) so admins have something to toggle immediately.

### Admin UI Changes

**File: `src/pages/admin/SiteContent.tsx`** — Add a "Page Visibility" tab

Add a tabbed layout at the top: **Content** | **Page Visibility**

The Page Visibility tab shows a card-based list of all pages:
- Each card shows: page label, page path, current status (visible/hidden badge)
- A Switch toggle for instant visibility changes
- An expandable "hidden message" textarea that appears when toggled off (e.g., "Registration opens January 15")
- Board members can access this tab (route changes from `requireAdmin` to `requireBoardMember`)

### Frontend Enforcement

**New hook: `src/hooks/usePageVisibility.ts`**
- Fetches all rows from `page_visibility`
- Exports a `useIsPageVisible(slug)` check and the full list

**New component: `src/components/PageGate.tsx`**
- Wraps public page content
- Checks visibility via the hook
- If hidden, renders a branded "Page Unavailable" message with the optional `hidden_message` text and a "Go Home" button
- If visible, renders children normally

**File: `src/App.tsx`** — Wrap applicable public routes with `<PageGate slug="registration">` etc.

Example:
```text
<Route path="/registration" element={
  <PageGate slug="registration"><Registration /></PageGate>
} />
```

### Navigation Filtering

**Files: `src/components/DropdownNav.tsx`, `src/components/Header.tsx` (mobile nav)**
- Import the visibility hook
- Filter out hidden pages from nav links so they don't appear in menus at all

### Route Access Changes

**File: `src/App.tsx`** — Change the site-content routes from `requireAdmin` to `requireBoardMember` so board members can manage page visibility.

### Pages to seed (initial data)

| Slug | Label |
|------|-------|
| registration | Registration |
| travel | Travel Program |
| travel-registration | Travel Tryouts & Registration |
| travel-faq | Travel FAQ |
| in-house | In-House Program |
| in-house-teams | In-House Teams |
| in-house-schedule | In-House Schedule |
| in-house-rules | In-House Rules |
| schedule | Season Schedule |
| fields | Fields & Facilities |
| shop | Spirit Wear Shop |
| volunteer | Volunteer |
| donate | Donate |
| sponsors | Sponsors |
| contact | Contact Us |
| about | About CDBL |
| board | Board Info |
| new-to-cdbl | New to CDBL |
| rules | Rules & Policies |

All default to `is_visible: true`.

