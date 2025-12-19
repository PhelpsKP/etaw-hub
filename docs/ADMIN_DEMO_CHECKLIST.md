# Admin Demo Checklist

## Overview
This is a step-by-step demo script for the ETAW Hub admin interface. Follow these steps in order for a complete end-to-end demonstration of all admin functionality.

**Prerequisites:**
- Backend dev server running: `cd backend && npm run dev`
- Frontend dev server running: `cd frontend && npm run dev`
- Database migrated and seeded with initial data

---

## Setup & Reset Steps

### 1. Create Admin User
```bash
cd backend
npx wrangler d1 execute etaw_hub_db --local --command "
INSERT INTO users (email, password_hash, role, created_at)
VALUES (
  'admin@etaw.com',
  '\$2a\$10\$dummyhash',
  'admin',
  datetime('now')
) ON CONFLICT(email) DO UPDATE SET role='admin';
"
```

### 2. Create Test Client User
```bash
npx wrangler d1 execute etaw_hub_db --local --command "
INSERT INTO users (email, password_hash, role, created_at)
VALUES (
  'client@test.com',
  '\$2a\$10\$dummyhash',
  'client',
  datetime('now')
) ON CONFLICT(email) DO NOTHING;
"
```

### 3. Reset Demo Data (Optional - Clean Slate)
```bash
npx wrangler d1 execute etaw_hub_db --local --command "
DELETE FROM bookings;
DELETE FROM sessions;
DELETE FROM class_types;
DELETE FROM credits;
DELETE FROM credit_types;
DELETE FROM reminder_sends;
"
```

---

## Core Flow 1: Authentication & Access

### Step 1.1: Admin Login
- **URL**: http://localhost:5173/login
- **Action**: Login with admin credentials
  - Email: `admin@etaw.com`
  - Password: [your test password]
- **Expected**: Successful login, redirect to `/app`
- **Verify**: User shown with role "admin"

### Step 1.2: Navigate to Admin Panel
- **URL**: http://localhost:5173/admin
- **Expected**: Admin panel loads (currently shows placeholder)
- **Verify**: ⚠️ Warning banner shows "Admin Access Only"

---

## Core Flow 2: Class Types Management

**Current State**: No UI exists - API only
**Demo via**: cURL or Postman

### Step 2.1: Create Class Type
```bash
curl -X POST http://127.0.0.1:8787/api/admin/class-types \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Group Training",
    "description": "High-intensity group workout",
    "duration_minutes": 60,
    "default_capacity": 12
  }'
```
**Expected**: Status 201, returns class_type with `id`
**Verify**: Response includes all fields + `is_active: 1`

### Step 2.2: List Class Types
```bash
curl http://127.0.0.1:8787/api/admin/class-types \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```
**Expected**: Array of class types including the one just created
**Verify**: Count matches expected number

### Step 2.3: Update Class Type
```bash
curl -X PUT http://127.0.0.1:8787/api/admin/class-types \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "CLASS_TYPE_ID",
    "default_capacity": 15
  }'
```
**Expected**: Status 200, updated class type returned
**Verify**: Capacity changed to 15

### Step 2.4: Delete Class Type
```bash
curl -X DELETE "http://127.0.0.1:8787/api/admin/class-types?id=CLASS_TYPE_ID" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```
**Expected**: Status 200, confirmation message
**Verify**: Class type no longer in list

---

## Core Flow 3: Sessions Management

### Step 3.1: Create Session (24 hours from now)
```bash
curl -X POST http://127.0.0.1:8787/api/admin/sessions \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "class_type_id": "GROUP_TRAINING_ID",
    "starts_at": "2025-12-19T18:00:00Z",
    "ends_at": "2025-12-19T19:00:00Z",
    "capacity": 12,
    "is_visible": 1,
    "notes": "Demo session for testing"
  }'
```
**Expected**: Status 201, session created with ID
**Verify**: `starts_at` and `ends_at` match input

### Step 3.2: List Sessions
```bash
curl http://127.0.0.1:8787/api/admin/sessions \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```
**Expected**: Array of sessions with class_type details populated
**Verify**: Demo session appears in list

### Step 3.3: Update Session
```bash
curl -X PUT http://127.0.0.1:8787/api/admin/sessions \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "SESSION_ID",
    "capacity": 15,
    "notes": "Updated capacity"
  }'
```
**Expected**: Status 200, updated session
**Verify**: Capacity changed to 15

### Step 3.4: Delete Session
```bash
curl -X DELETE "http://127.0.0.1:8787/api/admin/sessions?id=SESSION_ID" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```
**Expected**: Status 200, confirmation
**Verify**: Session removed from list

---

## Core Flow 4: Credit Types & Credits Management

### Step 4.1: Create Credit Type
```bash
curl -X POST http://127.0.0.1:8787/api/admin/credit-types \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "10-Pack",
    "credits": 10,
    "price_cents": 15000,
    "expiry_days": 90
  }'
```
**Expected**: Status 201, credit type created
**Verify**: All fields returned correctly

### Step 4.2: List Credit Types
```bash
curl http://127.0.0.1:8787/api/admin/credit-types \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```
**Expected**: Array including newly created type
**Verify**: Price and expiry match

### Step 4.3: Grant Credits to User
```bash
curl -X POST http://127.0.0.1:8787/api/admin/credits/adjust \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 2,
    "credit_type_id": "TEN_PACK_ID",
    "amount": 10,
    "reason": "Demo credit grant"
  }'
```
**Expected**: Status 201, credit record created
**Verify**: Response shows new balance

### Step 4.4: View Credit Ledger
```bash
curl "http://127.0.0.1:8787/api/admin/credits/ledger?user_id=2" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```
**Expected**: Array of credit transactions
**Verify**: Shows grant transaction with reason

---

## Core Flow 5: Bookings & Check-ins

### Step 5.1: Create Booking (as admin for client)
```bash
curl -X POST http://127.0.0.1:8787/api/admin/bookings \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "SESSION_ID",
    "user_id": 2,
    "credit_type_id": "TEN_PACK_ID"
  }'
```
**Expected**: Status 201, booking created with status "booked"
**Verify**: Credit deducted from user balance

### Step 5.2: List Bookings for Session
```bash
curl "http://127.0.0.1:8787/api/admin/bookings?session_id=SESSION_ID" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```
**Expected**: Array of bookings for that session
**Verify**: Shows client booking

### Step 5.3: Check In Client
```bash
curl -X POST http://127.0.0.1:8787/api/admin/bookings/checkin \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": "BOOKING_ID"
  }'
```
**Expected**: Status 200, booking status changed to "attended"
**Verify**: Points awarded to user (if rewards system active)

---

## Core Flow 6: Exercise Library Management

### Step 6.1: Create Exercise
```bash
curl -X POST http://127.0.0.1:8787/api/admin/exercises \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Barbell Squat",
    "description": "Compound lower body exercise",
    "muscles": ["Quadriceps", "Glutes", "Core"],
    "equipment": ["Barbell", "Squat Rack"],
    "difficulty": "intermediate",
    "cues": ["Chest up", "Knees out", "Full depth"],
    "youtube_url": "https://youtube.com/watch?v=example"
  }'
```
**Expected**: Status 201, exercise created with `youtube_video_id` extracted
**Verify**: All arrays properly stored

### Step 6.2: Search Exercises
```bash
curl "http://127.0.0.1:8787/api/admin/exercises?q=squat" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```
**Expected**: Array of matching exercises
**Verify**: Barbell Squat appears in results

### Step 6.3: Get Single Exercise
```bash
curl http://127.0.0.1:8787/api/admin/exercises/EXERCISE_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```
**Expected**: Full exercise details with all fields
**Verify**: Arrays properly deserialized

### Step 6.4: Update Exercise
```bash
curl -X PUT http://127.0.0.1:8787/api/admin/exercises/EXERCISE_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "difficulty": "advanced",
    "cues": ["Chest up", "Knees out", "Full depth", "Brace core"]
  }'
```
**Expected**: Status 200, updated exercise
**Verify**: Difficulty changed, cues array updated

### Step 6.5: Delete Exercise
```bash
curl -X DELETE http://127.0.0.1:8787/api/admin/exercises/EXERCISE_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```
**Expected**: Status 200, confirmation
**Verify**: Exercise removed from list

---

## Core Flow 7: Workout Templates & Assignment

### Step 7.1: Create Workout Template
```bash
curl -X POST http://127.0.0.1:8787/api/admin/workouts \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lower Body Strength",
    "description": "Focus on squats and deadlifts"
  }'
```
**Expected**: Status 201, workout created
**Verify**: ID returned

### Step 7.2: Add Exercise to Workout
```bash
curl -X POST http://127.0.0.1:8787/api/admin/workouts/WORKOUT_ID/exercises \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "exercise_id": "SQUAT_ID",
    "sort_order": 0
  }'
```
**Expected**: Status 201, exercise added to workout
**Verify**: UNIQUE constraint prevents duplicates

### Step 7.3: Reorder Exercises
```bash
curl -X PUT http://127.0.0.1:8787/api/admin/workouts/WORKOUT_ID/exercises/reorder \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "exercise_id": "SQUAT_ID",
    "sort_order": 1
  }'
```
**Expected**: Status 200, order updated
**Verify**: GET workout shows new order

### Step 7.4: Get Workout with Exercises
```bash
curl http://127.0.0.1:8787/api/admin/workouts/WORKOUT_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```
**Expected**: Workout with embedded `exercises` array
**Verify**: Exercises sorted by `sort_order`

### Step 7.5: Assign Workout to Client
```bash
curl -X POST http://127.0.0.1:8787/api/admin/workouts/WORKOUT_ID/assign \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 2
  }'
```
**Expected**: Status 201, workout assigned
**Verify**: UNIQUE constraint prevents duplicate assignments

### Step 7.6: List Client's Workouts
```bash
curl "http://127.0.0.1:8787/api/admin/workouts?q=&user_id=2" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```
**Expected**: Array of workouts assigned to user 2
**Verify**: Includes "Lower Body Strength"

### Step 7.7: Unassign Workout
```bash
curl -X DELETE http://127.0.0.1:8787/api/admin/workouts/WORKOUT_ID/assign/2 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```
**Expected**: Status 200, assignment removed
**Verify**: Workout no longer in client's list

---

## Core Flow 8: Email Reminders (Dev/Testing)

### Step 8.1: Preview Reminders (Dry-Run)
```bash
curl -X POST http://127.0.0.1:8787/dev/reminders/preview \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dryRun": true,
    "overrideHours": 24
  }'
```
**Expected**: JSON with window, count, targets array
**Verify**: Shows `already_sent` flag for each target

### Step 8.2: Test Reminder Sending (if API key configured)
```bash
curl -X POST http://127.0.0.1:8787/dev/reminders/preview \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dryRun": false
  }'
```
**Expected**: Attempts to send to up to 10 targets
**Verify**: Results array shows `ok` status and errors

### Step 8.3: Manual Cron Trigger
```bash
curl -X POST http://127.0.0.1:8787/cdn-cgi/handler/scheduled
```
**Expected**: Status 200 "ok"
**Verify**: Check server logs for:
- `REMINDER_CRON fired at [timestamp]`
- `Reminder window: [start] to [end]`
- `Found X reminder target(s)`
- `REMINDER_DRY_RUN` or `REMINDER_SEND_OK` lines

---

## Core Flow 9: Intake Forms (PT Onboarding)

### Step 9.1: Enable PT Intake Requirement
```bash
curl -X POST http://127.0.0.1:8787/api/admin/settings/pt-intake-required \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "required": true
  }'
```
**Expected**: Status 200, setting updated
**Verify**: Clients will be required to complete PT intake

### Step 9.2: View User's Intake Form
```bash
curl "http://127.0.0.1:8787/api/admin/intake?user_id=2" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```
**Expected**: User's submitted intake form or empty array
**Verify**: Shows health history, goals, injuries, etc.

---

## Common Demo Scenarios

### Scenario A: New Client Onboarding
1. Create client user (signup or admin create)
2. Grant initial credits (10-pack)
3. Assign onboarding workout
4. View credit ledger (shows grant)
5. Client books first session (via client app)
6. Admin checks in client after session
7. Verify points awarded

### Scenario B: Session Management
1. Create class type (Group Training)
2. Create sessions for next 7 days
3. List upcoming sessions
4. Client books multiple sessions
5. View bookings by session
6. Check in attendees
7. Cancel no-shows

### Scenario C: Workout Programming
1. Create exercise library (10-15 exercises)
2. Create workout template (5 exercises)
3. Reorder exercises for optimal flow
4. Assign to 3 clients
5. View client's assigned workouts
6. Update workout (swap exercise)
7. Verify all clients see update

### Scenario D: Reminder System Test
1. Create session 24h from now
2. Client books session
3. Preview reminders (dryRun:true)
4. Verify target appears
5. Check reminder_sends table (empty)
6. Trigger cron (still dry-run)
7. Verify logs show DRY_RUN
8. (Optional) Enable sending, trigger again

---

## Teardown / Cleanup

### Reset All Demo Data
```bash
cd backend
npx wrangler d1 execute etaw_hub_db --local --command "
DELETE FROM bookings;
DELETE FROM sessions;
DELETE FROM class_types;
DELETE FROM credits;
DELETE FROM credit_types;
DELETE FROM exercises;
DELETE FROM workouts;
DELETE FROM workout_exercises;
DELETE FROM client_workouts;
DELETE FROM reminder_sends;
"
```

### Logout
- **Action**: Click Logout in admin panel
- **Expected**: Redirect to /login
- **Verify**: Cannot access /admin without re-auth

---

## Expected Completion Time
- **Full Demo (all flows)**: ~45-60 minutes
- **Core Flows Only (1-5)**: ~20-25 minutes
- **Quick Smoke Test (auth + 1-2 flows)**: ~10 minutes

## Known Limitations (Current State)
- ❌ No admin UI - all demos via cURL/Postman
- ❌ No client booking interface (API exists)
- ❌ No visual feedback on actions
- ❌ No form validation in UI
- ❌ No loading states
- ❌ No error messages displayed
- ❌ No success confirmations
- ✅ Backend API fully functional
- ✅ Auth and role-based access working
- ✅ Database schema complete
