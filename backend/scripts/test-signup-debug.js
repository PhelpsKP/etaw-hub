// Debug signup response
const API = "http://127.0.0.1:8787";

async function main() {
  const signupRes = await fetch(`${API}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "testuser" + Date.now() + "@example.com",
      password: "test123",
      first_name: "Test",
      last_name: "User"
    }),
  });

  console.log("Status:", signupRes.status);
  const data = await signupRes.json();
  console.log("Response:", JSON.stringify(data, null, 2));
}

main().catch((err) => console.error("Error:", err));
