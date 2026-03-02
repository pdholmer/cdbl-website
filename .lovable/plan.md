

## Fix: Feedback Submission Fails for Anonymous Users

### Root Cause
The `useSubmitFeedback` hook chains `.select().single()` after the insert:
```typescript
const { data, error } = await supabase
  .from('platform_feedback')
  .insert({...})
  .select()
  .single();
```

The INSERT succeeds (RLS policy: `WITH CHECK (true)`), but the `.select().single()` requires a matching SELECT policy. The only SELECT policies are:
- `Admins can view all feedback` — requires admin role
- `Users can view their own feedback` — uses `auth.uid() = user_id`, which fails when both are null (`NULL = NULL` → false in SQL)

So the insert goes through but the response triggers an error, which the mutation treats as a failure.

### Fix (two-part)

**1. Database migration** — Add a SELECT policy allowing users to read rows where `submitter_email` matches, or simpler: allow selecting rows that were just inserted by adding a policy for anonymous reads of own submissions. The cleanest fix is to just remove the `.select().single()` from the anonymous path, since we don't actually need the returned data for screenshot upload when the user isn't authenticated.

**2. File: `src/hooks/useFeedback.ts`** — Update `useSubmitFeedback` to handle the anonymous case:
- When no user is authenticated, perform a plain `.insert()` without `.select().single()` (we don't need the returned row for anonymous users since screenshot upload and AI prompt generation both require auth anyway)
- When a user IS authenticated, keep the current `.select().single()` flow

### Code Change Detail

In `useSubmitFeedback` mutation function:
```typescript
// Get current user (may be null)
const { data: { user } } = await supabase.auth.getUser();

const insertPayload = {
  ...feedback,
  user_id: user?.id || null,
};

if (user) {
  // Authenticated: insert + select (for screenshot/prompt)
  const { data, error } = await supabase
    .from('platform_feedback')
    .insert(insertPayload)
    .select()
    .single();
  if (error) throw error;
  // ... handle screenshot upload and AI prompt
  return data;
} else {
  // Anonymous: insert only (no select needed)
  const { error } = await supabase
    .from('platform_feedback')
    .insert(insertPayload);
  if (error) throw error;
  return null;
}
```

Then guard the screenshot upload and AI prompt blocks with `if (feedbackData)` — which is already the case in the current code, so anonymous submissions will skip those steps gracefully.

### Scope
- 1 file modified: `src/hooks/useFeedback.ts`
- No database migration needed — the INSERT policy is fine, we just stop requesting a SELECT on anonymous inserts

