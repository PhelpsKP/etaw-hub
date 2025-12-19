import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiRequestJson } from '../lib/api';

export function Book() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [bookingId, setBookingId] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  // Client-only guard: redirect admins away from this page
  useEffect(() => {
    if (user && user.role !== 'client') {
      if (user.role === 'admin') {
        navigate('/app/admin', { replace: true });
      } else {
        navigate('/app', { replace: true });
      }
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
