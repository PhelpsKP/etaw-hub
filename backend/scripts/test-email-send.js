const BASE_URL = "http://127.0.0.1:8787";

async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  return data.token;
}

async function request(method, path, token, body = null) {
  const opts = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, opts);
  return { status: res.status, data: await res.json().catch(() => null) };
}

async function main() {
  console.log("=== Testing Email Sending ===\n");

  // Get test email from command line argument or use default
  const testEmail = process.argv[2] || "test@example.com";
  console.log(`Target email: ${testEmail}\n`);

  // Login as admin
  console.log("1. Logging in as admin...");
  const adminToken = await login("admin@example.com", "admin123");
  console.log("✓ Logged in as admin\n");

  // Send test email
  console.log("2. Sending test email...");
  const emailRes = await request("POST", "/dev/test-email", adminToken, {
    to: testEmail,
  });

  console.log(`Status: ${emailRes.status}`);
  console.log(`Response:`, JSON.stringify(emailRes.data, null, 2));

  if (emailRes.status === 200 && emailRes.data.ok) {
    console.log("\n✓ TEST PASSED");
    console.log(`\nEmail sent to ${testEmail}. Check your inbox!`);
  } else {
    console.log("\n✗ TEST FAILED");
    if (emailRes.data?.error) {
      console.log(`Error: ${emailRes.data.error}`);
    }
  }
}

main().catch(console.error);
