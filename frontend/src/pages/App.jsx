import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getDisplayName } from '../lib/displayName';

export function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #ddd'
      }}>
        <h1>App Dashboard</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </header>

      <div>
        <h2>Welcome, {getDisplayName(user)}!</h2>
        <p>Role: {user?.role}</p>
        <p>User ID: {user?.id}</p>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <p>You're successfully logged in and viewing a protected route.</p>
      </div>

      <div style={{ marginTop: '2rem' }}>
        {user?.role === 'client' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-lg)',
            maxWidth: '800px'
          }}>
            <button
              onClick={() => navigate('/app/book')}
              style={{
                padding: 'var(--space-lg)',
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-lg)',
                fontWeight: 600,
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              📅 Book Sessions
            </button>
            <button
              onClick={() => navigate('/app/workouts')}
              style={{
                padding: 'var(--space-lg)',
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-text)',
                border: 'none',
                borderRadius: 'var(--radius)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-lg)',
                fontWeight: 600,
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              💪 My Workouts
            </button>
            <button
              onClick={() => navigate('/app/credits')}
              style={{
                padding: 'var(--space-lg)',
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-text)',
                border: 'none',
                borderRadius: 'var(--radius)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-lg)',
                fontWeight: 600,
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              🎫 My Credits
            </button>
            <button
              onClick={() => navigate('/app/rewards')}
              style={{
                padding: 'var(--space-lg)',
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-text)',
                border: 'none',
                borderRadius: 'var(--radius)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-lg)',
                fontWeight: 600,
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              ⭐ Rewards
            </button>
            <button
              onClick={() => navigate('/app/membership')}
              style={{
                padding: 'var(--space-lg)',
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-text)',
                border: 'none',
                borderRadius: 'var(--radius)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-lg)',
                fontWeight: 600,
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              🎟️ Membership
            </button>
            <button
              onClick={() => navigate('/app/intake')}
              style={{
                padding: 'var(--space-lg)',
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-text)',
                border: 'none',
                borderRadius: 'var(--radius)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-lg)',
                fontWeight: 600,
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              📋 Intake Forms
            </button>
          </div>
        )}
        {user?.role === 'admin' && (
          <button
            onClick={() => navigate('/app/admin')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            Admin Panel
          </button>
        )}
      </div>
    </div>
  );
}