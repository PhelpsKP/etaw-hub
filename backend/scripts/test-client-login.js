// Test client login
const API = "http://127.0.0.1:8787";

async function main() {
  console.log("=== Testing Client Login ===\n");

  // Try to login as client
  console.log("Attempting to login as client@example.com...");
  const loginRes = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "client@example.com", password: "client123" }),
  });

  console.log("Status:", loginRes.status);
  const data = await loginRes.json();
  console.log("Response:", JSON.stringify(data, null, 2));

  if (loginRes.ok) {
    console.log("\n✓ Client login successful");
    console.log("Token:", data.token);
  } else {
    console.log("\n✗ Client login failed");
    console.log("This user may not exist. Need to create it via signup first.");
  }
}

main().catch((err) => console.error("Error:", err));
