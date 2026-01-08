# Phase 2 Backend - Implementation Guide

## Overview

Phase 2 backend provides the foundation for future Wix+MyPTHub parity features including:
- Group management
- Workout tracking with detailed set logging
- Credit-based session booking system
- Recurring session support (schema ready, routes TBD)

**Important**: All Phase 2 features are behind a feature flag (`PHASE2_ENABLED`) and use `/api/v2/*` endpoints to ensure zero impact on the current live Phase 1 site.

## What Was Added

### 1. Database Schema (Migration 0013)

**New Tables:**
- `groups` - Client groups for bulk workout assignment
- `group_memberships` - Tracks which clients belong to which groups (with date ranges)
- `workout_assignments` - Assigns workouts to groups or individual clients
- `workout_sessions` - Records when a client performs a workout
- `workout_set_logs` - Detailed exercise tracking (reps, weight, rest, etc.)
- `session_types` - Credit-based session types (1-on-1, group class, etc.)
- `credit_purchases` - Transaction records for credit purchases (idempotent by provider_txn_id)

**Schema Extensions:**
- `sessions` table now has nullable columns for recurring session support:
  - `series_id` - Groups related recurring sessions
  - `recurrence_rule` - Stores recurrence pattern (e.g., "FREQ=WEEKLY;BYDAY=MO,WE,FR")
  - `is_exception` - Marks exceptions to recurring series (e.g., canceled instance)

### 2. TypeScript Types and Repositories

**Files:**
- `backend/src/phase2-types.ts` - TypeScript interfaces for all Phase 2 tables
- `backend/src/phase2-repositories.ts` - CRUD functions for Phase 2 data

**Key Features:**
- Application-level enforcement of non-overlapping group memberships
- Idempotent credit purchase creation (by `provider_txn_id`)
- Helper functions for active-only queries (e.g., current group members, active assignments)

### 3. Feature-Flagged API Routes

All routes are under `/api/v2/*` and return **404** when `PHASE2_ENABLED != "true"`.

**Admin Routes:**
- `POST /api/v2/admin/groups` - Create group
- `GET /api/v2/admin/groups` - List groups
- `GET /api/v2/admin/groups/:id` - Get group
- `PATCH /api/v2/admin/groups/:id` - Update group
- `POST /api/v2/admin/group-memberships` - Add member to group
- `GET /api/v2/admin/groups/:id/members` - List group members
- `DELETE /api/v2/admin/group-memberships/:id` - Remove member (soft delete)
- `POST /api/v2/admin/workout-assignments` - Assign workout to group or client
- `GET /api/v2/admin/workout-assignments` - List assignments (with filters)

**Client Routes:**
- `POST /api/v2/workout-sessions` - Start a workout session
- `GET /api/v2/workout-sessions/:id` - Get session details
- `GET /api/v2/my-workout-sessions` - List my sessions
- `POST /api/v2/workout-set-logs` - Log a set (reps, weight, rest)
- `GET /api/v2/workout-sessions/:id/set-logs` - Get all set logs for session
- `POST /api/v2/credit-purchases` - Record credit purchase (idempotent)
- `GET /api/v2/my-credit-purchases` - List my purchases

### 4. Test Script

**File:** `backend/test-phase2.js`

**Usage:**
```bash
node test-phase2.js <base_url> <admin_token>
```

**Example:**
```bash
# Local testing
node test-phase2.js http://localhost:8787 eyJhbGc...

# Production testing (with flag enabled)
node test-phase2.js https://backend.phelpskp.workers.dev eyJhbGc...
```

**Tests:**
1. Create/list/get/update groups
2. Add/remove group memberships
3. Assign workouts to groups/clients
4. Start workout sessions
5. Log sets with reps/weight/rest
6. Create credit purchases (idempotent)
7. List operations for all entities

## Deployment Steps

### Step 1: Apply Migration

The migration is already created but NOT applied. Apply it when ready:

```bash
cd backend
npx wrangler d1 migrations apply etaw_hub_db
```

### Step 2: Enable Feature Flag (When Ready)

**Local Development:**
Edit `backend/wrangler.jsonc`:
```json
"vars": {
  "PHASE2_ENABLED": "true"  // Change from "false"
}
```

**Production:**
```bash
cd backend
npx wrangler secret put PHASE2_ENABLED
# Enter: true
```

Or update via Cloudflare Dashboard:
- Workers & Pages → backend → Settings → Environment Variables
- Add/Edit `PHASE2_ENABLED` = `true`

### Step 3: Deploy Backend

```bash
cd backend
npm run deploy
```

### Step 4: Verify with Tests

```bash
# Get admin token from your login flow
node test-phase2.js https://backend.phelpskp.workers.dev <admin_token>
```

## Feature Flag Behavior

**When `PHASE2_ENABLED != "true"`:**
- All `/api/v2/*` endpoints return **404 Not Found**
- Migration is safe to apply (tables exist but unused)
- Zero impact on Phase 1 frontend/backend

**When `PHASE2_ENABLED = "true"`:**
- All `/api/v2/*` endpoints become active
- Admin and client can use Phase 2 features
- Phase 1 endpoints continue to work unchanged

## Architecture Notes

### Non-Overlapping Memberships

The `addGroupMembership` function enforces non-overlapping memberships per (client_id, group_id) at the **application level** (not via triggers):

```sql
SELECT id FROM group_memberships
WHERE group_id = ? AND client_id = ?
AND start_date <= ?
AND (end_date IS NULL OR end_date >= ?)
```

This allows a client to:
- Belong to the same group multiple times (non-overlapping date ranges)
- Belong to multiple different groups simultaneously

### Idempotent Credit Purchases

The `createCreditPurchase` function checks for existing `provider_txn_id` before inserting:

```javascript
const existing = await db.prepare('SELECT * FROM credit_purchases WHERE provider_txn_id = ?')
  .bind(providerTxnId)
  .first();

if (existing) {
  return existing; // Return existing record, don't create duplicate
}
```

This ensures Stripe/PayPal webhooks can be safely retried without duplicate charges.

### Recurring Sessions (Schema Only)

The `sessions` table now has columns for recurring sessions:
- `series_id` - Groups all instances of a recurring series
- `recurrence_rule` - Stores the recurrence pattern (iCalendar RRULE format)
- `is_exception` - Marks canceled/modified instances

**Note:** Routes for creating/managing recurring sessions are NOT implemented yet. This is schema-only scaffolding for future work.

## Security Model

**Admin-Only Routes:**
- All `/api/v2/admin/*` routes require `requireAdmin()` middleware
- Only users with `role = 'admin'` can access

**Client Routes:**
- All client routes require `requireAuth()` middleware
- Clients can only access their own data
- Admins can access all data

**Ownership Checks:**
- Workout sessions: verified by `client_id`
- Set logs: verified via session ownership
- Credit purchases: scoped to authenticated user

## Next Steps

### To Enable Phase 2 in Production:

1. **Test locally first:**
   - Set `PHASE2_ENABLED: "true"` in wrangler.jsonc
   - Run `npm run dev` in backend
   - Execute `node test-phase2.js http://localhost:8787 <token>`
   - Verify all tests pass

2. **Apply migration to production:**
   ```bash
   npx wrangler d1 migrations apply etaw_hub_db --remote
   ```

3. **Enable flag in production:**
   - Via Cloudflare Dashboard or `wrangler secret put`

4. **Deploy backend:**
   ```bash
   npm run deploy
   ```

5. **Run production tests:**
   ```bash
   node test-phase2.js https://backend.phelpskp.workers.dev <prod_token>
   ```

### Future Development:

- Build Phase 2 frontend (React components for groups, workout tracking)
- Implement recurring session creation/management routes
- Add session type management UI
- Create credit purchase integration with Stripe/PayPal
- Build group workout assignment UI for admins
- Create client workout tracking UI (log sets, view history)

## Files Changed

**Database:**
- `backend/migrations/0013_phase2_tables.sql` (new)

**Backend Code:**
- `backend/src/phase2-types.ts` (new)
- `backend/src/phase2-repositories.ts` (new)
- `backend/src/index.ts` (modified - added Phase 2 routes)
- `backend/wrangler.jsonc` (modified - added PHASE2_ENABLED var)

**Tests:**
- `backend/test-phase2.js` (new)

**Documentation:**
- `backend/PHASE2_README.md` (this file)

---

**Last Updated:** 2026-01-07
