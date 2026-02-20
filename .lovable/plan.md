
# New to CDBL Page — Audit Results & Plan

## Audit Findings

### VALID — Will Implement (with adjustments)

**[LOW] Birth year tool could be more interactive**
The current tool works but requires typing a 4-digit year into a text field and clicking a button. This friction is unnecessary. Fix: Convert the Input to a Select dropdown pre-populated with all valid birth years (2010–2022), so results appear instantly on selection change — no button press required. The result card and reset behavior remain the same.

The suggestion also asks to "deep-link to registration with division pre-selected." This is **not feasible** — the registration link goes to an external SportsConnect URL (`registration.bluesombrero.com`) that we don't control. The "Register for [Division]" CTA will continue to link to the `/registration` page, which is the correct behavior.

**[LOW] Add a printable PDF checklist**
Valid — new parents genuinely benefit from a take-away reference sheet. However, generating a real PDF requires adding a third-party library (`jsPDF`, `html2canvas`, etc.) which adds bundle weight for a low-priority feature.

Better approach: A **print-optimized checklist page** using CSS `@media print`. A "Print Checklist" button on the New to CDBL page calls `window.print()`, which triggers the browser's native print dialog (users can save as PDF from there). Print styles hide the header, footer, nav, and FABs, and render only the checklist content cleanly. Zero new dependencies, works on every device and browser, and users can still save as PDF.

---

### NOT VALID / NOT FEASIBLE — Will Not Implement

Nothing is being skipped outright — both suggestions are valid in intent, only the implementation approach is adjusted as noted above.

---

## Changes to Make

### 1. `src/components/DivisionFinder.tsx` — Dropdown + instant results

Replace the `Input` + button layout with a `Select` dropdown that:
- Lists all valid birth years from 2022 down to 2010 as options (labels like "2018 — Ages 7-8 (Pinto)")
- Triggers `getDivisionFromBirthYear` instantly on `onValueChange` — no button needed
- Shows the result card immediately below
- Keeps the "Try Another Year" reset button
- Removes the manual `handleSearch`, `handleKeyDown`, and error states since all options are pre-validated
- Removes the now-redundant `Input`, `Search` icon import, and "Find Division" button

The result card layout (schedule, cost, description, register CTA) stays exactly as-is.

### 2. `src/pages/NewToCDBL.tsx` — Add Print Checklist button + print styles

Add a "Print Getting Started Checklist" button with a `Printer` icon near the top of the page (below the hero, above the Division Finder). Clicking it calls `window.print()`.

Add inline print CSS (via a `<style>` tag injected with a `useEffect`, or a dedicated print stylesheet imported in the component) that:
- Hides: `<header>`, `<footer>`, `.feedback-fab`, `.chat-assistant`, and all sections except a dedicated `#print-checklist` div
- Shows a clean black-and-white checklist layout with:
  - CDBL logo header
  - "2026 Getting Started Checklist" title
  - Key dates (Registration deadline: Dec 1 early pricing; Evaluations: Mar 8-9; Draft: Mar 15; Opening Day: April 2026)
  - Equipment list (from the "What to Expect" section)
  - Volunteer duties reminder
  - Key contact: Communications@cdbaseball.org
  - Website URL

The `#print-checklist` div is hidden on screen (`hidden print:block`) and only visible when printing.

## Files to Modify
- `src/components/DivisionFinder.tsx` — Replace Input+button with Select dropdown, instant results
- `src/pages/NewToCDBL.tsx` — Add print button + hidden print-only checklist div

## New Files
None — print styles will use Tailwind's `print:` variant and a small `<style>` block.

## Not Changing
- Registration deep-linking — not feasible (external SportsConnect URL)
- The result card layout, CTA text, or division data — those are correct as-is
