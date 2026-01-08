import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Container } from './Container';
import logo from '../assets/images/branding/elite-logo-transparent-001.png';

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
          minHeight: '100px',
          gap: 'var(--space-md)',
          flexWrap: 'wrap'
        }}>
          <Link to="/" style={{ display: 'inline-block' }}>
            <img
              src={logo}
              alt="Elite Training & Wellness"
              style={{
                maxHeight: '80px',
                display: 'block',
                cursor: 'pointer'
              }}
            />
          </Link>

          <div className="nav-links" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-lg)',
            flexWrap: 'wrap'
          }}>
            <Link to="/services" style={{ fontWeight: 500 }} className="nav-link">Services</Link>
            <Link to="/about" style={{ fontWeight: 500 }} className="nav-link">Our Approach</Link>
            <Link to="/book" style={{ fontWeight: 500 }} className="nav-link">Book Online</Link>

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
