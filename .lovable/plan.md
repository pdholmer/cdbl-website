

## Make Montserrat the Site-Wide Font

Currently the tailwind config defines two font families:
- `font-sans` → Raleway (used for body/paragraph text)
- `font-heading` → Montserrat (used for headings)

To make Montserrat the only font used across the entire site:

### Changes

**File: `tailwind.config.ts`** — Update the `fontFamily.sans` value from `['Raleway', ...]` to `['Montserrat', 'system-ui', 'sans-serif']`. This makes Montserrat the default font for all text site-wide, since `font-sans` is what Tailwind applies to the `body` by default.

The `font-heading` entries scattered across components will continue to work (they already point to Montserrat), and all body/paragraph text previously in Raleway will now render in Montserrat too.

Optionally, the Google Fonts import in `index.html` can drop the Raleway family to save a network request, but it's not required for the visual change.

