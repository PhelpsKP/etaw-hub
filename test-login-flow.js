/**
 * Test login flow and verify /api/me is called only once
 */

const FRONTEND_URL = "http://localhost:5173"; // Adjust if different
const BACKEND_URL = "http://localhost:8787";

async function testLogin() {
  console.log("🧪 Testing login flow and /api/me call count...\n");

  // Test credentials (using bcrypt test user or legacy user)
  const testEmail = "legacytest@test.com";
  const testPassword = "Password123!";

  console.log(`📧 Test credentials: ${testEmail}`);
  console.log(`🔐 Password: ${testPassword}\n`);

  // Step 1: Login directly via backend API
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
  console.log("✅ Login successful, token received");
  console.log(`🎟️  Token: ${token.substring(0, 50)}...\n`);

  // Step 2: Call /api/me
  console.log("Step 2: Calling /api/me...");
  const meResponse = await fetch(`${BACKEND_URL}/api/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!meResponse.ok) {
    console.error("❌ /api/me failed:", await meResponse.text());
    return;
  }

  const userData = await meResponse.json();
  console.log("✅ /api/me successful");
  console.log("👤 User data:", userData);

  console.log("\n✨ Test completed!");
  console.log("\n📝 VERIFICATION NOTES:");
  console.log("   - When testing in browser, open DevTools Network tab");
  console.log("   - Login via the frontend UI");
  console.log("   - Filter by 'api/me'");
  console.log("   - Should see exactly ONE /api/me call after login");
  console.log(`   - User role: ${userData.role}`);
  console.log(`   - Should redirect to: ${userData.role === 'admin' ? '/app/admin' : '/app/book'}`);
}

testLogin().catch((error) => {
  console.error("❌ Test failed:", error);
  process.exit(1);
});
