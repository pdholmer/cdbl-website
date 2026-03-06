

## Mark All Fields as Closed

This is a simple data update — all 9 venue_fields records currently have `status: 'open'` and need to be set to `closed`.

### Change

Run a single SQL update against the `venue_fields` table:

```sql
UPDATE venue_fields SET status = 'closed', updated_at = now();
```

This will update all 9 fields across all venues. The Fields page will automatically show the "Field Status Alert" banner and each field card will display a red "Closed" badge.

No code changes needed — the UI already handles the `closed` status rendering.

