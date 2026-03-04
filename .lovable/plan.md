

## Remove About Page Hero Background Image

**File: `src/pages/About.tsx`**

Remove the background image from the hero section's `style` prop. Replace the gradient-over-image with a solid background using the primary color (matching the site's blue). Remove the `heroAbout` import since it will no longer be used.

- Remove `import heroAbout` line
- Change the `style` prop from the gradient+image to a simple solid background: `backgroundColor: 'hsl(215, 100%, 26%)'` (or use Tailwind class `bg-primary` and remove the `style` prop entirely)

