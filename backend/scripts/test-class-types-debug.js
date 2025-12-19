// Debug class types endpoint
const API = "http://127.0.0.1:8787";

async function main() {
  // Login as admin
  const loginRes = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@example.com", password: "admin123" }),
  });

  const { token } = await loginRes.json();

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // Get class types
  const typesRes = await fetch(`${API}/api/admin/class-types`, {
    headers: authHeaders,
  });

  console.log("Status:", typesRes.status);
  const data = await typesRes.json();
  console.log("Response:", JSON.stringify(data, null, 2));
}

main().catch((err) => console.error("Error:", err));
