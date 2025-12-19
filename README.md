# PT Hub Lite

Lightweight custom training hub for Elite Training & Wellness.

---

## Local Development

### Prerequisites
- Node.js 18+ and npm
- Wrangler CLI: `npm install -g wrangler`

### Backend (Cloudflare Worker)

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Set required secrets (one-time setup):
   ```bash
   wrangler secret put JWT_SECRET
   # Enter a strong random secret (e.g., output of: openssl rand -base64 32)

   wrangler secret put MAILCHANNELS_API_KEY
   # Enter your MailChannels API key
   ```

3. Start local dev server:
   ```bash
   npm run dev
   ```
   Runs at: `http://127.0.0.1:8787`

### Frontend (React + Vite)

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. (Optional) Create `.env` file from template:
   ```bash
   cp .env.example .env
   ```
   Default API URL is already configured for local backend.

3. Start local dev server:
   ```bash
   npm run dev
   ```
   Runs at: `http://localhost:5173`

---

## Production Deployment (Cloudflare)

### Step 1: Deploy Backend (Worker)

1. Configure CORS for production frontend:
   ```bash
   cd backend
   ```
   Edit `wrangler.jsonc` and set `ALLOWED_ORIGINS`:
   ```json
   "vars": {
     "ALLOWED_ORIGINS": "https://your-app.pages.dev"
   }
   ```

2. Set production secrets (if not already set):
   ```bash
   wrangler secret put JWT_SECRET --env production
   wrangler secret put MAILCHANNELS_API_KEY --env production
   ```

3. Deploy to Cloudflare Workers:
   ```bash
   wrangler deploy
   ```
   Note the deployed Worker URL (e.g., `https://backend.your-subdomain.workers.dev`)

### Step 2: Deploy Frontend (Pages)

1. Build the frontend:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. Deploy to Cloudflare Pages:
   ```bash
   npx wrangler pages deploy dist --project-name=your-project-name
   ```
   Or connect your GitHub repo to Cloudflare Pages dashboard for auto-deploy.

3. **CRITICAL**: Set environment variable in Cloudflare Pages dashboard:
   - Navigate to: Pages project → Settings → Environment variables
   - Add: `VITE_API_BASE_URL` = `https://backend.your-subdomain.workers.dev`
   - Redeploy to apply the new environment variable

### Step 3: Update CORS

After deploying frontend, update backend CORS to allow the production frontend URL:

1. Edit `backend/wrangler.jsonc`:
   ```json
   "vars": {
     "ALLOWED_ORIGINS": "https://your-app.pages.dev,https://custom-domain.com"
   }
   ```

2. Redeploy backend:
   ```bash
   cd backend
   wrangler deploy
   ```

### Database Migrations

Run migrations against production D1 database:
```bash
cd backend
wrangler d1 execute etaw_hub_db --file=migrations/0001_initial.sql
wrangler d1 execute etaw_hub_db --file=migrations/0002_class_types.sql
# ... continue for all migration files
```

---

## Tech Stack

**Frontend:**
- React 18
- Vite 7
- React Router 7
- TypeScript

**Backend:**
- Cloudflare Workers
- D1 Database (SQLite)
- TypeScript

**Tooling:**
- npm
- Wrangler CLI

---

## Environment Variables

### Frontend (`.env`)
See `frontend/.env.example` for all variables.
- `VITE_API_BASE_URL` - Backend API URL (required for production)

### Backend (Cloudflare Worker)
See `backend/.env.example` for all variables.

**Secrets** (set via `wrangler secret put`):
- `JWT_SECRET` - JWT signing secret
- `MAILCHANNELS_API_KEY` - Email service API key

**Variables** (set in `wrangler.jsonc`):
- `ALLOWED_ORIGINS` - Comma-separated frontend URLs for CORS
- `EMAIL_FROM` - Sender email address
- `EMAIL_FROM_NAME` - Sender display name
- `REMINDERS_DRY_RUN` - Set to "true" to disable sending emails (dev/staging)