

## Fix Admin Header — Mobile-Only with Branded Styling

**Problem**: The current header shows the CDBL logo (white-on-transparent) on a white background making it invisible, and on desktop it duplicates the logo already visible in the sidebar.

**Solution**: Make the header mobile-only and style it with the primary blue background so the white logo is visible and consistent with the sidebar branding.

### Changes — `src/components/AdminLayout.tsx`

1. **Hide header on desktop** — add `md:hidden` since the sidebar is always visible on desktop and provides navigation
2. **Style header with blue background** — use `bg-primary text-primary-foreground` so the white CDBL logo renders properly
3. **Style the SidebarTrigger** — ensure the hamburger icon is white on the blue bar
4. **Add "Admin" text label** next to the logo for context on mobile

Result: On mobile, users see a clean blue header bar with hamburger + logo. On desktop, no duplicate header — just the sidebar.

