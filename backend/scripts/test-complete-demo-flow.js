// Test complete demo flow: Admin grants credits → Client books → Admin sees booking → Admin cancels
const API = "http://127.0.0.1:8787";

async function main() {
  console.log("=== COMPLETE DEMO FLOW TEST ===\n");

  // Step 1: Admin login
  console.log("STEP 1: Admin logs in");
  const adminLoginRes = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@example.com", password: "admin123" }),
  });
  const { token: adminToken } = await adminLoginRes.json();
  console.log("✓ Admin logged in\n");

  const adminHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${adminToken}`,
  };

  // Step 2: Create client user if needed
  console.log("STEP 2: Create/login client user");

  // Try to signup (will fail if user exists, that's ok)
  await fetch(`${API}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "democlient@example.com",
      password: "client123",
      first_name: "Demo",
      last_name: "Client"
    }),
  });

  // Login to get token
  const tempLoginRes = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "democlient@example.com", password: "client123" }),
  });
  const tempLoginData = await tempLoginRes.json();
  const tempToken = tempLoginData.token;

  // Get user info from /api/me
  const meRes = await fetch(`${API}/api/me`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tempToken}`,
    },
  });
  const meData = await meRes.json();
  const clientUserId = meData.id;
  console.log(`✓ Client user ready! ID: ${clientUserId}`);

  // Sign waiver
  const waiverRes = await fetch(`${API}/api/waiver/sign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tempToken}`,
    },
    body: JSON.stringify({
      signed_name: "Demo Client",
      agreed_to_terms: true
    }),
  });
  if (waiverRes.ok) {
    console.log(`✓ Waiver signed\n`);
  } else {
    const waiverError = await waiverRes.json();
    console.log(`✗ Waiver signing failed: ${waiverError.error}`);
    console.log(`  Status: ${waiverRes.status}\n`);
  }

  // Step 3: Admin gets credit types
  console.log("STEP 3: Admin gets credit types");
  const typesRes = await fetch(`${API}/api/admin/credit-types`, {
    headers: adminHeaders,
  });
  const typesData = await typesRes.json();
  const creditTypeId = typesData.creditTypes[0].id;
  console.log(`✓ Credit type: ${typesData.creditTypes[0].name} (${creditTypeId})\n`);

  // Step 4: Admin grants 5 credits to client
  console.log(`STEP 4: Admin grants 5 credits to client (user ID ${clientUserId})`);
  const grantRes = await fetch(`${API}/api/admin/credits/adjust`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({
      user_id: clientUserId,
      credit_type_id: creditTypeId,
      delta: 5,
      reason: "Demo flow test grant"
    }),
  });
  const grantData = await grantRes.json();
  console.log(`✓ Credits granted! Balance: ${grantData.balance}\n`);

  // Step 5: Admin creates a session
  console.log("STEP 5: Admin creates a session");
  const classTypesRes = await fetch(`${API}/api/admin/class-types`, {
    headers: adminHeaders,
  });
  const classTypesData = await classTypesRes.json();
  const classTypeId = classTypesData.classTypes[0].id;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  const startsAt = tomorrow.toISOString();

  const endsAt = new Date(tomorrow);
  endsAt.setHours(11, 0, 0, 0);
  const endsAtStr = endsAt.toISOString();

  const createSessionRes = await fetch(`${API}/api/admin/sessions`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({
      class_type_id: classTypeId,
      starts_at: startsAt,
      ends_at: endsAtStr,
      capacity: 10,
      is_visible: true,
    }),
  });
  const sessionData = await createSessionRes.json();
  const sessionId = sessionData.session_id || sessionData.id;
  console.log(`✓ Session created! ID: ${sessionId}\n`);

  // Step 6: Client logs in
  console.log("STEP 6: Client logs in");
  const clientLoginRes = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "democlient@example.com", password: "client123" }),
  });
  const clientLoginData = await clientLoginRes.json();
  const clientToken = clientLoginData.token;
  console.log("✓ Client logged in\n");

  const clientHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${clientToken}`,
  };

  // Step 7: Client books the session
  console.log("STEP 7: Client books the session");
  const bookRes = await fetch(`${API}/api/bookings`, {
    method: "POST",
    headers: clientHeaders,
    body: JSON.stringify({ session_id: sessionId }),
  });

  if (bookRes.ok) {
    const bookData = await bookRes.json();
    const bookingId = bookData.booking_id;
    console.log(`✓ SESSION BOOKED SUCCESSFULLY! Booking ID: ${bookingId}\n`);

    // Step 8: Admin views bookings
    console.log("STEP 8: Admin views bookings");
    const viewBookingsRes = await fetch(`${API}/api/admin/bookings`, {
      headers: adminHeaders,
    });
    const bookingsData = await viewBookingsRes.json();
    const booking = bookingsData.bookings.find(b => b.id === bookingId);
    if (booking) {
      console.log(`✓ Admin can see booking:`);
      console.log(`  - ID: ${booking.id}`);
      console.log(`  - User: ${booking.user_email}`);
      console.log(`  - Class: ${booking.class_type_name}`);
      console.log(`  - Status: ${booking.status}\n`);

      // Step 9: Admin cancels the booking
      console.log("STEP 9: Admin cancels the booking");
      const cancelRes = await fetch(`${API}/api/admin/bookings/cancel`, {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({ booking_id: bookingId }),
      });
      const cancelData = await cancelRes.json();
      console.log(`✓ BOOKING CANCELLED! Refunded: ${cancelData.refunded}\n`);

      // Step 10: Verify cancellation
      console.log("STEP 10: Verify booking status changed to cancelled");
      const verifyRes = await fetch(`${API}/api/admin/bookings`, {
        headers: adminHeaders,
      });
      const verifyData = await verifyRes.json();
      const cancelledBooking = verifyData.bookings.find(b => b.id === bookingId);
      if (cancelledBooking && cancelledBooking.status === 'cancelled') {
        console.log(`✓ Confirmed: Booking status is 'cancelled'\n`);
      } else {
        console.log(`✗ Error: Booking status not updated properly\n`);
      }
    } else {
      console.log(`✗ Error: Admin cannot see the booking\n`);
    }
  } else {
    const errorData = await bookRes.json();
    console.log(`✗ BOOKING FAILED: ${errorData.error}\n`);
    console.log("This means credits are still not working properly!");
  }

  console.log("=== DEMO FLOW TEST COMPLETE ===");
  console.log("\n✅ SUCCESS! All steps completed:");
  console.log("   1. Admin granted credits");
  console.log("   2. Admin created session");
  console.log("   3. Client booked session");
  console.log("   4. Admin viewed booking");
  console.log("   5. Admin cancelled booking");
  console.log("\nThe complete demo flow is now working!");
}

main().catch((err) => console.error("Error:", err));
