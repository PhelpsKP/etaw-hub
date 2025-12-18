import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Home() {
  const { user } = useAuth();

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '4rem auto', 
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h1>Welcome to Elite Training & Wellness Hub</h1>
      
      {user ? (
        <div style={{ marginTop: '2rem' }}>
          <p>You're logged in as: <strong>{user.email}</strong></p>
          <Link 
            to="/app"
            style={{
              display: 'inline-block',
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px'
            }}
          >
            Go to App
          </Link>
        </div>
      ) : (
        <div style={{ marginTop: '2rem' }}>
          <Link 
            to="/login"
            style={{
              display: 'inline-block',
              margin: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px'
            }}
          >
            Login
          </Link>
          <Link 
            to="/signup"
            style={{
              display: 'inline-block',
              margin: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#28a745',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px'
            }}
          >
            Sign Up
          </Link>
        </div>
      )}
    </div>
  );
}