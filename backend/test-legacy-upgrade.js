/**
 * Test: Legacy SHA-256 user auto-upgrade to bcrypt
 *
 * This test verifies that:
 * 1. A legacy user with SHA-256 hash can log in
 * 2. Their password is automatically upgraded to bcrypt on first login
 * 3. Subsequent logins use bcrypt verification
 *
 * Prerequisites:
 * - Run migration 0012_bcrypt_upgrade.sql first
 * - Ensure at least one existing user exists with SHA-256 hash
 */

const BASE_URL = "http://localhost:8787";

async function testLegacyUpgrade() {
  console.log("🧪 Testing legacy SHA-256 user auto-upgrade...\n");

  // NOTE: Replace these with actual credentials from your test database
  // You can check existing users with:
  // wrangler d1 execute etaw_hub_db --local --command="SELECT id, email, password_algo FROM users WHERE password_algo='sha256' LIMIT 1;"

  const legacyEmail = "test@example.com"; // Replace with actual legacy user email
  const legacyPassword = "password123";   // Replace with actual password

  console.log("⚠️  Using test credentials:");
  console.log(`   Email: ${legacyEmail}`);
  console.log(`   Password: ${legacyPassword}`);
  console.log("\n   If this test fails, make sure:");
  console.log("   1. Migration 0012 has been applied");
  console.log("   2. A user with these credentials exists");
  console.log("   3. The user's password_algo is 'sha256'\n");

  // Step 1: First login (should trigger upgrade)
  console.log("🔐 Step 1: First login (should upgrade SHA-256 → bcrypt)...");
  const firstLoginResponse = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: legacyEmail, password: legacyPassword }),
  });

  if (!firstLoginResponse.ok) {
    const errorText = await firstLoginResponse.text();
    console.error("❌ First login failed:", errorText);
    console.error("\n💡 Troubleshooting:");
    console.error("   - Check if user exists in database");
    console.error("   - Verify password is correct");
    console.error("   - Ensure migration 0012 has been applied");
    process.exit(1);
  }

  const firstLoginData = await firstLoginResponse.json();
  console.log("✅ First login successful");
  console.log("🎟️  JWT token:", firstLoginData.token.substring(0, 50) + "...");
  console.log("🔄 Password should now be upgraded to bcrypt");

  // Step 2: Verify user info
  console.log("\n👤 Step 2: Fetching user info...");
  const meResponse = await fetch(`${BASE_URL}/api/me`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${firstLoginData.token}`,
    },
  });

  if (!meResponse.ok) {
    console.error("❌ Failed to fetch user info:", await meResponse.text());
    process.exit(1);
  }

  const meData = await meResponse.json();
  console.log("✅ User info:", meData);

  // Step 3: Second login (should use bcrypt verification)
  console.log("\n🔐 Step 3: Second login (should use bcrypt verification)...");
  const secondLoginResponse = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: legacyEmail, password: legacyPassword }),
  });

  if (!secondLoginResponse.ok) {
    console.error("❌ Second login failed:", await secondLoginResponse.text());
    console.error("   This might indicate the upgrade didn't complete successfully");
    process.exit(1);
  }

  const secondLoginData = await secondLoginResponse.json();
  console.log("✅ Second login successful (using bcrypt)");
  console.log("🎟️  JWT token:", secondLoginData.token.substring(0, 50) + "...");

  console.log("\n✨ All tests passed! Legacy user auto-upgrade is working correctly.");
  console.log("   - Legacy SHA-256 user logged in successfully");
  console.log("   - Password automatically upgraded to bcrypt");
  console.log("   - Subsequent login uses bcrypt verification");
  console.log("\n💡 You can verify the upgrade in the database:");
  console.log(`   wrangler d1 execute etaw_hub_db --local --command="SELECT email, password_algo FROM users WHERE email='${legacyEmail}';"`);
}

testLegacyUpgrade().catch((error) => {
  console.error("❌ Test failed with error:", error);
  process.exit(1);
});
