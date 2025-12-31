/**
 * Test waiver/status endpoint
 */

const BACKEND_URL = "http://127.0.0.1:8787";

async function testWaiverStatus() {
  console.log("🧪 Testing /api/waiver/status...\n");

  // Step 1: Login
  console.log("Step 1: Login...");
  const loginResponse = await fetch(`${BACKEND_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "legacytest@test.com", password: "Password123!" }),
  });

  if (!loginResponse.ok) {
    console.error("❌ Login failed:", await loginResponse.text());
    return;
  }

  const { token } = await loginResponse.json();
  console.log("✅ Login successful\n");

  // Step 2: Check waiver status
  console.log("Step 2: Calling /api/waiver/status...");
  const waiverResponse = await fetch(`${BACKEND_URL}/api/waiver/status`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log(`   Status: ${waiverResponse.status}`);

  if (!waiverResponse.ok) {
    console.error("❌ Failed:", await waiverResponse.text());
    return;
  }

  const waiverData = await waiverResponse.json();
  console.log("✅ /api/waiver/status successful");
  console.log("\n📊 Response:");
  console.log(JSON.stringify(waiverData, null, 2));
}

testWaiverStatus().catch((error) => {
  console.error("❌ Test failed:", error);
  process.exit(1);
});
