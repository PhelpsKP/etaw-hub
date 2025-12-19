// Test admin credits grant functionality
const API = "http://127.0.0.1:8787";

async function main() {
  console.log("=== Testing Credits Grant ===\n");

  // Login as admin
  console.log("1. Logging in as admin...");
  const loginRes = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@example.com", password: "admin123" }),
  });

  const { token } = await loginRes.json();
  console.log("✓ Logged in\n");

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // Get credit types
  console.log("2. GET /api/admin/credit-types");
  const typesRes = await fetch(`${API}/api/admin/credit-types`, {
    headers: authHeaders,
  });

  if (typesRes.ok) {
    const typesData = await typesRes.json();
    console.log(`✓ Status: ${typesRes.status}`);
    console.log(`✓ Found ${typesData.creditTypes.length} credit type(s)`);

    if (typesData.creditTypes.length > 0) {
      const firstType = typesData.creditTypes[0];
      console.log(`✓ First type: ${firstType.id} - ${firstType.name}`);

      // Grant credits to user ID 2 (typical first client)
      console.log(`\n3. POST /api/admin/credits/adjust (grant 5 credits to user 2)`);
      const grantRes = await fetch(`${API}/api/admin/credits/adjust`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          user_id: 2,
          credit_type_id: firstType.id,
          delta: 5,
          reason: "Test grant from script"
        }),
      });

      if (grantRes.ok) {
        const grantData = await grantRes.json();
        console.log(`✓ Status: ${grantRes.status}`);
        console.log(`✓ Credits granted successfully!`);
        console.log(`✓ New balance: ${grantData.balance}`);
      } else {
        const errorData = await grantRes.json();
        console.log(`✗ Failed: ${grantRes.status} ${errorData.error}`);
      }
    }
  } else {
    console.log(`✗ Failed: ${typesRes.status} ${await typesRes.text()}`);
  }

  console.log("\n=== Tests Complete ===");
  console.log("\nBrowser Test Steps:");
  console.log("1. Open http://localhost:5173/");
  console.log("2. Login as admin@example.com / admin123");
  console.log("3. Click Credits tab");
  console.log("4. Fill form:");
  console.log("   - User ID: 2");
  console.log("   - Credit Type: Select from dropdown");
  console.log("   - Quantity: 5");
  console.log("5. Click 'Grant Credits'");
  console.log("6. Verify green success message shows new balance");
  console.log("7. Logout, login as client");
  console.log("8. Try booking a session - should succeed now!");
}

main().catch((err) => console.error("Error:", err));
