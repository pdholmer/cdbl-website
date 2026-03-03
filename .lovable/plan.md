

## Match Card Description Character Counts

**Target**: 157 characters (the Travel card description).

**Travel card** (lines 118-121): Already matches — no change needed.

**In-House card** (lines 50-52): Currently 173 characters. Needs to be trimmed to ~157 characters.

### Change
**File: `src/components/RegistrationSection.tsx`** — Lines 50-52: Replace the In-House description with a shorter version matching 157 characters, e.g.:

`"Our recreational league is perfect for players of all skill levels. No tryouts required — just fun, skill-building, and friends on the diamond."`

This trims from 173 to ~143... Better option at exactly ~157:

`"Our recreational league welcomes players of all skill levels. No tryouts required — just fun, skill-building, and making friends while learning the game."`

(155 chars — close match to Travel's 157.)

