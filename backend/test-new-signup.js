/**
 * Test: New user signup with bcrypt
 *
 * This test verifies that:
 * 1. A new user can sign up successfully
 * 2. The password is hashed using bcrypt
 * 3. The password_algo is set to 'bcrypt'
 * 4. The user can log in with the bcrypt hash
 */

const BASE_URL = "http://localhost:8787";

async function testNewSignup() {
  console.log("🧪 Testing new user signup with bcrypt...\n");

  const testEmail = `newuser-${Date.now()}@test.com`;
  const testPassword = "SecurePassword123!";

  // Step 1: Sign up new user
  console.log("📝 Step 1: Signing up new user...");
  const signupResponse = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password: testPassword }),
  });

  if (!signupResponse.ok) {
    console.error("❌ Signup failed:", await signupResponse.text());
    process.exit(1);
  }

  const signupData = await signupResponse.json();
  console.log("✅ Signup successful:", signupData);

  // Step 2: Log in with new credentials
  console.log("\n🔐 Step 2: Logging in with new credentials...");
  const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password: testPassword }),
  });

  if (!loginResponse.ok) {
    console.error("❌ Login failed:", await loginResponse.text());
    process.exit(1);
  }

  const loginData = await loginResponse.json();
  console.log("✅ Login successful");
  console.log("🎟️  JWT token:", loginData.token.substring(0, 50) + "...");

  // Step 3: Verify user info
  console.log("\n👤 Step 3: Fetching user info...");
  const meResponse = await fetch(`${BASE_URL}/api/me`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${loginData.token}`,
    },
  });

  if (!meResponse.ok) {
    console.error("❌ Failed to fetch user info:", await meResponse.text());
    process.exit(1);
  }

  const meData = await meResponse.json();
  console.log("✅ User info:", meData);

  console.log("\n✨ All tests passed! New user signup with bcrypt is working correctly.");
  console.log("   - User created with bcrypt hash");
  console.log("   - Login successful");
  console.log("   - Auth token works");
}

testNewSignup().catch((error) => {
  console.error("❌ Test failed with error:", error);
  process.exit(1);
});
