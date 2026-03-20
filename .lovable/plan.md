

## Remove Registration from In-House Page (Bounce-Safe)

Replace all registration CTAs on `/in-house` with season-active alternatives, ensuring every button leads to engaging content rather than dead ends.

### Changes — `src/pages/InHouse.tsx`

**Hero section**
- "Register Now" button → "View Schedule" linking to `/in-house/schedule`
- Keep "View Teams" button as-is

**Navigation grid**
- Replace the "Registration" card (currently links to `/registration`) with a "Volunteer" card linking to `/volunteer` with desc "Help coach or support the league"

**"Register for In-House Baseball" button (below Season Overview)**
- Change to "View the Full Schedule" linking to `/in-house/schedule`

**CTA section at bottom**
- Heading: "Ready to Play Ball?" stays
- Body: "Registration is open now for the 2026 season!" → "The 2026 season is underway! Follow your team's schedule and get involved."
- "Register Today" button → "View Schedule" linking to `/schedule`
- "New to CDBL?" button stays (keeps users exploring)

Every replaced CTA points to an active, content-rich page — no dead ends.

