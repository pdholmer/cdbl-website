# Night Game Builder — visual-only design change

## Two things to settle first

1. **"Saved per user" touches the database or sign-in data.** Saving the Light / Dark / Device choice to the user's account means either a new profile column (database) or writing to the account's sign-in record (auth). Both are on your stop list. Recommendation: save the choice **on the device** instead. It still remembers each person's choice on their phone or iPad, and it needs no database or sign-in change. If you want it to follow the person to every device, that becomes a separate database step you approve on its own.
2. **There is no Account page yet.** No route exists for one. Options: (a) add a small "Appearance" section to the family header menu and the admin sidebar, or (b) build a minimal `/account` page that only holds this choice. Recommendation: (b), signed-in only, holding nothing else for now.

## What changes

**Fonts.** Load Big Shoulders Display (800, 900), Barlow Semi Condensed (500, 600, 700) and Barlow (400–700) from Google Fonts. Tailwind families become `display`, `label`, `sans`. Montserrat stays loaded for public pages until Stage 3. The seal artwork is an image and is not touched.

**Colors.** Light and dark values exactly as you listed, written as HSL tokens. Primary CDBL Blue #003DA5, destructive #B3261E, plus new `success`, `warning` (dark text #2A1A00), `seal-navy`, `seal-black` and `illinois-mist` tokens in both modes.

**Signed-in pages only.** Household, two-step screens, training, coach and admin get a wrapper class (`ngb`). Inside it:
- the new fonts, colors, radius and flat cards apply
- carolina, silver, rocket, MLB and gold colors, the four gradients and the two glow shadows are replaced with neutral or primary values
- public pages keep today's look, and no old tokens are deleted until Stage 3

**Shape.** Cards 12px, buttons and chips pill-shaped, inputs 10px.

**Cards.** No drop shadows. Separation comes from surface color and a 1px border.

**Mode.** The site follows the device setting by default. The Light / Dark / Device choice adds or removes the existing `dark` class. A tiny script in the page head applies it before first paint, so there's no flash.

## Not touched

No database, auth, payments, RLS, data or page logic. The seal and wordmark images are not recolored, cropped, redrawn or filtered.

## Technical details

- `index.html`: add the three font families. Keep Montserrat for now. Add an inline pre-paint script that reads `localStorage.cdbl-theme` (light | dark | system) and sets `.dark` on `<html>`.
- `src/index.css`: add the new tokens under `:root` and `.dark`, scoped through a `.ngb` layer that also overrides `--radius`, `--shadow-card`, `--gradient-*` and `--carolina-blue`. The global legacy tokens stay unchanged for public pages.
- `tailwind.config.ts`: add `fontFamily.display/label/sans`, colors `success`, `warning`, `seal.navy`, `seal.black`, `mist`, and radius `card` 12px, `input` 10px, `pill` 9999px.
- New `src/lib/theme.ts` plus a `useTheme` hook that listens for `prefers-color-scheme` changes. New `src/pages/Account.tsx` holding the appearance choice. Route `/account`, linked from FamilyHeader and the admin sidebar.
- Apply `.ngb` on the signed-in layouts: Household, TwoStep*, Training, coach and admin layouts. Swap the classes that point at the removed tokens in those files only (about 25 files reference them in total; only the signed-in ones change).
- Check at 390, 768 and 1440 in light and dark, and confirm no horizontal overflow and 44px touch targets.
- Undo: revert these files. Nothing is stored server-side.
