

## Fix: Print Checklist Is Blank

### Root Cause
The print stylesheet in `src/index.css` hides `body > #root > div > main` entirely. The `#print-checklist` div lives **inside** `<main>`, so even though it has `display: block !important`, it's invisible because its parent is hidden.

### Solution
Instead of hiding `<main>` entirely, hide only its child `<section>` elements (the visible page sections) while leaving `<main>` itself visible so the `#print-checklist` div can render.

### Changes

**File: `src/index.css`** (1 line change)
- Replace `body > #root > div > main` with `body > #root > div > main > section` in the print media query hide rule. This hides each section within main but keeps `<main>` itself visible, allowing `#print-checklist` (a `<div>`) to show through.

