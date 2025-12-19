// Test script for Sessions UI - Creates test data and verifies API calls
const API = "http://127.0.0.1:8787";

async function main() {
  console.log("=== Testing Sessions UI Setup ===\n");

  // Step 1: Login as admin
  console.log("1. Logging in as admin...");
  const loginRes = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@example.com", password: "admin123" }),
  });

  if (!loginRes.ok) {
    console.error("Login failed:", await loginRes.text());
    return;
  }

  const { token } = await loginRes.json();
  console.log("✓ Logged in successfully\n");

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // Step 2: Create a test class type
  console.log("2. Creating test class type...");
  const classTypeRes = await fetch(`${API}/api/admin/class-types`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      name: "Test Yoga Class",
      description: "A relaxing yoga session",
    }),
  });

  if (!classTypeRes.ok) {
    console.error("Class type creation failed:", await classTypeRes.text());
    return;
  }

  const { id: classTypeId } = await classTypeRes.json();
  console.log(`✓ Created class type with ID: ${classTypeId}\n`);

  // Step 3: Create a test session
  console.log("3. Creating test session...");
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const startsAt = tomorrow.toISOString().slice(0, 19).replace("T", " ");

  const endsAt = new Date(tomorrow);
  endsAt.setHours(tomorrow.getHours() + 1);
  const endsAtStr = endsAt.toISOString().slice(0, 19).replace("T", " ");

  const sessionRes = await fetch(`${API}/api/admin/sessions`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      class_type_id: classTypeId,
      starts_at: startsAt,
      ends_at: endsAtStr,
      capacity: 15,
      is_visible: true,
      notes: "Test session created via script",
    }),
  });

  if (!sessionRes.ok) {
    console.error("Session creation failed:", await sessionRes.text());
    return;
  }

  const { id: sessionId } = await sessionRes.json();
  console.log(`✓ Created session with ID: ${sessionId}`);
  console.log(`  Starts: ${startsAt}`);
  console.log(`  Ends: ${endsAtStr}\n`);

  // Step 4: List sessions to verify
  console.log("4. Fetching sessions list...");
  const listRes = await fetch(`${API}/api/admin/sessions`, {
    headers: authHeaders,
  });

  if (!listRes.ok) {
    console.error("Failed to fetch sessions:", await listRes.text());
    return;
  }

  const { sessions } = await listRes.json();
  console.log(`✓ Found ${sessions.length} session(s):`);
  sessions.forEach((s) => {
    console.log(`  - ${s.class_type_name || s.class_type_id} at ${s.starts_at} (capacity: ${s.capacity})`);
  });

  console.log("\n=== Setup Complete ===");
  console.log("\nNext steps:");
  console.log("1. Open http://localhost:5173/ in your browser");
  console.log("2. Login with: admin@example.com / admin123");
  console.log("3. Navigate to Admin page");
  console.log("4. Click Sessions tab");
  console.log("5. You should see the test session listed");
  console.log("6. Try creating a new session and deleting sessions");
  console.log(`\nTest data created:`);
  console.log(`  Class Type ID: ${classTypeId}`);
  console.log(`  Session ID: ${sessionId}`);
}

main().catch((err) => console.error("Error:", err));
