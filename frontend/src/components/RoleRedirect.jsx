import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../lib/api';

export function RoleRedirect() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Wait for auth check to complete
    if (authLoading) return;

    // If no user, redirect to login
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    // Check onboarding status
    (async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login', { replace: true });
          return;
        }

        // Check waiver and intake status
        const [waiverRes, intakeRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/waiver/status`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_BASE_URL}/api/intake/status`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const waiverData = await waiverRes.json();
        const intakeData = await intakeRes.json();

        const waiverSigned = !!waiverData.signed;
        const intakeSubmitted = !!intakeData.basic_submitted;

        // Onboarding flow priority:
        // 1. Waiver first
        if (!waiverSigned) {
          navigate('/waiver', { replace: true });
          return;
        }

        // 2. Intake second
        if (!intakeSubmitted) {
          navigate('/app/intake', { replace: true });
          return;
        }

        // 3. Both complete - redirect based on role
        if (user.role === 'admin') {
          navigate('/app/admin', { replace: true });
        } else {
          navigate('/app/book', { replace: true });
        }
      } catch (err) {
        console.error('[RoleRedirect] Error checking onboarding:', err);
        // On error, send to waiver to be safe
        navigate('/waiver', { replace: true });
      } finally {
        setChecking(false);
      }
    })();
  }, [user, authLoading, navigate]);

  // Show loading while checking
  if (authLoading || checking) {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  return null;
}
