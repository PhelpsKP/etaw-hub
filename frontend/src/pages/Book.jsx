import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { apiRequestJson } from '../lib/api';

export function Book() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [bookingId, setBookingId] = useState(null);
  const [membershipData, setMembershipData] = useState(null);
  const [membershipLoading, setMembershipLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
    fetchMembership();
  }, []);

  // Client-only guard: redirect admins away from this page
  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/app/admin', { replace: true });
    }
  }, [user, navigate]);

  async function fetchSessions() {
    try {
      setLoading(true);
      setError(null);
      const data = await apiRequestJson('/api/sessions');
      setSessions(data.sessions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMembership() {
    try {
      setMembershipLoading(true);
      const data = await apiRequestJson('/api/membership/status');
      setMembershipData(data);
    } catch (err) {
      // Silently fail - membership is optional
      console.error('Failed to fetch membership:', err);
    } finally {
      setMembershipLoading(false);
    }
  }

  async function handleBookSession(sessionId) {
    if (!confirm('Book this session?')) {
      return;
    }

    try {
      setBookingId(sessionId);
      setError(null);
      setSuccessMessage(null);
      const data = await apiRequestJson('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({ session_id: sessionId })
      });
      setSuccessMessage(`Session booked successfully! (Booking ID: ${data.booking_id})`);
      await fetchSessions();
    } catch (err) {
      setError(err.message);
    } finally {
      setBookingId(null);
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return '-';
    try {
      const date = new Date(dateTimeStr);
      return date.toLocaleString();
    } catch {
      return dateTimeStr;
    }
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
        <div>
          <h1>Book a Session</h1>
          <button
            onClick={() => navigate('/app')}
            style={{
              marginTop: '0.5rem',
              padding: '0.25rem 0.75rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
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

      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          marginBottom: '1rem',
          color: '#721c24'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {successMessage && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '4px',
          marginBottom: '1rem',
          color: '#155724'
        }}>
          {successMessage}
        </div>
      )}

      {/* Membership Status Card */}
      {!membershipLoading && <div data-testid="membership-loaded" style={{display:'none'}} />}
      {!membershipLoading && membershipData && (
        <div data-testid="membership-card" style={{
          padding: '1.5rem',
          backgroundColor: membershipData.membership ? '#e9d5ff' : '#f3f4f6',
          border: `2px solid ${membershipData.membership ? 'var(--color-primary)' : '#e5e7eb'}`,
          borderRadius: '8px',
          marginBottom: '1.5rem'
        }}>
          {membershipData.membership ? (
            <>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                    {membershipData.hasUnlimited ? 'Unlimited Membership Active' : 'Membership Active'}
                  </h3>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                    {membershipData.membership.plan === 'circuit' ? 'Circuit Training' : membershipData.membership.plan}
                    {membershipData.membership.ends_at && ` • Expires ${new Date(membershipData.membership.ends_at).toLocaleDateString()}`}
                  </p>
                </div>
                <Link
                  to="/app/membership"
                  data-testid="membership-details-link"
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-block'
                  }}
                >
                  View Details
                </Link>
              </div>
              {membershipData.hasUnlimited && (
                <p style={{
                  margin: '0.5rem 0 0 0',
                  fontSize: '0.875rem',
                  color: '#4b5563',
                  backgroundColor: 'white',
                  padding: '0.75rem',
                  borderRadius: '4px'
                }}>
                  <strong>Unlimited Access:</strong> No credits required for circuit training sessions!
                </p>
              )}
            </>
          ) : (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: '#6b7280' }}>
                  No Active Membership
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#9ca3af' }}>
                  You can still book sessions using your available credits
                </p>
              </div>
              <Link
                to="/app/membership"
                data-testid="membership-learnmore-link"
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-block'
                }}
              >
                Learn More
              </Link>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div>Loading available sessions...</div>
      ) : sessions.length === 0 ? (
        <div>
          <p>No sessions available to book at this time.</p>
          <p style={{ marginTop: '1rem', color: '#6c757d' }}>
            Check back later or contact the admin to create sessions.
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Class Type</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Starts At</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Ends At</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Capacity</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id}>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                    {session.class_type?.name || '-'}
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                    {formatDateTime(session.starts_at)}
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                    {formatDateTime(session.ends_at)}
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                    {session.capacity}
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                    <button
                      onClick={() => handleBookSession(session.id)}
                      disabled={bookingId === session.id}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: bookingId === session.id ? '#6c757d' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: bookingId === session.id ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      {bookingId === session.id ? 'Booking...' : 'Book'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
