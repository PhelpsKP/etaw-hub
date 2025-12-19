// Test bookings admin functionality
const API = "http://127.0.0.1:8787";

async function main() {
  console.log("=== Testing Bookings Admin ===\n");

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

  // Test GET /api/admin/bookings
  console.log("2. GET /api/admin/bookings (list all)");
  const listRes = await fetch(`${API}/api/admin/bookings`, {
    headers: authHeaders,
  });

  if (listRes.ok) {
    const data = await listRes.json();
    console.log(`✓ Status: ${listRes.status}`);
    console.log(`✓ Found ${data.bookings.length} booking(s)`);

    if (data.bookings.length > 0) {
      const sample = data.bookings[0];
      console.log(`✓ Sample booking fields:`);
      console.log(`  - id: ${sample.id}`);
      console.log(`  - user_email: ${sample.user_email}`);
      console.log(`  - class_type_name: ${sample.class_type_name || 'N/A'}`);
      console.log(`  - session_starts_at: ${sample.session_starts_at}`);
      console.log(`  - session_ends_at: ${sample.session_ends_at || 'N/A'}`);
      console.log(`  - status: ${sample.status}`);
      console.log(`  - booked_at: ${sample.booked_at}`);

      // Test cancel on first active booking
      const activeBooking = data.bookings.find(b => b.status === 'booked');
      if (activeBooking) {
        console.log(`\n3. POST /api/admin/bookings/cancel (booking_id=${activeBooking.id})`);
        const cancelRes = await fetch(`${API}/api/admin/bookings/cancel`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({ booking_id: activeBooking.id }),
        });

        if (cancelRes.ok) {
          const cancelData = await cancelRes.json();
          console.log(`✓ Status: ${cancelRes.status}`);
          console.log(`✓ Booking cancelled successfully`);
          console.log(`✓ Refunded: ${cancelData.refunded}`);

          // Verify it's now cancelled
          console.log(`\n4. Verify booking is cancelled`);
          const verifyRes = await fetch(`${API}/api/admin/bookings`, {
            headers: authHeaders,
          });

          if (verifyRes.ok) {
            const verifyData = await verifyRes.json();
            const cancelledBooking = verifyData.bookings.find(b => b.id === activeBooking.id);
            if (cancelledBooking && cancelledBooking.status === 'cancelled') {
              console.log(`✓ Confirmed: Booking status is now 'cancelled'`);
            } else {
              console.log(`✗ Error: Booking status not updated`);
            }
          }
        } else {
          const errorData = await cancelRes.json();
          console.log(`✗ Failed: ${cancelRes.status} ${errorData.error}`);
        }
      } else {
        console.log(`\n3. No active bookings to test cancellation`);
      }
    }
  } else {
    console.log(`✗ Failed: ${listRes.status} ${await listRes.text()}`);
  }

  console.log("\n=== Tests Complete ===");
  console.log("\nBrowser Test Steps:");
  console.log("1. Open http://localhost:5173/");
  console.log("2. Login as admin@example.com / admin123");
  console.log("3. Click Bookings tab");
  console.log("4. Verify table shows booking ID, class type, times, email, status");
  console.log("5. Click Cancel on an active booking");
  console.log("6. Verify 'Cancelling...' shows, then success message");
  console.log("7. Verify booking status changes to cancelled");
}

main().catch((err) => console.error("Error:", err));
