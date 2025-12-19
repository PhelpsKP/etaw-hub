const API_BASE = "http://127.0.0.1:8787";

async function testRemindersPreview() {
  console.log("=== Testing /dev/reminders/preview ===\n");

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
  console.log("✅ Login successful");
  const token = loginData.token;

  console.log("\nStep 2: Call /dev/reminders/preview with dryRun:true...");
  const dryRunRes = await fetch(`${API_BASE}/dev/reminders/preview`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ dryRun: true }),
  });

  if (!dryRunRes.ok) {
    console.error(
      "❌ Dry run preview failed:",
      dryRunRes.status,
      await dryRunRes.text()
    );
    return;
  }

  const dryRunData = await dryRunRes.json();
  console.log("✅ Dry run preview successful\n");
  console.log("Dry run response:");
  console.log(JSON.stringify(dryRunData, null, 2));

  console.log("\nStep 3: Call /dev/reminders/preview with dryRun:false...");
  const sendRes = await fetch(`${API_BASE}/dev/reminders/preview`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ dryRun: false }),
  });

  if (!sendRes.ok) {
    console.error(
      "❌ Send preview failed:",
      sendRes.status,
      await sendRes.text()
    );
    return;
  }

  const sendData = await sendRes.json();
  console.log("✅ Send preview successful\n");
  console.log("Send results:");
  console.log(JSON.stringify(sendData, null, 2));
}

testRemindersPreview().catch(console.error);
