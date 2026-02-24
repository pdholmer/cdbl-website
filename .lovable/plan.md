

## Fix: Feedback Status Changes Not Persisting

### Problem
In `FeedbackDetailSlider.tsx`, the state synchronization logic (lines 48-52) runs during every render and compares local state against the `feedback` prop. When a user changes the status dropdown, the new local value differs from the prop, triggering the sync logic to reset it back immediately. The user's selection is reverted before they can click "Save Changes."

### Solution
Replace the inline state-reset logic with a proper `useEffect` that only syncs local state when a **different feedback item** is selected (keyed on `feedback.id`), not on every render.

### Technical Details

**File: `src/components/feedback/FeedbackDetailSlider.tsx`**

1. Add `useEffect` to the import from React (line 1)
2. Remove the broken inline sync block (lines 48-52)
3. Add a `useEffect` keyed on `feedback?.id`:

```tsx
useEffect(() => {
  if (feedback) {
    setStatus(feedback.status);
    setPriority(feedback.priority || '');
    setAdminNotes(feedback.admin_notes || '');
  }
}, [feedback?.id]);
```

This ensures state resets only when opening a different feedback item, not when the user interacts with the form controls.

### Scope
- 1 file modified: `src/components/feedback/FeedbackDetailSlider.tsx`
- No database or backend changes needed

