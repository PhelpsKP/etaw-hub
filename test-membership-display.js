/**
 * Test membership display
 */

const BACKEND_URL = "http://localhost:8787";

async function testMembershipDisplay() {
  console.log("🧪 Testing membership display...\n");

  // Test credentials
  const testEmail = "legacytest@test.com";
  const testPassword = "Password123!";

  console.log(`📧 Test credentials: ${testEmail}\n`);

  // Step 1: Login
  console.log("Step 1: Calling /auth/login...");
  const loginResponse = await fetch(`${BACKEND_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password: testPassword }),
  });

  if (!loginResponse.ok) {
    console.error("❌ Login failed:", await loginResponse.text());
    return;
  }

  const { token } = await loginResponse.json();
  console.log("✅ Login successful\n");

  // Step 2: Call /api/membership/status
  console.log("Step 2: Calling /api/membership/status...");
  const membershipResponse = await fetch(`${BACKEND_URL}/api/membership/status`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!membershipResponse.ok) {
    console.error("❌ /api/membership/status failed:", await membershipResponse.text());
    return;
  }

  const membershipData = await membershipResponse.json();
  console.log("✅ /api/membership/status successful");
  console.log("\n📊 Membership data:");
  console.log(JSON.stringify(membershipData, null, 2));

  console.log("\n✨ Test completed!");
  console.log("\n📝 VERIFICATION NOTES:");
  console.log("   - Open browser to http://localhost:5177");
  console.log("   - Login with legacytest@test.com / Password123!");
  console.log("   - Should see membership card on /app/book page");
  console.log(`   - Has unlimited: ${membershipData.hasUnlimited}`);
  console.log(`   - Membership plan: ${membershipData.membership?.plan || 'none'}`);
  console.log(`   - Expires: ${membershipData.membership?.ends_at || 'n/a'}`);
}

testMembershipDisplay().catch((error) => {
  console.error("❌ Test failed:", error);
  process.exit(1);
});
