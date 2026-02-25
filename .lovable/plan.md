

## Allow Anonymous Feedback with Email Tracking

### Problem
The feedback system currently requires sign-in before submitting. The `platform_feedback` table enforces a non-null `user_id` and the RLS INSERT policy requires `auth.uid() = user_id`, blocking unauthenticated users entirely.

### Solution
Make `user_id` optional, add a `submitter_email` column, update RLS to allow anonymous inserts, and replace the auth gate in the UI with a simple email field.

### Technical Details

**Database Migration**
1. Make `user_id` nullable on `platform_feedback`
2. Add `submitter_email TEXT` column
3. Replace the INSERT RLS policy: change from `auth.uid() = user_id` to `true` (allow anyone to insert)
4. Keep admin SELECT/UPDATE/DELETE policies unchanged

**File: `src/components/feedback/FeedbackSlider.tsx`**
- Remove the auth check logic (`user`, `isCheckingAuth`, `onAuthStateChange`)
- Remove the `FeedbackAuthPrompt` import and conditional render — always show the form
- Add an `email` field to the zod schema (required, valid email)
- Add an email input field to the form UI
- Pass the email to the submit mutation

**File: `src/hooks/useFeedback.ts`**
- Update `FeedbackInsert` interface to include `submitter_email: string`
- In `useSubmitFeedback`, remove the `getUser()` / auth check
- If user is logged in, still attach `user_id`; if not, set `user_id` to null
- Include `submitter_email` in the insert payload
- Skip screenshot upload for unauthenticated users (storage requires auth) — or attempt it and fail gracefully (already has try/catch)
- Skip AI prompt generation for anonymous submissions (edge function requires JWT) — or keep the try/catch as-is

**File: `src/components/feedback/FeedbackDetailSlider.tsx`** (admin view)
- Display `submitter_email` in the detail view, falling back to the profile email when `user_id` is present

**File: `src/components/feedback/FeedbackTable.tsx`** (admin table)
- Update the "Submitted By" column to show `submitter_email` when no profile is joined

**File: `src/hooks/useFeedback.ts` — `useAllFeedback`**
- Handle nullable `user_id` in the profiles join (skip null IDs)

### Scope
- 1 database migration (alter `platform_feedback`, update RLS)
- 4 files modified: `FeedbackSlider.tsx`, `useFeedback.ts`, `FeedbackTable.tsx`, `FeedbackDetailSlider.tsx`
- `FeedbackAuthPrompt.tsx` becomes unused (can be removed)

