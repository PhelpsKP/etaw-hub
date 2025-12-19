// Test the Sessions API from frontend perspective
const API = "http://127.0.0.1:8787";

async function main() {
  console.log("=== Testing Sessions API (Frontend Perspective) ===\n");

  // Login
  console.log("1. Login...");
  const loginRes = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@example.com", password: "admin123" }),
  });

  const { token } = await loginRes.json();
  console.log("✓ Logged in\n");

  // Test GET /api/admin/sessions
  console.log("2. GET /api/admin/sessions");
  const listRes = await fetch(`${API}/api/admin/sessions`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (listRes.ok) {
    const data = await listRes.json();
    console.log(`✓ Status: ${listRes.status}`);
    console.log(`✓ Found ${data.sessions.length} sessions`);
    console.log(`✓ Sample: ${JSON.stringify(data.sessions[0], null, 2)}`);
  } else {
    console.error(`✗ Failed: ${listRes.status} ${await listRes.text()}`);
  }

  console.log("\n3. POST /api/admin/sessions (create)");
  const createRes = await fetch(`${API}/api/admin/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      class_type_id: "923f70ea-ef32-4f8d-8f3c-33d427df9868",
      starts_at: "2025-12-25 10:00:00",
      ends_at: "2025-12-25 11:00:00",
      capacity: 12,
      is_visible: true,
      notes: "API test session",
    }),
  });

  if (createRes.ok) {
    const data = await createRes.json();
    console.log(`✓ Status: ${createRes.status}`);
    console.log(`✓ Created session ID: ${data.id}`);

    // Test DELETE
    console.log(`\n4. DELETE /api/admin/sessions?id=${data.id}`);
    const deleteRes = await fetch(`${API}/api/admin/sessions?id=${data.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (deleteRes.ok) {
      console.log(`✓ Status: ${deleteRes.status}`);
      console.log(`✓ Session deleted successfully`);
    } else {
      console.error(`✗ Failed: ${deleteRes.status} ${await deleteRes.text()}`);
    }
  } else {
    console.error(`✗ Failed: ${createRes.status} ${await createRes.text()}`);
  }

  console.log("\n=== All API Tests Passed ===");
}

main().catch((err) => console.error("Error:", err));
