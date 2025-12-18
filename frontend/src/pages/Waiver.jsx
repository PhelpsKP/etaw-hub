import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://127.0.0.1:8787";

export function Waiver() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [waiver, setWaiver] = useState(null);
  const [signed, setSigned] = useState(false);
  const [signedName, setSignedName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setError("");
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const res = await fetch(`${API}/api/waiver/status`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      setError("Failed to load waiver status.");
      setLoading(false);
      return;
    }

    const data = await res.json();
    setWaiver(data.waiver);
    setSigned(data.signed);
    setLoading(false);

    if (data.signed) {
      // If already signed, send them into app
      navigate("/app", { replace: true });
    }
  }

  async function handleSign(e) {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("token");
    if (!token) return navigate("/login", { replace: true });

    const res = await fetch(`${API}/api/waiver/sign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ signed_name: signedName }),
    });

    if (!res.ok) {
      const msg = await res.json().catch(() => ({}));
      setError(msg.error || "Failed to sign waiver.");
      return;
    }

    navigate("/app", { replace: true });
  }

  if (loading) return <div style={{ padding: 24 }}>Loading waiver...</div>;

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 24 }}>
      <h1>{waiver?.title || "Waiver"}</h1>
      <div style={{ whiteSpace: "pre-wrap", marginTop: 16, padding: 16, border: "1px solid #ddd", borderRadius: 8 }}>
        {waiver?.body || "No waiver text found."}
      </div>

      <div style={{ marginTop: 24 }}>
        <h3>Sign to continue</h3>
        {error && <div style={{ color: "crimson", marginBottom: 12 }}>{error}</div>}

        <form onSubmit={handleSign}>
          <label style={{ display: "block", marginBottom: 8 }}>Full name</label>
          <input
            value={signedName}
            onChange={(e) => setSignedName(e.target.value)}
            style={{ width: "100%", padding: 10, fontSize: 16 }}
            placeholder="Type your full legal name"
          />
          <button style={{ marginTop: 12, padding: "10px 16px", fontSize: 16 }} type="submit">
            I Agree and Sign
          </button>
        </form>
      </div>
    </div>
  );
}