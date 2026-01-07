import { useEffect, useState, useRef } from "react";
import { Navigate } from "react-router-dom";
import { API_BASE_URL } from "../lib/api";

const ONBOARDING_CACHE_KEY = 'onboarding:status';
const ONBOARDING_CACHE_TOKEN_KEY = 'onboarding:token';

function getInitialOnboardingState() {
  const token = localStorage.getItem("token");
  if (!token) return { loading: false, waiverSigned: false, intakeSubmitted: false };

  const cachedToken = sessionStorage.getItem(ONBOARDING_CACHE_TOKEN_KEY);
  const cachedStatus = sessionStorage.getItem(ONBOARDING_CACHE_KEY);

  if (cachedToken === token && cachedStatus) {
    try {
      const status = JSON.parse(cachedStatus);
      return { loading: false, waiverSigned: status.waiverSigned, intakeSubmitted: status.intakeSubmitted };
    } catch {
      return { loading: true, waiverSigned: false, intakeSubmitted: false };
    }
  }

  return { loading: true, waiverSigned: false, intakeSubmitted: false };
}

export function OnboardingGate({ children }) {
  const initialState = getInitialOnboardingState();
  const [loading, setLoading] = useState(initialState.loading);
  const [waiverSigned, setWaiverSigned] = useState(initialState.waiverSigned);
  const [intakeSubmitted, setIntakeSubmitted] = useState(initialState.intakeSubmitted);
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
        // No token - clear cache
        sessionStorage.removeItem(ONBOARDING_CACHE_KEY);
        sessionStorage.removeItem(ONBOARDING_CACHE_TOKEN_KEY);
        if (!didCancel) {
          setLoading(false);
          setWaiverSigned(false);
          setIntakeSubmitted(false);
        }
        return;
      }

      // Check cache
      const cachedToken = sessionStorage.getItem(ONBOARDING_CACHE_TOKEN_KEY);
      const cachedStatus = sessionStorage.getItem(ONBOARDING_CACHE_KEY);

      if (cachedToken === token && cachedStatus) {
        try {
          const status = JSON.parse(cachedStatus);
          if (!didCancel) {
            setWaiverSigned(status.waiverSigned);
            setIntakeSubmitted(status.intakeSubmitted);
            setLoading(false);
          }
          return;
        } catch {
          // Invalid cache, continue to fetch
        }
      }

      // No valid cache - fetch fresh
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        console.log('[OnboardingGate] Fetching fresh onboarding status');

        // Fetch both waiver and intake status in parallel
        const [waiverRes, intakeRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/waiver/status`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }),
          fetch(`${API_BASE_URL}/api/intake/status`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          })
        ]);

        if (!waiverRes.ok || !intakeRes.ok) {
          // Treat failure as not completed to be safe
          if (!didCancel) {
            setWaiverSigned(false);
            setIntakeSubmitted(false);
            setLoading(false);
            // Cache the negative result
            const status = { waiverSigned: false, intakeSubmitted: false };
            sessionStorage.setItem(ONBOARDING_CACHE_TOKEN_KEY, token);
            sessionStorage.setItem(ONBOARDING_CACHE_KEY, JSON.stringify(status));
          }
          return;
        }

        const waiverData = await waiverRes.json();
        const intakeData = await intakeRes.json();

        const isWaiverSigned = !!waiverData.signed;
        const isIntakeSubmitted = !!intakeData.basic_submitted;

        if (!didCancel) {
          setWaiverSigned(isWaiverSigned);
          setIntakeSubmitted(isIntakeSubmitted);
          // Cache the result
          const status = { waiverSigned: isWaiverSigned, intakeSubmitted: isIntakeSubmitted };
          sessionStorage.setItem(ONBOARDING_CACHE_TOKEN_KEY, token);
          sessionStorage.setItem(ONBOARDING_CACHE_KEY, JSON.stringify(status));
          console.log('[OnboardingGate] Cached onboarding status:', status);
        }
      } catch (err) {
        if (didCancel) return;

        console.log('[OnboardingGate] Fetch error:', err.name, err.message);
        if (err?.name === 'AbortError') {
          setError('Onboarding check timed out. Please try again.');
        } else {
          setError(`Failed to check onboarding status: ${err.message}`);
        }
        setWaiverSigned(false);
        setIntakeSubmitted(false);
      } finally {
        clearTimeout(timeoutId);
        if (!didCancel) {
          setLoading(false);
        }
      }
    })();

    return () => {
      didCancel = true;
      ranRef.current = false;
    };
  }, []);

  function handleRetry() {
    setLoading(true);
    setError(null);
    window.location.reload();
  }

  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;

  if (loading) return <div style={{ padding: 24 }}>Checking onboarding status...</div>;

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

  // Check waiver first
  if (!waiverSigned) return <Navigate to="/waiver" replace />;

  // Then check intake
  if (!intakeSubmitted) return <Navigate to="/app/intake" replace />;

  // Both complete - allow access
  return children;
}
