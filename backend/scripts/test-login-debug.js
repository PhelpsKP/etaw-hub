// Debug login response
const API = "http://127.0.0.1:8787";

async function main() {
  const loginRes = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@example.com", password: "admin123" }),
  });

  console.log("Status:", loginRes.status);
  const data = await loginRes.json();
  console.log("Response:", JSON.stringify(data, null, 2));
}

main().catch((err) => console.error("Error:", err));
