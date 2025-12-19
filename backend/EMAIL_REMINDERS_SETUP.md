# Email Reminders Setup Guide

## Current Implementation Status

✅ **Complete**: Reminder logic, timing, de-duplication, atomic claims
✅ **Complete**: MailChannels Email API integration in `sendEmail()`
⚠️ **Configuration Required**: API key needed for actual email delivery

## Required Environment Variables

### Already Configured (in `wrangler.jsonc`)
- `EMAIL_FROM="noreply@etaw.com"` - Sender email address
- `EMAIL_FROM_NAME="Elite Training and Wellness"` - Display name
- `REMINDERS_DRY_RUN="true"` - Safe default (no emails sent)

### Needs Configuration (developer machine)

Add to `backend/.dev.vars` for local testing:

```bash
# Required for email sending
MAILCHANNELS_API_KEY=your_actual_mailchannels_api_key_here

# Optional - enable real sending (WARNING: sends actual emails)
# REMINDERS_DRY_RUN=false
```

**⚠️ IMPORTANT**:
- Never commit `.dev.vars` with real API keys
- Never set `REMINDERS_DRY_RUN=false` unless you want real emails sent every 5 minutes
- The `EMAIL_FROM` domain must be verified with MailChannels and have SPF records configured

## How It Works

### Reminder Window
- Finds sessions starting in **23-25 hours** (2-hour window)
- Runs every 5 minutes via cron trigger
- De-duplicates via `reminder_sends` table with UNIQUE(booking_id, reminder_type)

### Atomic Claim Flow
1. **INSERT** claim row with `ok=0, error=NULL`
2. If UNIQUE constraint fails → skip (already sent)
3. **Send email** via MailChannels API
4. **UPDATE** row with actual `ok=1/0` and `error` result

### Safe Defaults
- **Dry-run mode** (`REMINDERS_DRY_RUN=true`): Checks database, logs intent, **NO emails sent**
- **Real send mode** (`REMINDERS_DRY_RUN=false`): Sends actual emails, records results

---

## Testing Steps

### Step 1: Current Behavior (Without API Key)

**Test Command:**
```bash
cd backend
node test-reminder-dedup.js
```

**Expected Output:**
```json
{
  "count": 1,
  "results": [
    {
      "booking_id": "test-booking-sqlite-fmt",
      "session_id": "test-session-sqlite-fmt",
      "to": "admin@example.com",
      "ok": false,
      "error": "MAILCHANNELS_API_KEY not set",
      "already_sent": false
    }
  ]
}
```

**Cron Test:**
```bash
curl -X POST http://127.0.0.1:8787/cdn-cgi/handler/scheduled
```

**Expected Logs:**
```
REMINDER_CRON fired at 2025-12-18T14:26:53.058Z
Reminder window: 2025-12-19T13:26:53.058Z to 2025-12-19T15:26:53.058Z
Found 1 reminder target(s)
Sample targets:
  - Session test-session-sqlite-fmt at 2025-12-19 14:00:53 → admin@example.com
REMINDER_DRY_RUN session=test-session-sqlite-fmt to=admin@example.com starts_at=2025-12-19 14:00:53
```

---

### Step 2: With Valid API Key Configuration

**1. Add API Key to `.dev.vars`:**
```bash
# backend/.dev.vars
JWT_SECRET=dev-secret-change-me-please-1234567890
MAILCHANNELS_API_KEY=your_actual_mailchannels_api_key_here
```

**2. Restart Dev Server:**
```bash
# Stop current server (Ctrl+C)
npm run dev
```

**3. Test Preview Endpoint (Safe - max 10 emails):**
```bash
node test-reminder-dedup.js
```

**Expected Output with Valid API Key:**
```json
{
  "count": 1,
  "results": [
    {
      "booking_id": "test-booking-sqlite-fmt",
      "session_id": "test-session-sqlite-fmt",
      "to": "admin@example.com",
      "ok": true,
      "already_sent": false
    }
  ]
}
```

**4. Enable Real Sending in Cron (Optional):**

Add to `.dev.vars`:
```bash
REMINDERS_DRY_RUN=false
```

Restart server, then trigger cron:
```bash
curl -X POST http://127.0.0.1:8787/cdn-cgi/handler/scheduled
```

**Expected Logs with Real Sending:**
```
REMINDER_CRON fired at 2025-12-18T14:30:00.000Z
Reminder window: 2025-12-19T13:30:00.000Z to 2025-12-19T15:30:00.000Z
Found 1 reminder target(s)
Sample targets:
  - Session test-session-sqlite-fmt at 2025-12-19 14:00:53 → admin@example.com
REMINDER_SEND_OK session=test-session-sqlite-fmt to=admin@example.com
```

**Database Record:**
```sql
SELECT * FROM reminder_sends;
```
```json
{
  "id": "uuid-here",
  "booking_id": "test-booking-sqlite-fmt",
  "session_id": "test-session-sqlite-fmt",
  "user_id": 7,
  "reminder_type": "24h",
  "created_at": "2025-12-18T14:30:00.123Z",
  "ok": 1,
  "error": null
}
```

---

## Production Deployment

**DO NOT use `.dev.vars` in production.** Use wrangler secrets:

```bash
# Set API key as secret
npx wrangler secret put MAILCHANNELS_API_KEY --env production

# Update wrangler.jsonc production environment
# Change REMINDERS_DRY_RUN to "false" when ready to send real reminders
```

---

## Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| `MAILCHANNELS_API_KEY not set` | API key missing | Add to `.dev.vars` and restart server |
| `401 Unauthorized` | Invalid API key or domain not verified | Verify API key and domain with MailChannels |
| `403 Forbidden` | SPF records not configured | Add SPF record: `v=spf1 include:relay.mailchannels.net ~all` |
| `REMINDER_SKIP_ALREADY_SENT` | Already sent to this booking | Expected - UNIQUE constraint preventing duplicates |
| No targets found | No sessions in 23-25h window | Create test session or adjust window |

---

## Summary

**No Code Changes Required** - The system is fully implemented and ready to send emails.

**To Enable Email Sending:**
1. Add `MAILCHANNELS_API_KEY` to `backend/.dev.vars`
2. Restart dev server
3. Set `REMINDERS_DRY_RUN=false` (optional, for real sending)
4. Test with `node test-reminder-dedup.js` or trigger cron

**Safe Defaults:**
- Dry-run mode prevents accidental email sending
- Preview endpoint limits to 10 targets max
- Atomic claims prevent duplicate sends
- All failures are logged and recorded
