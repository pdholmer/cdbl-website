
## Consolidate to a Single Registration Page

### The Situation

There are two overlapping registration pages:

| Page | Route | Unique Content |
|---|---|---|
| `Registration.tsx` | `/registration` | Hero photo, In-House vs Travel comparison table, dynamic FAQs from database, "How to Register" steps |
| `InHouseRegistration.tsx` | `/in-house/registration` | "All Players Welcome" section with 3 feature cards (No Tryouts / All Skill Levels / Fair Play), 6 detailed FAQ cards (equipment list, volunteer requirements, refund policy, etc.) |

**Winner: `/registration`** — it is more complete, pulls live data from the database, and is the more broadly-linked page. The unique content from `/in-house/registration` (the "All Players Welcome" block and the 6 detailed FAQ cards) will be merged into it.

---

### Changes

**1. `src/pages/Registration.tsx` — Merge unique In-House content**
- Add the "All Players Welcome" section (3 feature cards: No Tryouts / All Skill Levels / Fair Play) between the comparison table and the FAQ section
- Replace the sparse fallback FAQ block with the 6 detailed FAQs from `InHouseRegistration.tsx` as the static fallback (equipment, refund policy, scholarships, volunteer requirements, sibling discounts, evaluations/draft dates) — these still show when the database FAQs are empty

**2. `src/App.tsx` — Remove the old route, add a redirect**
- Remove the `import InHouseRegistration` line
- Remove the `<Route path="/in-house/registration" ...>` route
- Add a redirect: `<Route path="/in-house/registration" element={<Navigate to="/registration" replace />} />` so any bookmarked or external links still work

**3. `src/components/DropdownNav.tsx` — Update link**
- Change the In-House dropdown "Registration" link from `/in-house/registration` → `/registration`

**4. `src/components/RegistrationSection.tsx` — Update link**
- Change the "Register for In-House" button from `/in-house/registration` → `/registration`

**5. `src/pages/InHouse.tsx` — Update sub-nav link**
- Change the Registration card in the sub-page nav grid from `/in-house/registration` → `/registration`

**6. Delete `src/pages/InHouseRegistration.tsx`**
- File is no longer needed once all links redirect to `/registration`

---

### Links Updated Across the Site

| File | Old link | New link |
|---|---|---|
| `DropdownNav.tsx` | `/in-house/registration` | `/registration` |
| `RegistrationSection.tsx` | `/in-house/registration` | `/registration` |
| `InHouse.tsx` | `/in-house/registration` | `/registration` |
| `App.tsx` | route `/in-house/registration` | redirect → `/registration` |

All other existing links to `/registration` (QuickActions, Footer, Teams, NewToCDBL, ChatAssistant) already point to the correct page and need no changes.

---

### Technical Notes
- `Navigate` from `react-router-dom` is already imported in the project pattern — no new dependencies needed
- The `InHouseRegistration.tsx` file is deleted entirely; the redirect in `App.tsx` handles any stale bookmarks or external links gracefully
- The merged `Registration.tsx` keeps all dynamic data hooks (`usePrograms`, `useFAQs`) and adds the static "All Players Welcome" block as a visually distinct section between the comparison table and FAQ
