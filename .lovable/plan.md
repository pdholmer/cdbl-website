
# Security & Accessibility Audit — What's Valid, What Isn't, and What We'll Fix

## Audit Results

### CONFIRMED VALID ISSUES (will fix)

**[CRITICAL] Admin Sign Up tab is publicly accessible**
Confirmed. `src/pages/admin/Login.tsx` has a full "Sign Up" tab visible to anyone. The `assign_first_user_admin` RPC call does soft-gate the admin role, but the tab still allows anyone to self-register an account. Fix: remove the Sign Up tab entirely. Admin user creation belongs in the protected Admin panel only.

**[HIGH] `user-scalable=no` in viewport meta tag**
Confirmed. `index.html` line 5 has `maximum-scale=1.0, user-scalable=no`. This is a real WCAG 2.1 violation. Fix: remove those two attributes.

**[MEDIUM] Floating FABs lack aria-labels**
Confirmed. `FeedbackFAB.tsx` has no `aria-label` on the button — only a `TooltipContent`. The `ChatAssistant.tsx` toggle button (MessageCircle icon) also needs to be checked for aria-label. Fix: add `aria-label` to both FAB buttons.

**[MEDIUM] Location inconsistency: Burlington vs Plato Center**
Confirmed. Footer (`Footer.tsx`) shows "Plato Center, IL" in two places. `About.tsx`, `AboutSection.tsx`, `Donate.tsx`, `Travel.tsx`, and `index.html` all say "Burlington, IL." The correct league address per the memory notes is **Plato Center, IL**. Fix: standardize to "Burlington & Plato Center, IL" across all user-facing text where a location is mentioned.

**[MEDIUM] Domain inconsistency: @cdbl.org vs @cdbaseball.org**
Confirmed. `TravelFAQ.tsx` uses `travel@cdbl.org` and `Teams.tsx` uses `coaches@cdbl.org`. All other references (Footer, Contact page, About) use `@cdbaseball.org`. Fix: update both `cdbl.org` email references to use `@cdbaseball.org`.

**[MEDIUM] Board member emails exposed on /contact**
Confirmed. `Contact.tsx` shows direct mailto links for president, VP, treasurer, and travel coordinator roles. This is an email harvesting risk. Fix: remove individual mailto links, replace with a note directing to the contact form.

---

### NOT ACTIONABLE / OUT OF SCOPE (will not implement)

**[HIGH] No CAPTCHA on any forms**
CAPTCHA (reCAPTCHA v3 or Cloudflare Turnstile) requires an external API key/account setup that the user needs to configure. Adding reCAPTCHA also requires a secret key in a backend function and a site key in the frontend. This is a larger integration outside this single pass — flagged for user to set up separately.

**[HIGH] No MFA on admin login**
Supabase's TOTP MFA is configured in the Supabase dashboard and requires auth flow changes. The existing login already has 5-attempt client-side lockout. Full TOTP MFA is a significant separate feature with enrollment flow, recovery codes, etc. This is out of scope for this pass but noted for future work.

**[HIGH] Multiple tap targets under 44px**
This requires a full accessibility audit across all pages. A blanket CSS utility class can be added (`min-h-[44px]`), but applying it selectively without visual regression across every button/link/control across 30+ pages is too broad for a single sweep. Flagged for targeted follow-up.

---

## Changes to Make

### 1. `index.html` — Fix viewport meta tag
Remove `maximum-scale=1.0, user-scalable=no` from the viewport meta tag.

### 2. `src/pages/admin/Login.tsx` — Remove Sign Up tab
Remove the "Sign Up" `TabsTrigger`, `TabsContent`, and all related `handleSignUp` logic. Replace the `Tabs` component with a simple sign-in-only form. Update the card description to reflect sign-in only. Leave a small note: "Need an account? Contact an administrator."

### 3. `src/components/feedback/FeedbackFAB.tsx` — Add aria-label
Add `aria-label="Submit feedback"` to the Button element.

### 4. `src/components/ChatAssistant.tsx` — Add aria-label to toggle button
Confirm and add `aria-label="Chat with CDBL Assistant"` to the open/close button.

### 5. `src/pages/Contact.tsx` — Replace board member email links
In the "Board Members & Key Contacts" section, remove the `mailto:` anchor tags for president, VP, treasurer, and travel coordinator. Replace with a note directing people to the contact form above, keeping names and titles visible but removing harvastable email addresses.

### 6. `src/pages/TravelFAQ.tsx` — Fix domain
Change `travel@cdbl.org` → `travel@cdbaseball.org`.

### 7. `src/pages/Teams.tsx` — Fix domain  
Change `coaches@cdbl.org` → `coaches@cdbaseball.org`.

### 8. Location standardization — "Burlington & Plato Center, IL"
Update location references across:
- `src/components/Footer.tsx` — two instances of "Plato Center, IL"
- `src/components/AboutSection.tsx` — "Burlington, IL"
- `src/pages/About.tsx` — "Burlington, IL"
- `src/pages/Donate.tsx` — "Burlington, IL"
- `index.html` — schema JSON "Burlington" and meta description "Burlington, IL"

Use consistent phrasing: **"Burlington & Plato Center, IL"** (or "Serving Burlington & Plato Center, IL" where more context is needed).

## Technical Notes
- No database migrations required for these changes
- No new dependencies required
- All changes are purely to existing source files
- The Sign Up removal does not disable Supabase auth signups globally — it only removes the public-facing UI entry point. Admin user creation flow should eventually be built into the protected Admin > Users panel.
