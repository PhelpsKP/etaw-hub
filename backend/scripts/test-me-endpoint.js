// Test /api/me endpoint
const API = "http://127.0.0.1:8787";

async function main() {
  // Login
  const loginRes = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@example.com", password: "admin123" }),
  });

  const { token } = await loginRes.json();

  // Call /api/me
  const meRes = await fetch(`${API}/api/me`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  console.log("Status:", meRes.status);
  const data = await meRes.json();
  console.log("Response:", JSON.stringify(data, null, 2));
}

main().catch((err) => console.error("Error:", err));
