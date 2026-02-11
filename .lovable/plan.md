

# PDF Annotation Changes Implementation Plan

## Summary
Implement all 16 changes identified from the annotated PDF across registration fees, URLs, content, and contact information.

---

## Change 1: Update SportsConnect Registration URL
**All occurrences** of the old URL `https://leagues.bluesombrero.com/Default.aspx?tabid=2121019` need to change to:
`https://registration.bluesombrero.com/84830/program-questions/preview/80130405`

**Files affected:**
- `src/pages/InHouseRegistration.tsx` (lines 24, 226)
- `src/pages/Registration.tsx` (lines 35, 291)
- `src/components/Footer.tsx` (line 134)

Also update `src/pages/InHouse.tsx` line 42 URL (`tabid=2121025`) to the new URL.

---

## Change 2: Update In-House Registration Fees
Update the hardcoded fees in `src/pages/InHouseRegistration.tsx` (lines 58-62):

| Division | Old Fee | New Fee |
|----------|---------|---------|
| T-Ball (Ages 4-6) | $75 | $195 |
| Pinto (Ages 7-8) | $95 | $250 |
| Mustang (Ages 9-10) | $115 (was "Bronco") | $275 |
| Bronco (Ages 11-12) | $135 (was "Pony") | $290 |
| Pony (Ages 13-14) | $155 (was "Colt") | $335 |

Note: Division names shift -- "Mustang" replaces what was previously labeled "Bronco" at ages 9-10, "Bronco" moves to ages 11-12, and "Pony" moves to ages 13-14. The "Colt" division is removed.

---

## Change 3: Update DivisionFinder Component
Update `src/components/DivisionFinder.tsx` to match the new division names and fees:

| Birth Year Range | Division | New Fee |
|-----------------|----------|---------|
| Ages 4-6 | T-Ball | $195 |
| Ages 7-8 | Pinto | $250 |
| Ages 9-10 | Mustang | $275 |
| Ages 11-12 | Bronco | $290 |
| Ages 13-14 | Pony | $335 |

---

## Change 4: Update Comparison Table on Registration Page
In `src/pages/Registration.tsx` (lines 149-163):
- Change In-House fee range from `$75-$155` to `$195-$335`
- Change Travel fee from `~$600 per season + tournament fees` to `~$600/season + tournaments`
- Change season length from `April - June/July (12-16 games)` to `March - August`
- Change Travel tryout dates from `March 8-9, 2026` to `July 2026`

---

## Change 5: Remove "Is Travel Right for My Child?" Section
Remove the entire section in `src/pages/Registration.tsx` (lines 188-202) that starts with "Is Travel Right for My Child?" -- this content belongs on the Travel page, not the In-House registration flow.

---

## Change 6: Update Travel Tryout Timing
In `src/pages/Travel.tsx` line 168, the tryout timing already says "July 2026" which is correct. No change needed here.

---

## Change 7: Update Equipment Requirements
In `src/pages/Travel.tsx` (lines 180-187), add "Baseball pants" to the "What to Bring" list and add a note that bats are available.

In `src/pages/NewToCDBL.tsx` (lines 115-122), add "Baseball pants" to the equipment list.

In `src/pages/InHouseRegistration.tsx` (lines 153-154), update equipment FAQ to mention pants.

---

## Change 8: Add "New Website" Registration Note
Add a note to the "How to Register" sections on both `InHouseRegistration.tsx` and `Registration.tsx` at Step 2 ("Create or Log In"):
"Important: Due to our new website, ALL users must create a new account -- even if you registered with CDBL before."

---

## Change 9: Update Footer Location
In `src/components/Footer.tsx`:
- Line 17: Change "Burlington, IL" to "Plato Center, IL"
- Line 111: Change "Burlington, IL" to "Plato Center, IL"

---

## Change 10: Update Footer Email
In `src/components/Footer.tsx`:
- Line 115-116: Change `info@cdbaseball.org` to `Communications@cdbaseball.org`

---

## Change 11: Update Footer Phone
In `src/components/Footer.tsx`:
- Lines 119-122: Change from "Contact via registration portal" to actual phone number `847-531-3237`
- Make it a clickable `tel:` link

---

## Change 12: Update Contact Page Email & Phone
In `src/pages/Contact.tsx`:
- Line 57: Update error fallback email from `info@cdbaseball.org` to `Communications@cdbaseball.org`
- Lines 198-203: Update email card from `info@cdbaseball.org` to `Communications@cdbaseball.org`
- Lines 218-220: Update phone from `(555) 123-4567` to `847-531-3237`
- Update "Field Hotline" label to just "Phone"

---

## Change 13: Update Contact Page Location
In `src/pages/Contact.tsx`:
- Line 246: Change "Burlington, IL 60109" to "Plato Center, IL"

---

## Change 14: Update InHouse Page Fee Range
In `src/pages/InHouse.tsx`:
- Line 79: Change `$75-$155` to `$195-$335`

---

## Change 15: Update NewToCDBL Communication Section
In `src/pages/NewToCDBL.tsx`:
- Line 249: Change `info@cdbl.org` to `Communications@cdbaseball.org`

---

## Change 16: Update InHouseRegistration FAQ
In `src/pages/InHouseRegistration.tsx`:
- Line 127: Update treasurer contact from `treasurer@cdbl.org or (555) 123-4567` to `treasurer@cdbaseball.org or 847-531-3237`

---

## Files Modified (Summary)

| File | Changes |
|------|---------|
| `src/pages/InHouseRegistration.tsx` | URL, fees, division names, equipment FAQ, treasurer contact, new account note |
| `src/pages/Registration.tsx` | URL, comparison table fees/dates, remove "Is Travel Right" section, new account note |
| `src/components/DivisionFinder.tsx` | Division names and fees |
| `src/components/Footer.tsx` | Location, email, phone |
| `src/pages/Contact.tsx` | Email, phone, location |
| `src/pages/InHouse.tsx` | URL, fee range |
| `src/pages/NewToCDBL.tsx` | Email, equipment list |
| `src/pages/Travel.tsx` | Equipment list |

