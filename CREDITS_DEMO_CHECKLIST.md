# Credits Grant Feature - Browser Demo Checklist

## Summary
The Credits tab in the Admin panel allows admins to grant credits to users, enabling them to book sessions.

## Backend Routes Used
- **GET /api/admin/credit-types** - Fetches available credit types for the dropdown
- **POST /api/admin/credits/adjust** - Grants credits to a user
  - Request body: `{ user_id, credit_type_id, delta, reason }`
  - Response: `{ ok: true, balance: <new_balance> }`

## Credit Record Created
When admin grants credits:
- Creates entry in `credit_ledger` table
- Fields: user_id, credit_type_id, delta, reason, created_by_user_id, timestamp
- Updates user's credit balance (sum of all deltas for that credit type)

## Manual Browser Demo Steps

### Setup (One-time)
1. Open http://localhost:5173/
2. Ensure backend is running on port 8787
3. Have a client user account ready (or create via Signup)

### Demo Flow: Admin Grants Credits → Client Books → Admin Manages

#### Part 1: Admin Grants Credits
1. Login as **admin@example.com** / **admin123**
2. Click **Credits** tab in Admin panel
3. Fill in the form:
   - **User ID**: Enter the client's user ID (e.g., 12)
     - Tip: Client user IDs typically start from 2 or higher
     - You can create a client via Signup first to get their ID
   - **Credit Type**: Select "Drop-in" from dropdown
   - **Quantity**: Enter 5
4. Click **Grant Credits** button
5. ✅ Verify green success message appears: "Successfully granted 5 credits! New balance: 5"
6. ✅ Verify form clears after successful grant

#### Part 2: Admin Creates Session
1. Stay logged in as admin
2. Click **Sessions** tab
3. Click **Create New Session** button
4. Fill in the form:
   - **Class Type**: Select from dropdown (e.g., "Circuit")
   - **Starts At**: Pick tomorrow at 10:00 AM
   - **Ends At**: Pick tomorrow at 11:00 AM
   - **Capacity**: Leave as 10
   - **Visible**: Leave checked
5. Click **Create Session**
6. ✅ Verify session appears in the table

#### Part 3: Client Books Session
1. Logout from admin account
2. Login as **client** (e.g., democlient@example.com / client123)
   - If this user doesn't exist, create it via Signup first
   - **IMPORTANT**: After signup, go to /waiver and sign the waiver
3. Click **Book a Session** button from dashboard
4. ✅ Verify session(s) appear in the table
5. Click **Book** button on a session
6. Confirm the booking in the popup
7. ✅ Verify success message appears with booking ID
8. ✅ Verify button shows "Booking..." while processing
9. ✅ Verify no errors about insufficient credits

#### Part 4: Admin Views Booking
1. Logout from client account
2. Login as **admin@example.com** / **admin123**
3. Click **Bookings** tab
4. ✅ Verify the client's booking appears in the table with:
   - Booking ID
   - Client email (democlient@example.com)
   - Class type name
   - Session start/end times
   - Status: "booked"
   - Booked at timestamp

#### Part 5: Admin Cancels Booking
1. Stay on **Bookings** tab as admin
2. Find the active booking (status: "booked")
3. Click **Cancel** button
4. Confirm cancellation in the popup
5. ✅ Verify button shows "Cancelling..." while processing
6. ✅ Verify green success message appears
7. ✅ Verify booking status changes to "cancelled"
8. ✅ Verify credit was refunded (check Credits tab if needed)

## Success Criteria
All ✅ checkpoints above must pass for the feature to be considered working.

## Known User IDs
- Admin: user_id = 1 (or 7 in some test DBs)
- First client: user_id = 2 (or higher)
- To find a user's ID: Check signup response or use /api/me endpoint

## Troubleshooting
- **"No credits available" error**: Admin needs to grant credits first
- **"Active waiver signature required"**: Client needs to sign waiver at /waiver
- **"Invalid token" error**: User may not exist, create via Signup
- **Credits tab shows "Loading..."**: Check backend is running and /api/admin/credit-types endpoint works
- **Form validation errors**: Ensure all fields are filled and user_id/quantity are positive numbers
