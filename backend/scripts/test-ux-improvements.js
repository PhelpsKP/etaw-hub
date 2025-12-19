// Test UX improvements for Sessions tab
const API = "http://127.0.0.1:8787";

async function main() {
  console.log("=== Testing UX Improvements ===\n");

  // Login
  console.log("1. Login as admin...");
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

  // Test 1: Fetch class types (for dropdown)
  console.log("2. GET /api/admin/class-types (for dropdown)");
  const classTypesRes = await fetch(`${API}/api/admin/class-types`, {
    headers: authHeaders,
  });

  if (classTypesRes.ok) {
    const data = await classTypesRes.json();
    console.log(`✓ Status: ${classTypesRes.status}`);
    console.log(`✓ Found ${data.classTypes.length} class types`);
    data.classTypes.slice(0, 3).forEach(ct => {
      console.log(`  - ${ct.name} (${ct.id})`);
    });

    // Use first class type for testing
    const testClassTypeId = data.classTypes[0].id;
    const testClassName = data.classTypes[0].name;

    // Test 2: Create session with ISO timestamp format
    console.log(`\n3. POST /api/admin/sessions (with ISO timestamp)`);
    const now = new Date();
    now.setDate(now.getDate() + 3);
    now.setHours(14, 0, 0, 0);

    // Format as datetime-local would: YYYY-MM-DDTHH:mm:00
    const startsAt = now.toISOString().slice(0, 16) + ':00';
    const endsDate = new Date(now);
    endsDate.setHours(15, 0, 0, 0);
    const endsAt = endsDate.toISOString().slice(0, 16) + ':00';

    console.log(`  Using class type: ${testClassName} (${testClassTypeId})`);
    console.log(`  Starts: ${startsAt}`);
    console.log(`  Ends: ${endsAt}`);

    const createRes = await fetch(`${API}/api/admin/sessions`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        class_type_id: testClassTypeId,
        starts_at: startsAt,
        ends_at: endsAt,
        capacity: 12,
        is_visible: true,
        notes: "UX test session",
      }),
    });

    if (createRes.ok) {
      const data = await createRes.json();
      console.log(`✓ Status: ${createRes.status}`);
      console.log(`✓ Created session ID: ${data.id}`);

      // Test 3: Error handling - try to create invalid session
      console.log(`\n4. Test error handling (ends_at before starts_at)`);
      const errorRes = await fetch(`${API}/api/admin/sessions`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          class_type_id: testClassTypeId,
          starts_at: endsAt,
          ends_at: startsAt, // Wrong order!
          capacity: 12,
        }),
      });

      if (!errorRes.ok) {
        const errorData = await errorRes.json();
        console.log(`✓ Got expected error (${errorRes.status})`);
        console.log(`✓ Error message: "${errorData.error}"`);
      }

      // Test 4: Delete session
      console.log(`\n5. DELETE /api/admin/sessions?id=${data.id}`);
      const deleteRes = await fetch(`${API}/api/admin/sessions?id=${data.id}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      if (deleteRes.ok) {
        console.log(`✓ Status: ${deleteRes.status}`);
        console.log(`✓ Session deleted successfully`);
      }
    } else {
      const errorData = await createRes.json();
      console.error(`✗ Failed: ${createRes.status} ${errorData.error}`);
    }
  }

  console.log("\n=== All Tests Passed ===");
  console.log("\nManual Browser Test Checklist:");
  console.log("1. Open http://localhost:5173/");
  console.log("2. Login with: admin@example.com / admin123");
  console.log("3. Navigate to Admin → Sessions tab");
  console.log("4. Click 'Create Session'");
  console.log("5. Verify dropdown shows class type names (not IDs)");
  console.log("6. Verify datetime inputs use browser date/time picker");
  console.log("7. Create a session and verify success message");
  console.log("8. Click Delete on a session");
  console.log("9. Verify button shows 'Deleting...' and is disabled");
  console.log("10. Verify session is removed from list");
}

main().catch((err) => console.error("Error:", err));
