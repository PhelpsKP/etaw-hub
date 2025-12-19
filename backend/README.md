# ETAW Hub Backend

Cloudflare Workers backend for Elite Training and Wellness Hub.

## Email Configuration

The backend uses MailChannels Email API for sending transactional emails.

### Required Environment Variables

Set in `wrangler.jsonc` under `vars`:
- `EMAIL_FROM` - Sender email address (e.g., "noreply@etaw.com")
- `EMAIL_FROM_NAME` - Sender display name (e.g., "Elite Training and Wellness")

### Required Secrets

Set via wrangler secret command (DO NOT edit .dev.vars for secrets):
- `MAILCHANNELS_API_KEY` - MailChannels API authentication key

**Local development:**
```bash
npx wrangler secret put MAILCHANNELS_API_KEY
# Enter your API key when prompted
```

**Production:**
```bash
npx wrangler secret put MAILCHANNELS_API_KEY --env production
# Enter your API key when prompted
```

**Important:** Secrets are stored securely by wrangler and should never be added to `.dev.vars` or committed to version control.

### Email Domain Requirements

**Important:** The `EMAIL_FROM` domain must be:
1. Verified with MailChannels (domain ownership)
2. Configured with SPF DNS record: `v=spf1 include:relay.mailchannels.net ~all`
3. Authorized for sending via MailChannels Email API

Without proper domain setup, emails will be rejected by MailChannels (401 Authorization Required).

### Testing Email Sending

Dev-only endpoint (requires admin auth):
```bash
# Start the dev server
npm run dev

# In another terminal, run the test script
node test-email-send.js your-email@example.com
```

The test script will attempt to send a test email and report success/failure.

## Email Reminders Setup (Local)

Email reminders run via cron every 5 minutes in dev (configurable in `wrangler.jsonc`). By default, reminders run in **dry-run mode** (no emails sent) for safety.

### Required Configuration for Local Testing

1. **Get a MailChannels API Key** (if you don't have one):
   - Sign up at https://www.mailchannels.com/
   - Verify your domain and configure SPF records
   - Obtain your API key from the dashboard

2. **Add API Key to `.dev.vars`** (local dev only):
   ```bash
   # backend/.dev.vars
   JWT_SECRET=dev-secret-change-me-please-1234567890
   MAILCHANNELS_API_KEY=your_actual_mailchannels_api_key_here
   ```

3. **Configure Email Sender** (already in `wrangler.jsonc`):
   - `EMAIL_FROM` - Must be from your verified domain (e.g., "noreply@yourdomain.com")
   - `EMAIL_FROM_NAME` - Display name for emails

4. **Enable Real Sending** (optional, for testing):
   Add to `.dev.vars` only when you want to test actual email delivery:
   ```bash
   REMINDERS_DRY_RUN=false
   ```
   ⚠️ **WARNING**: With `REMINDERS_DRY_RUN=false`, the cron will send real emails every 5 minutes to anyone with a session ~24h out. Use carefully.

### Testing Email Reminders

**Safe test (dry-run, no emails sent):**
```bash
# Start dev server
npm run dev

# In another terminal, trigger cron manually
curl -X POST http://127.0.0.1:8787/cdn-cgi/handler/scheduled

# Check logs for: REMINDER_DRY_RUN lines
```

**Test with actual sending (requires API key):**
```bash
# 1. Ensure MAILCHANNELS_API_KEY is in .dev.vars
# 2. Ensure you have a test session ~24h out with a booking
# 3. Test via preview endpoint first (safer - sends to max 10 targets):

node test-reminders-preview.js

# Look for dryRun:false results with ok:true

# 4. If preview works, test cron with REMINDERS_DRY_RUN=false in .dev.vars:

curl -X POST http://127.0.0.1:8787/cdn-cgi/handler/scheduled

# Check logs for: REMINDER_SEND_OK or REMINDER_SEND_FAIL lines
```

### Production Deployment

For production, use wrangler secrets (NOT .dev.vars):
```bash
# Set API key as secret
npx wrangler secret put MAILCHANNELS_API_KEY --env production

# Update wrangler.jsonc for production
# Set REMINDERS_DRY_RUN to "false" in production vars when ready
```

### Troubleshooting

- **"MAILCHANNELS_API_KEY not set"**: Add the key to `.dev.vars`
- **401 Unauthorized**: Check API key is valid and domain is verified with MailChannels
- **403 Forbidden**: Verify SPF record is configured correctly
- **All reminders skipped**: Check `reminder_sends` table - may already be sent (UNIQUE constraint)
