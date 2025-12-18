import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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
        <h2>Welcome, {user?.email}!</h2>
        <p>Role: {user?.role}</p>
        <p>User ID: {user?.id}</p>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <p>You're successfully logged in and viewing a protected route.</p>
      </div>
    </div>
  );
}