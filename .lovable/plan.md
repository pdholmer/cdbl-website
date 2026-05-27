## Problem

The `/travel/registration` route renders "Page Unavailable" with stale copy ("Registration for the 2026 season has closed…"). The page itself is fine — it was updated last turn to announce 2027 Travel Tryouts and Coach registration. It's the `page_visibility` row that's blocking it:

```
page_slug            | is_visible | hidden_message
travel-registration  |     f      | Registration for the 2026 season has closed…
```

`PageGate` reads this row and short-circuits to the unavailable screen before the real page renders.

## Fix

Update the `page_visibility` row for `travel-registration`:
- `is_visible` → `true`
- `hidden_message` → cleared

This is a one-row data update — no code, schema, or component changes needed. The Travel page hero, the announcement banner on `/registration`, and the tryout page CTAs we shipped last turn will then all reach a live page.

## Verification

After the update, hit `/travel/registration` and confirm the "Registration Open Now" hero with the two CTA buttons (Register for Tryouts / Travel Coach Registration) is what loads.
