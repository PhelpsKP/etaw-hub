import { useEffect, useState, useRef } from "react";
import { Navigate } from "react-router-dom";
import { API_BASE_URL } from "../lib/api";

const WAIVER_CACHE_KEY = 'waiver:signed';
const WAIVER_CACHE_TOKEN_KEY = 'waiver:token';

function getInitialWaiverState() {
  const token = localStorage.getItem("token");
  if (!token) return { loading: false, signed: false };

  const cachedToken = sessionStorage.getItem(WAIVER_CACHE_TOKEN_KEY);
  const cachedSigned = sessionStorage.getItem(WAIVER_CACHE_KEY);

  if (cachedToken === token && (cachedSigned === "true" || cachedSigned === "false")) {
    return { loading: false, signed: cachedSigned === "true" };
  }

  return { loading: true, signed: false };
}

export function WaiverGate({ children }) {
  const initialState = getInitialWaiverState();
  const [loading, setLoading] = useState(initialState.loading);
  const [signed, setSigned] = useState(initialState.signed);
  const [error, setError] = useState(null);
  const ranRef = useRef(false);

  useEffect(() => {
    // Prevent StrictMode double-invoke
    if (ranRef.current) return;
    ranRef.current = true;

    let didCancel = false;

    (async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        // No token - clear cache and set unsigned
        sessionStorage.removeItem(WAIVER_CACHE_KEY);
        sessionStorage.removeItem(WAIVER_CACHE_TOKEN_KEY);
        if (!didCancel) {
          setLoading(false);
          setSigned(false);
        }
        return;
      }

      // Check cache
      const cachedToken = sessionStorage.getItem(WAIVER_CACHE_TOKEN_KEY);
      const cachedSigned = sessionStorage.getItem(WAIVER_CACHE_KEY);

      if (cachedToken === token && (cachedSigned === "true" || cachedSigned === "false")) {
        // Valid cache - use it
        if (!didCancel) {
          setSigned(cachedSigned === "true");
          setLoading(false);
        }
        return;
      }

      // No valid cache - fetch fresh

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const url = `${API_BASE_URL}/api/waiver/status`;
        console.log('[WaiverGate] Fetching fresh waiver status');

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (!res.ok) {
          // Treat failure as not signed to be safe
          if (!didCancel) {
            setSigned(false);
            setLoading(false);
            // Cache the negative result
            sessionStorage.setItem(WAIVER_CACHE_TOKEN_KEY, token);
            sessionStorage.setItem(WAIVER_CACHE_KEY, "false");
          }
          return;
        }

        const data = await res.json();
        const isSigned = !!data.signed;

        if (!didCancel) {
          setSigned(isSigned);
          // Cache the result
          sessionStorage.setItem(WAIVER_CACHE_TOKEN_KEY, token);
          sessionStorage.setItem(WAIVER_CACHE_KEY, String(isSigned));
          console.log('[WaiverGate] Cached waiver status:', isSigned);
        }
      } catch (err) {
        if (didCancel) return; // Component unmounted, ignore

        console.log('[WaiverGate] Fetch error:', err.name, err.message);
        if (err?.name === 'AbortError') {
          // Timeout fired, show retry UI
          setError('Waiver check timed out. Please try again.');
        } else {
          setError(`Failed to check waiver status: ${err.message}`);
        }
        setSigned(false);
      } finally {
        clearTimeout(timeoutId);
        if (!didCancel) {
          setLoading(false);
        }
      }
    })();

    return () => {
      didCancel = true;
      ranRef.current = false; // Reset so effect runs on next mount
    };
  }, []);

  function handleRetry() {
    setLoading(true);
    setError(null);
    // Force re-mount by changing a key or just reload
    window.location.reload();
  }

  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;

  if (loading) return <div style={{ padding: 24 }}>Checking waiver...</div>;

  if (error) {
    return (
      <div style={{ padding: 24, maxWidth: 600, margin: '40px auto' }}>
        <h2 style={{ color: 'var(--color-error)' }}>Error</h2>
        <p>{error}</p>
        <button
          onClick={handleRetry}
          style={{
            padding: '10px 20px',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '16px'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!signed) return <Navigate to="/waiver" replace />;

  return children;
}