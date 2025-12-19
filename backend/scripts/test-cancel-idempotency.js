// Test script to validate cancel endpoint idempotency
// Tests that cancelling the same booking twice doesn't refund twice

const BASE_URL = "http://127.0.0.1:8787";

async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  return data.token;
}

async function getCreditBalance(token) {
  const res = await fetch(`${BASE_URL}/api/credits/balances`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.balances;
}

async function getCreditLedger(adminToken, userId) {
  const res = await fetch(`${BASE_URL}/api/admin/credits/ledger?user_id=${userId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const data = await res.json();
  return data.ledger;
}

async function createSession(adminToken, classTypeId) {
  // Create a session 24 hours from now
  const startsAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const endsAt = new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString();

  const res = await fetch(`${BASE_URL}/api/admin/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${adminToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      class_type_id: classTypeId,
      starts_at: startsAt,
      ends_at: endsAt,
      capacity: 10,
      is_visible: 1,
    }),
  });
  const data = await res.json();
  if (!data.id) {
    throw new Error(`Failed to create session: ${JSON.stringify(data)}`);
  }
  return data.id;
}

async function createBooking(clientToken, sessionId) {
  const res = await fetch(`${BASE_URL}/api/bookings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${clientToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ session_id: sessionId }),
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function cancelBooking(clientToken, bookingId) {
  const res = await fetch(`${BASE_URL}/api/bookings/cancel`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${clientToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ booking_id: bookingId }),
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function main() {
  console.log("=== Testing Cancel Idempotency ===\n");

  // Login
  console.log("1. Logging in...");
  const adminToken = await login("admin@test.com", "Password123!");
  const clientToken = await login("check@test.com", "Password123!");
  console.log("✓ Logged in\n");

  // Get initial balance
  console.log("2. Getting initial credit balance...");
  const initialBalances = await getCreditBalance(clientToken);
  console.log("Initial balances:", JSON.stringify(initialBalances, null, 2));
  const creditBalance = initialBalances[0]?.balance || 0;
  console.log(`Current balance: ${creditBalance}\n`);

  // Use existing class type (HIIT from previous tests)
  const classTypeId = "a1b45a96-4c90-4ba5-824a-0b8ea60306b0";

  // Create a session
  console.log("3. Creating test session...");
  const sessionId = await createSession(adminToken, classTypeId);
  console.log(`✓ Session created: ${sessionId}\n`);

  // Create booking
  console.log("4. Creating booking...");
  const bookingResult = await createBooking(clientToken, sessionId);
  console.log(`Status: ${bookingResult.status}`);
  console.log("Response:", JSON.stringify(bookingResult.data, null, 2));

  if (bookingResult.status !== 200) {
    console.error("Failed to create booking. Exiting.");
    return;
  }

  const bookingId = bookingResult.data.booking_id;
  console.log(`✓ Booking created: ${bookingId}\n`);

  // Get balance after booking
  const afterBookingBalances = await getCreditBalance(clientToken);
  const afterBookingBalance = afterBookingBalances[0]?.balance || 0;
  console.log(`Balance after booking: ${afterBookingBalance}`);
  console.log(`Credits used: ${creditBalance - afterBookingBalance}\n`);

  // First cancel
  console.log("5. First cancel attempt...");
  const firstCancel = await cancelBooking(clientToken, bookingId);
  console.log(`Status: ${firstCancel.status}`);
  console.log("Response:", JSON.stringify(firstCancel.data, null, 2));

  // Get balance after first cancel
  const afterFirstCancelBalances = await getCreditBalance(clientToken);
  const afterFirstCancelBalance = afterFirstCancelBalances[0]?.balance || 0;
  console.log(`Balance after first cancel: ${afterFirstCancelBalance}`);
  console.log(`Credits refunded: ${afterFirstCancelBalance - afterBookingBalance}\n`);

  // Second cancel (should fail with 409)
  console.log("6. Second cancel attempt (should return 409)...");
  const secondCancel = await cancelBooking(clientToken, bookingId);
  console.log(`Status: ${secondCancel.status}`);
  console.log("Response:", JSON.stringify(secondCancel.data, null, 2));

  // Get balance after second cancel
  const afterSecondCancelBalances = await getCreditBalance(clientToken);
  const afterSecondCancelBalance = afterSecondCancelBalances[0]?.balance || 0;
  console.log(`Balance after second cancel: ${afterSecondCancelBalance}`);
  console.log(`Additional credits refunded: ${afterSecondCancelBalance - afterFirstCancelBalance}\n`);

  // Get ledger to verify refund count
  console.log("7. Checking credit ledger...");
  const ledger = await getCreditLedger(adminToken, 3); // user_id=3 for check@test.com
  const refundEntries = ledger.filter((entry) =>
    entry.reason.includes(`cancelled booking ${bookingId}`)
  );
  console.log(`Refund ledger entries for booking ${bookingId}:`, refundEntries.length);
  refundEntries.forEach((entry) => {
    console.log(
      `  - Delta: ${entry.delta}, Reason: ${entry.reason}, Created: ${entry.created_at}`
    );
  });

  // Final verification
  console.log("\n=== VERIFICATION RESULTS ===");
  console.log(`First cancel status: ${firstCancel.status} (expected: 200)`);
  console.log(`Second cancel status: ${secondCancel.status} (expected: 409)`);
  console.log(`Refund count in ledger: ${refundEntries.length} (expected: 1)`);
  console.log(`Final balance: ${afterSecondCancelBalance} (expected: ${afterFirstCancelBalance})`);

  const success =
    firstCancel.status === 200 &&
    secondCancel.status === 409 &&
    refundEntries.length === 1 &&
    afterSecondCancelBalance === afterFirstCancelBalance;

  console.log(`\n✓ TEST ${success ? "PASSED" : "FAILED"}`);
}

main().catch(console.error);
