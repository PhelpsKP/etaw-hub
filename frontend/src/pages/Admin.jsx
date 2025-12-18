import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function Admin() {
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
        <h1>Admin Panel</h1>
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

      <div style={{
        padding: '1rem',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '4px',
        marginBottom: '2rem'
      }}>
        <strong>⚠️ Admin Access Only</strong>
        <p>This page is only visible to users with the "admin" role.</p>
      </div>

      <div>
        <h2>Admin: {user?.email}</h2>
        <p>User ID: {user?.id}</p>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>Admin Actions</h3>
        <p>This is where admin-specific functionality would go.</p>
      </div>
    </div>
  );
}