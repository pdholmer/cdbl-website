

## Add Mobile-Friendly Admin Header

The sidebar component already renders as a slide-out sheet on mobile, but there is no `SidebarTrigger` button visible to open it. The fix is to add a sticky header bar inside `AdminLayout` that shows the hamburger/trigger and the CDBL logo.

### Changes — `src/components/AdminLayout.tsx`

1. Import `SidebarTrigger` from the sidebar UI components.
2. Import the sidebar logo asset.
3. Add a sticky header inside the layout (above `{children}`) containing:
   - `SidebarTrigger` (hamburger icon) — always visible but most critical on mobile
   - Small CDBL logo linking to `/admin`
4. Reduce main padding on mobile (`p-4 md:p-6`).

This is a single-file change. The sidebar already handles the mobile sheet behavior — we just need to expose the trigger.

