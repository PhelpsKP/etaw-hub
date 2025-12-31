import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function RoleRedirect() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for auth check to complete
    if (loading) return;

    // If no user, redirect to login
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    // Redirect based on role
    if (user.role === 'admin') {
      navigate('/app/admin', { replace: true });
    } else {
      // Default to booking for clients
      navigate('/app/book', { replace: true });
    }
  }, [user, loading, navigate]);

  // Show nothing while loading or redirecting
  return null;
}
