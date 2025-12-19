const API_BASE = "http://127.0.0.1:8787";

async function testReminderDedup() {
  console.log("=== Testing Reminder De-duplication ===\n");

  console.log("Step 1: Login as admin...");
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@example.com",
      password: "admin123",
    }),
  });

  if (!loginRes.ok) {
    console.error("❌ Login failed:", loginRes.status, await loginRes.text());
    return;
  }

  const loginData = await loginRes.json();
  if (!loginData.token) {
    console.error("❌ Login response missing token:", loginData);
    return;
  }
  console.log("✅ Login successful\n");
  const token = loginData.token;

  console.log("Step 2: First call with dryRun:false (should send)...");
  const firstRes = await fetch(`${API_BASE}/dev/reminders/preview`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ dryRun: false }),
  });

  if (!firstRes.ok) {
    console.error("❌ First call failed:", firstRes.status, await firstRes.text());
    return;
  }

  const firstData = await firstRes.json();
  console.log("✅ First call successful\n");
  console.log("First call results:");
  console.log(JSON.stringify(firstData, null, 2));

  console.log("\nStep 3: Second call with dryRun:false (should skip)...");
  const secondRes = await fetch(`${API_BASE}/dev/reminders/preview`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ dryRun: false }),
  });

  if (!secondRes.ok) {
    console.error("❌ Second call failed:", secondRes.status, await secondRes.text());
    return;
  }

  const secondData = await secondRes.json();
  console.log("✅ Second call successful\n");
  console.log("Second call results:");
  console.log(JSON.stringify(secondData, null, 2));
}

testReminderDedup().catch(console.error);
