

## Link Public Schedule to Admin Schedule

Add a contextual "Manage Schedule" button on the public `/schedule` page that links to `/admin/schedule`. This should only be visible to authenticated users with admin or board_member roles.

### Changes — `src/pages/Schedule.tsx`

1. Import `Link` (already imported), `useSession` or equivalent auth check, and a settings/edit icon.
2. Add a small "Manage Schedule" button near the page title area (top of the Interactive Schedule section, next to the heading) that links to `/admin/schedule`.
3. Conditionally render it only for users with admin/board_member roles — check using the existing `has_role` pattern or a simple auth session check. If role-checking infrastructure isn't readily available on the public side, show the link to any authenticated user (admins will naturally be logged in; non-admins hitting the admin route will be stopped by `ProtectedRoute`).

Single file change: `src/pages/Schedule.tsx`.

