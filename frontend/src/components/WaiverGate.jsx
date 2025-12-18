import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const API = "http://127.0.0.1:8787";

export function WaiverGate({ children }) {
  const [loading, setLoading] = useState(true);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        setSigned(false);
        return;
      }

      const res = await fetch(`${API}/api/waiver/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        // Treat failure as not signed to be safe
        setLoading(false);
        setSigned(false);
        return;
      }

      const data = await res.json();
      setSigned(!!data.signed);
      setLoading(false);
    })();
  }, []);

  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;

  if (loading) return <div style={{ padding: 24 }}>Checking waiver...</div>;
  if (!signed) return <Navigate to="/waiver" replace />;

  return children;
}