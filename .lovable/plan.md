
# In-House Page — Audit Review & Implementation Plan

## Audit Findings

### VALID — Will Implement

**[Navigation] Add sub-page navigation links to `/in-house` overview page**
Valid. The In-House dropdown has 4 sub-pages beyond Overview: Teams & Divisions, Registration, Schedule, and Rules & FAQ. A user landing on `/in-house` from a Google search or direct link has no on-page path to those sub-pages without going back to the nav dropdown. Fix: Add a "Explore the Program" section directly below the hero — a 4-card grid linking to each sub-page with a short description. No content is duplicated; this is purely wayfinding.

**[CRITICAL] Pony division price shows bare `$`**
Confirmed. Database query reveals the Pony division (`id: 177da936`) has `cost: null` and `season_length: null`. The current rendering code does `${division.cost}` which outputs `$` with no number when cost is null.

Fix: Add a null guard in the fee display. When `division.cost` is null or undefined, show `"TBD — Contact registrar@cdbaseball.org"` instead of `$null`. No database change needed — the display logic just needs the null check.

**[MEDIUM] Fee table not responsive on mobile**
Valid. The current layout uses simple `flex justify-between` rows, which work on desktop but can get cramped on mobile when division names are long (e.g., "T-Ball (Ages 4-6 years)"). Fix: Convert the Registration Fees card to a card-based layout. On mobile (`< md`), each division gets its own mini-card with the division name, age range, and fee stacked vertically. On desktop, keep the existing horizontal list layout. The "Register" button per card is skipped since all divisions share the same external registration URL — a single CTA below the grid is cleaner.

---

### NOT VALID — Will Not Implement

Nothing is being skipped. All three items are valid.

---

## Changes to Make

### 1. `src/pages/InHouse.tsx` — Add sub-page navigation grid

Add a new section immediately after the closing `</section>` tag of the hero, before "Why Choose In-House Baseball?":

A 4-card grid titled "Explore the Program" (or no heading — just a clean nav strip) with cards for:
- **Teams & Divisions** → `/in-house/teams` — "See all divisions and meet your team"
- **Registration** → `/in-house/registration` — "Register your player for 2026"  
- **Schedule** → `/in-house/schedule` — "View game dates and times"
- **Rules & FAQ** → `/in-house/rules` — "Division rules and common questions"

Cards use `Link` from react-router-dom, show an icon + label + description, and have a subtle hover state (`hover:border-primary`). 2-column grid on mobile, 4-column on `md+`. This section has a light background to visually separate it from the hero.

### 2. `src/pages/InHouse.tsx` — Fix Pony division null cost + mobile-responsive fee layout

Two changes to the "Registration Fees" card:

**Null guard fix**: Change the fee display from:
```tsx
<span className="font-bold text-primary">${division.cost}</span>
```
to:
```tsx
<span className="font-bold text-primary">
  {division.cost != null ? `$${division.cost}` : 'TBD — Contact registrar@cdbaseball.org'}
</span>
```

**Mobile-responsive layout**: Replace the single `flex justify-between` list with a responsive design:
- **Mobile (`< md`)**: CSS grid, 1-column, each division is a card with name (bold), age range (muted), fee (primary color, large), and stacked layout
- **Desktop (`md+`)**: Keep the existing horizontal `flex justify-between` row style

The implementation uses a single responsive grid — `grid grid-cols-1 md:grid-cols-1` with card items that use `flex-col` on mobile and `flex-row justify-between` on desktop using responsive classes.

## Files to Modify
- `src/pages/InHouse.tsx` — (1) Add sub-page nav grid section, (2) Fix null cost display, (3) Make fee layout mobile-responsive

## New Files
None.

## Not Changing
- Database — Pony cost stays null in the DB; display logic handles it gracefully
- `DropdownNav.tsx` / `Header.tsx` — Sub-page nav already exists in the header dropdown
- Any sub-pages themselves
