import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Container } from './Container';

export function SiteNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav style={{
      backgroundColor: 'white',
      borderBottom: '1px solid var(--color-border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <Container>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: '70px',
          gap: 'var(--space-lg)'
        }}>
          <Link to="/" style={{
            fontSize: 'var(--font-size-xl)',
            fontWeight: 700,
            color: 'var(--color-primary)',
            textDecoration: 'none'
          }}>
            Elite Training & Wellness
          </Link>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-lg)'
          }}>
            <Link to="/" style={{ fontWeight: 500 }}>Home</Link>
            <Link to="/services" style={{ fontWeight: 500 }}>Services</Link>
            <Link to="/about" style={{ fontWeight: 500 }}>About</Link>
            <Link to="/book" style={{ fontWeight: 500 }}>Book Online</Link>

            {user ? (
              <>
                <Link to="/app" className="btn btn-sm btn-secondary">Dashboard</Link>
                <button onClick={handleLogout} className="btn btn-sm" style={{
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-light)'
                }}>
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-sm btn-primary">Log In</Link>
            )}
          </div>
        </div>
      </Container>
    </nav>
  );
}
