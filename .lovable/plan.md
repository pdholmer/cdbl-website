

## Fix Travel Card Button Style

The In-House card uses `variant="hero"` for its primary button (bold text with strong shadow), while the Travel card uses `variant="default"` (standard style). This creates a visual inconsistency.

### Change
**File: `src/components/RegistrationSection.tsx`** — Line 144: Change the Travel card's "View Tryout Info" button from `variant="default"` to `variant="hero"` to match the In-House card's button treatment.

