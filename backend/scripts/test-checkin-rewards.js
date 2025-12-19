// Test script to validate check-in and rewards idempotency
// Tests that checking in twice doesn't give double rewards

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

async function createSession(adminToken, classTypeId) {
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
    }),
  });
  const data = await res.json();
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

async function checkinBooking(adminToken, bookingId) {
  const res = await fetch(`${BASE_URL}/api/admin/bookings/checkin`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${adminToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ booking_id: bookingId }),
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function getRewards(clientToken) {
  const res = await fetch(`${BASE_URL}/api/rewards`, {
    headers: { Authorization: `Bearer ${clientToken}` },
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function main() {
  console.log("=== Testing Check-in & Rewards Idempotency ===\n");

  // Login
  console.log("1. Logging in...");
  const adminToken = await login("admin@test.com", "Password123!");
  const clientToken = await login("check@test.com", "Password123!");
  console.log("✓ Logged in\n");

  // Get initial rewards balance
  console.log("2. Getting initial rewards balance...");
  const initialRewards = await getRewards(clientToken);
  console.log(`Status: ${initialRewards.status}`);
  console.log(`Initial points balance: ${initialRewards.data.points_balance}`);
  console.log(`Recent entries count: ${initialRewards.data.recent.length}\n`);

  const initialBalance = initialRewards.data.points_balance;

  // Create session
  console.log("3. Creating test session...");
  const classTypeId = "a1b45a96-4c90-4ba5-824a-0b8ea60306b0"; // HIIT
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

  // First check-in
  console.log("5. First check-in attempt...");
  const firstCheckin = await checkinBooking(adminToken, bookingId);
  console.log(`Status: ${firstCheckin.status}`);
  console.log("Response:", JSON.stringify(firstCheckin.data, null, 2));

  if (firstCheckin.status !== 200) {
    console.error("First check-in failed unexpectedly. Exiting.");
    return;
  }

  // Get rewards after first check-in
  const afterFirstCheckin = await getRewards(clientToken);
  const afterFirstBalance = afterFirstCheckin.data.points_balance;
  console.log(`Rewards balance after first check-in: ${afterFirstBalance}`);
  console.log(`Points awarded: ${afterFirstBalance - initialBalance}\n`);

  // Second check-in (should fail with 409)
  console.log("6. Second check-in attempt (should return 409)...");
  const secondCheckin = await checkinBooking(adminToken, bookingId);
  console.log(`Status: ${secondCheckin.status}`);
  console.log("Response:", JSON.stringify(secondCheckin.data, null, 2));

  // Get rewards after second check-in attempt
  const afterSecondCheckin = await getRewards(clientToken);
  const afterSecondBalance = afterSecondCheckin.data.points_balance;
  console.log(`Rewards balance after second check-in: ${afterSecondBalance}`);
  console.log(`Additional points awarded: ${afterSecondBalance - afterFirstBalance}\n`);

  // Check ledger entries
  console.log("7. Checking rewards ledger...");
  const ledgerEntries = afterSecondCheckin.data.recent.filter((entry) =>
    entry.booking_id === bookingId
  );
  console.log(`Ledger entries for booking ${bookingId}: ${ledgerEntries.length}`);
  ledgerEntries.forEach((entry) => {
    console.log(
      `  - Delta: ${entry.delta_points}, Reason: ${entry.reason}, Created: ${entry.created_at}`
    );
  });

  // Final verification
  console.log("\n=== VERIFICATION RESULTS ===");
  console.log(`First check-in status: ${firstCheckin.status} (expected: 200)`);
  console.log(`Second check-in status: ${secondCheckin.status} (expected: 409)`);
  console.log(`Points awarded on first: ${afterFirstBalance - initialBalance} (expected: 1)`);
  console.log(`Additional points on second: ${afterSecondBalance - afterFirstBalance} (expected: 0)`);
  console.log(`Ledger entries for booking: ${ledgerEntries.length} (expected: 1)`);
  console.log(`Final balance: ${afterSecondBalance} (expected: ${afterFirstBalance})`);

  const success =
    firstCheckin.status === 200 &&
    secondCheckin.status === 409 &&
    (afterFirstBalance - initialBalance) === 1 &&
    (afterSecondBalance - afterFirstBalance) === 0 &&
    ledgerEntries.length === 1;

  console.log(`\n✓ TEST ${success ? "PASSED" : "FAILED"}`);
}

main().catch(console.error);
