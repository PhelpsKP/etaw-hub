import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiRequestJson } from '../lib/api';

export function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('sessions');

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

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ borderBottom: '2px solid #ddd', display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => setActiveTab('sessions')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderBottom: activeTab === 'sessions' ? '3px solid #007bff' : 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontWeight: activeTab === 'sessions' ? 'bold' : 'normal'
            }}
          >
            Sessions
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderBottom: activeTab === 'bookings' ? '3px solid #007bff' : 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontWeight: activeTab === 'bookings' ? 'bold' : 'normal'
            }}
          >
            Bookings
          </button>
          <button
            onClick={() => setActiveTab('credits')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderBottom: activeTab === 'credits' ? '3px solid #007bff' : 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontWeight: activeTab === 'credits' ? 'bold' : 'normal'
            }}
          >
            Credits
          </button>
          <button
            onClick={() => setActiveTab('exercises')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderBottom: activeTab === 'exercises' ? '3px solid #007bff' : 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontWeight: activeTab === 'exercises' ? 'bold' : 'normal'
            }}
          >
            Exercises
          </button>
          <button
            onClick={() => setActiveTab('workouts')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderBottom: activeTab === 'workouts' ? '3px solid #007bff' : 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontWeight: activeTab === 'workouts' ? 'bold' : 'normal'
            }}
          >
            Workouts
          </button>
        </div>
      </div>

      {activeTab === 'sessions' && <SessionsTab />}
      {activeTab === 'bookings' && <BookingsTab />}
      {activeTab === 'credits' && <CreditsTab />}
      {activeTab === 'exercises' && <PlaceholderTab name="Exercises" />}
      {activeTab === 'workouts' && <PlaceholderTab name="Workouts" />}
    </div>
  );
}

function PlaceholderTab({ name }) {
  return (
    <div style={{ padding: '1rem' }}>
      <h2>{name}</h2>
      <p>This tab is not yet implemented.</p>
    </div>
  );
}

function CreditsTab() {
  const [creditTypes, setCreditTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    credit_type_id: '',
    quantity: '1'
  });

  useEffect(() => {
    fetchCreditTypes();
  }, []);

  async function fetchCreditTypes() {
    try {
      setLoading(true);
      setError(null);
      const data = await apiRequestJson('/api/admin/credit-types');
      setCreditTypes(data.creditTypes || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGrantCredits(e) {
    e.preventDefault();

    if (!formData.user_id || !formData.credit_type_id || !formData.quantity) {
      setError('All fields are required');
      return;
    }

    const quantity = parseInt(formData.quantity, 10);
    if (isNaN(quantity) || quantity <= 0) {
      setError('Quantity must be a positive number');
      return;
    }

    const userId = parseInt(formData.user_id, 10);
    if (isNaN(userId) || userId <= 0) {
      setError('User ID must be a valid positive number');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      const data = await apiRequestJson('/api/admin/credits/adjust', {
        method: 'POST',
        body: JSON.stringify({
          user_id: userId,
          credit_type_id: formData.credit_type_id,
          delta: quantity,
          reason: `Admin grant: ${quantity} credits`
        })
      });

      setSuccessMessage(`Successfully granted ${quantity} credits! New balance: ${data.balance}`);
      setFormData({
        user_id: '',
        credit_type_id: '',
        quantity: '1'
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div style={{ padding: '1rem' }}>Loading credit types...</div>;
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Grant Credits</h2>

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

      <form onSubmit={handleGrantCredits} style={{ maxWidth: '500px', marginTop: '1rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            User ID:
          </label>
          <input
            type="number"
            value={formData.user_id}
            onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
            placeholder="Enter user ID (e.g., 2)"
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Credit Type:
          </label>
          <select
            value={formData.credit_type_id}
            onChange={(e) => setFormData({ ...formData, credit_type_id: e.target.value })}
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          >
            <option value="">Select a credit type...</option>
            {creditTypes.map((ct) => (
              <option key={ct.id} value={ct.id}>
                {ct.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Quantity:
          </label>
          <input
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            min="1"
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: submitting ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: submitting ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}
        >
          {submitting ? 'Granting...' : 'Grant Credits'}
        </button>
      </form>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#6c757d' }}>
          <strong>Tip:</strong> To find a user's ID, check the signup response or database.
          Admin user ID is typically 1, first client is typically 2.
        </p>
      </div>
    </div>
  );
}

function SessionsTab() {
  const [sessions, setSessions] = useState([]);
  const [classTypes, setClassTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    class_type_id: '',
    starts_at: '',
    ends_at: '',
    capacity: '10',
    is_visible: true,
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchSessions();
    fetchClassTypes();
  }, []);

  async function fetchSessions() {
    try {
      setLoading(true);
      setError(null);
      const data = await apiRequestJson('/api/admin/sessions');
      setSessions(data.sessions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchClassTypes() {
    try {
      const data = await apiRequestJson('/api/admin/class-types');
      setClassTypes(data.classTypes || []);
    } catch (err) {
      console.error('Failed to fetch class types:', err);
    }
  }

  async function handleCreateSession(e) {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      // Convert datetime-local format (YYYY-MM-DDTHH:mm) to ISO with seconds
      const startsAt = formData.starts_at ? `${formData.starts_at}:00` : '';
      const endsAt = formData.ends_at ? `${formData.ends_at}:00` : '';

      await apiRequestJson('/api/admin/sessions', {
        method: 'POST',
        body: JSON.stringify({
          class_type_id: formData.class_type_id,
          starts_at: startsAt,
          ends_at: endsAt,
          capacity: parseInt(formData.capacity),
          is_visible: formData.is_visible,
          notes: formData.notes || undefined
        })
      });

      setSuccessMessage('Session created successfully');
      setShowCreateForm(false);
      setFormData({
        class_type_id: '',
        starts_at: '',
        ends_at: '',
        capacity: '10',
        is_visible: true,
        notes: ''
      });
      await fetchSessions();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteSession(sessionId) {
    if (!confirm('Are you sure you want to delete this session?')) {
      return;
    }

    try {
      setDeletingId(sessionId);
      setError(null);
      setSuccessMessage(null);
      await apiRequestJson(`/api/admin/sessions?id=${sessionId}`, {
        method: 'DELETE'
      });
      setSuccessMessage('Session deleted successfully');
      await fetchSessions();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return <div style={{ padding: '1rem' }}>Loading sessions...</div>;
  }

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Sessions</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: showCreateForm ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {showCreateForm ? 'Cancel' : 'Create Session'}
        </button>
      </div>

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

      {showCreateForm && (
        <form onSubmit={handleCreateSession} style={{
          padding: '1rem',
          border: '1px solid #ddd',
          borderRadius: '4px',
          marginBottom: '1rem',
          backgroundColor: '#f8f9fa'
        }}>
          <h3>Create New Session</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem' }}>
                Class Type:
              </label>
              <select
                value={formData.class_type_id}
                onChange={(e) => setFormData({ ...formData, class_type_id: e.target.value })}
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="">Select a class type...</option>
                {classTypes.map((ct) => (
                  <option key={ct.id} value={ct.id}>
                    {ct.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem' }}>
                Starts At:
              </label>
              <input
                type="datetime-local"
                value={formData.starts_at}
                onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem' }}>
                Ends At:
              </label>
              <input
                type="datetime-local"
                value={formData.ends_at}
                onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem' }}>
                Capacity:
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                required
                min="1"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={formData.is_visible}
                  onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                />
                Visible to clients
              </label>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem' }}>
                Notes (optional):
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows="3"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '0.75rem',
                backgroundColor: submitting ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: submitting ? 'not-allowed' : 'pointer'
              }}
            >
              {submitting ? 'Creating...' : 'Create Session'}
            </button>
          </div>
        </form>
      )}

      {sessions.length === 0 ? (
        <p>No sessions found.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Class Type</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Starts At</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Ends At</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Capacity</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Visible</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Notes</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id}>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                    {session.class_type_name || session.class_type_id}
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{session.starts_at}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{session.ends_at}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{session.capacity}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                    {session.is_visible ? 'Yes' : 'No'}
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                    {session.notes || '-'}
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      disabled={deletingId === session.id}
                      style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: deletingId === session.id ? '#6c757d' : '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: deletingId === session.id ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      {deletingId === session.id ? 'Deleting...' : 'Delete'}
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

function BookingsTab() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      setLoading(true);
      setError(null);
      const data = await apiRequestJson('/api/admin/bookings');
      setBookings(data.bookings || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      setCancellingId(bookingId);
      setError(null);
      setSuccessMessage(null);
      await apiRequestJson('/api/admin/bookings/cancel', {
        method: 'POST',
        body: JSON.stringify({ booking_id: bookingId })
      });
      setSuccessMessage('Booking cancelled successfully');
      await fetchBookings();
    } catch (err) {
      setError(err.message);
    } finally {
      setCancellingId(null);
    }
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

  if (loading) {
    return <div style={{ padding: '1rem' }}>Loading bookings...</div>;
  }

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Bookings</h2>
      </div>

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

      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Booking ID</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Class Type</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Session Start</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Session End</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Client Email</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Status</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Booked At</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                    {booking.id}
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                    {booking.class_type_name || '-'}
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                    {formatDateTime(booking.session_starts_at)}
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                    {formatDateTime(booking.session_ends_at)}
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                    {booking.user_email}
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      backgroundColor: booking.status === 'booked' ? '#d4edda' : '#f8d7da',
                      color: booking.status === 'booked' ? '#155724' : '#721c24'
                    }}>
                      {booking.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                    {formatDateTime(booking.booked_at)}
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                    {booking.status === 'booked' && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        disabled={cancellingId === booking.id}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: cancellingId === booking.id ? '#6c757d' : '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: cancellingId === booking.id ? 'not-allowed' : 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        {cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}
                    {booking.status === 'cancelled' && (
                      <span style={{ color: '#6c757d', fontSize: '0.875rem' }}>Cancelled</span>
                    )}
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
