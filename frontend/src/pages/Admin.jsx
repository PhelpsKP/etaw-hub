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
        <div style={{ borderBottom: '2px solid #ddd', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {['calendar', 'sessions', 'bookings', 'clients', 'credits', 'exercises', 'workouts'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderBottom: activeTab === tab ? '3px solid #007bff' : 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontWeight: activeTab === tab ? 'bold' : 'normal',
                textTransform: 'capitalize'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'calendar' && <CalendarTab />}
      {activeTab === 'sessions' && <SessionsTab />}
      {activeTab === 'bookings' && <BookingsTab />}
      {activeTab === 'clients' && <ClientsTab />}
      {activeTab === 'credits' && <CreditsTab />}
      {activeTab === 'exercises' && <ExercisesTab />}
      {activeTab === 'workouts' && <WorkoutsTab />}
    </div>
  );
}

// Calendar Tab - Simple month view
function CalendarTab() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchSessions();
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

  function getDaysInMonth(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  }

  function getSessionsForDate(date) {
    const dateStr = date.toISOString().split('T')[0];
    return sessions.filter(session => {
      const sessionDate = new Date(session.starts_at).toISOString().split('T')[0];
      return sessionDate === dateStr;
    });
  }

  function changeMonth(offset) {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  }

  if (loading) return <div style={{ padding: '1rem' }}>Loading calendar...</div>;

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Calendar</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={() => changeMonth(-1)} className="btn btn-sm btn-secondary">← Prev</button>
          <span style={{ fontWeight: 'bold', minWidth: '150px', textAlign: 'center' }}>{monthName}</span>
          <button onClick={() => changeMonth(1)} className="btn btn-sm btn-secondary">Next →</button>
        </div>
      </div>

      {error && <div style={{ padding: '1rem', backgroundColor: '#f8d7da', borderRadius: '4px', marginBottom: '1rem', color: '#721c24' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '2rem' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>{day}</div>
        ))}
        {Array.from({ length: startingDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} style={{ padding: '0.5rem', minHeight: '80px', backgroundColor: '#f8f9fa' }}></div>
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const daySessions = getSessionsForDate(date);
          const isToday = new Date().toDateString() === date.toDateString();

          return (
            <div key={day} style={{
              padding: '0.5rem',
              minHeight: '80px',
              border: '1px solid #ddd',
              backgroundColor: isToday ? '#e3f2fd' : 'white',
              borderRadius: '4px'
            }}>
              <div style={{ fontWeight: isToday ? 'bold' : 'normal', marginBottom: '0.25rem' }}>{day}</div>
              {daySessions.slice(0, 3).map(session => (
                <div key={session.id} style={{
                  fontSize: '0.7rem',
                  padding: '2px 4px',
                  backgroundColor: '#6b46c1',
                  color: 'white',
                  borderRadius: '2px',
                  marginBottom: '2px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {new Date(session.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {session.class_type_name}
                </div>
              ))}
              {daySessions.length > 3 && (
                <div style={{ fontSize: '0.7rem', color: '#6c757d' }}>+{daySessions.length - 3} more</div>
              )}
            </div>
          );
        })}
      </div>

      <h3>Upcoming Sessions</h3>
      <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
        {sessions.length === 0 ? (
          <p>No sessions scheduled.</p>
        ) : (
          sessions.map(session => (
            <div key={session.id} style={{
              padding: '1rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              marginBottom: '0.5rem',
              backgroundColor: 'white'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong>{session.class_type_name}</strong>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                    {new Date(session.starts_at).toLocaleString()} - {new Date(session.ends_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div style={{ fontSize: '0.875rem' }}>Capacity: {session.capacity} | Visible: {session.is_visible ? 'Yes' : 'No'}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Sessions Tab (unchanged from original)
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
    if (!confirm('Are you sure you want to delete this session?')) return;

    try {
      setDeletingId(sessionId);
      setError(null);
      setSuccessMessage(null);
      await apiRequestJson(`/api/admin/sessions?id=${sessionId}`, { method: 'DELETE' });
      setSuccessMessage('Session deleted successfully');
      await fetchSessions();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) return <div style={{ padding: '1rem' }}>Loading sessions...</div>;

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Sessions</h2>
        <button onClick={() => setShowCreateForm(!showCreateForm)} style={{ padding: '0.5rem 1rem', backgroundColor: showCreateForm ? '#6c757d' : '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {showCreateForm ? 'Cancel' : 'Create Session'}
        </button>
      </div>

      {error && <div style={{ padding: '1rem', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '4px', marginBottom: '1rem', color: '#721c24' }}><strong>Error:</strong> {error}</div>}
      {successMessage && <div style={{ padding: '1rem', backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '4px', marginBottom: '1rem', color: '#155724' }}>{successMessage}</div>}

      {showCreateForm && (
        <form onSubmit={handleCreateSession} style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '1rem', backgroundColor: '#f8f9fa' }}>
          <h3>Create New Session</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem' }}>Class Type:</label>
              <select value={formData.class_type_id} onChange={(e) => setFormData({ ...formData, class_type_id: e.target.value })} required style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                <option value="">Select a class type...</option>
                {classTypes.map((ct) => (
                  <option key={ct.id} value={ct.id}>{ct.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem' }}>Starts At:</label>
              <input type="datetime-local" value={formData.starts_at} onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })} required style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem' }}>Ends At:</label>
              <input type="datetime-local" value={formData.ends_at} onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })} required style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem' }}>Capacity:</label>
              <input type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} required min="1" style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" checked={formData.is_visible} onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })} />
                Visible to clients
              </label>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem' }}>Notes (optional):</label>
              <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows="3" style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
            </div>
            <button type="submit" disabled={submitting} style={{ padding: '0.75rem', backgroundColor: submitting ? '#6c757d' : '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: submitting ? 'not-allowed' : 'pointer' }}>
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
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{session.class_type_name || session.class_type_id}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{session.starts_at}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{session.ends_at}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{session.capacity}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{session.is_visible ? 'Yes' : 'No'}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{session.notes || '-'}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                    <button onClick={() => handleDeleteSession(session.id)} disabled={deletingId === session.id} style={{ padding: '0.25rem 0.5rem', backgroundColor: deletingId === session.id ? '#6c757d' : '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: deletingId === session.id ? 'not-allowed' : 'pointer', fontSize: '0.875rem' }}>
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

// Bookings Tab with Check-in functionality
function BookingsTab() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [checkingInId, setCheckingInId] = useState(null);

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
    if (!confirm('Are you sure you want to cancel this booking?')) return;

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

  async function handleCheckIn(bookingId) {
    if (!confirm('Mark this booking as attended?')) return;

    try {
      setCheckingInId(bookingId);
      setError(null);
      setSuccessMessage(null);
      await apiRequestJson('/api/admin/bookings/checkin', {
        method: 'POST',
        body: JSON.stringify({ booking_id: bookingId })
      });
      setSuccessMessage('Check-in successful! Reward point awarded.');
      await fetchBookings();
    } catch (err) {
      setError(err.message);
    } finally {
      setCheckingInId(null);
    }
  }

  function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return '-';
    try {
      return new Date(dateTimeStr).toLocaleString();
    } catch {
      return dateTimeStr;
    }
  }

  if (loading) return <div style={{ padding: '1rem' }}>Loading bookings...</div>;

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Bookings</h2>
      </div>

      {error && <div style={{ padding: '1rem', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '4px', marginBottom: '1rem', color: '#721c24' }}><strong>Error:</strong> {error}</div>}
      {successMessage && <div style={{ padding: '1rem', backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '4px', marginBottom: '1rem', color: '#155724' }}>{successMessage}</div>}

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
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd', fontSize: '0.75rem', fontFamily: 'monospace' }}>{booking.id}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{booking.class_type_name || '-'}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{formatDateTime(booking.session_starts_at)}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{formatDateTime(booking.session_ends_at)}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{booking.user_email}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                    <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.875rem', backgroundColor: booking.status === 'booked' ? '#d4edda' : '#f8d7da', color: booking.status === 'booked' ? '#155724' : '#721c24' }}>
                      {booking.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{formatDateTime(booking.booked_at)}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                    {booking.status === 'booked' && (
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleCheckIn(booking.id)}
                          disabled={checkingInId === booking.id}
                          style={{ padding: '0.25rem 0.5rem', backgroundColor: checkingInId === booking.id ? '#6c757d' : '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: checkingInId === booking.id ? 'not-allowed' : 'pointer', fontSize: '0.875rem' }}
                        >
                          {checkingInId === booking.id ? 'Checking In...' : 'Check In'}
                        </button>
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={cancellingId === booking.id}
                          style={{ padding: '0.25rem 0.5rem', backgroundColor: cancellingId === booking.id ? '#6c757d' : '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: cancellingId === booking.id ? 'not-allowed' : 'pointer', fontSize: '0.875rem' }}
                        >
                          {cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      </div>
                    )}
                    {booking.status === 'cancelled' && <span style={{ color: '#6c757d', fontSize: '0.875rem' }}>Cancelled</span>}
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

// Credits Tab (unchanged)
function CreditsTab() {
  const [creditTypes, setCreditTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ user_id: '', credit_type_id: '', quantity: '1' });

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
      setFormData({ user_id: '', credit_type_id: '', quantity: '1' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div style={{ padding: '1rem' }}>Loading credit types...</div>;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Grant Credits</h2>

      {error && <div style={{ padding: '1rem', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '4px', marginBottom: '1rem', color: '#721c24' }}><strong>Error:</strong> {error}</div>}
      {successMessage && <div style={{ padding: '1rem', backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '4px', marginBottom: '1rem', color: '#155724' }}>{successMessage}</div>}

      <form onSubmit={handleGrantCredits} style={{ maxWidth: '500px', marginTop: '1rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>User ID:</label>
          <input type="number" value={formData.user_id} onChange={(e) => setFormData({ ...formData, user_id: e.target.value })} placeholder="Enter user ID (e.g., 2)" required style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem' }} />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Credit Type:</label>
          <select value={formData.credit_type_id} onChange={(e) => setFormData({ ...formData, credit_type_id: e.target.value })} required style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem' }}>
            <option value="">Select a credit type...</option>
            {creditTypes.map((ct) => (
              <option key={ct.id} value={ct.id}>{ct.name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Quantity:</label>
          <input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} min="1" required style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem' }} />
        </div>

        <button type="submit" disabled={submitting} style={{ padding: '0.75rem 1.5rem', backgroundColor: submitting ? '#6c757d' : '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '1rem', fontWeight: 'bold' }}>
          {submitting ? 'Granting...' : 'Grant Credits'}
        </button>
      </form>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#6c757d' }}>
          <strong>Tip:</strong> To find a user's ID, check the signup response or database. Admin user ID is typically 1, first client is typically 2.
        </p>
      </div>
    </div>
  );
}

// Exercises Tab - Full CRUD
function ExercisesTab() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    youtube_url: '',
    primary_muscles: '',
    secondary_muscles: '',
    equipment: '',
    difficulty: '',
    cues: '',
    tags: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchExercises();
  }, []);

  async function fetchExercises() {
    try {
      setLoading(true);
      setError(null);
      const data = await apiRequestJson('/api/admin/exercises');
      setExercises(data.exercises || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      name: '',
      description: '',
      youtube_url: '',
      primary_muscles: '',
      secondary_muscles: '',
      equipment: '',
      difficulty: '',
      cues: '',
      tags: ''
    });
    setEditingId(null);
    setShowForm(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      name: formData.name,
      description: formData.description || '',
      youtube_url: formData.youtube_url || null,
      primary_muscles: formData.primary_muscles.split(',').map(s => s.trim()).filter(Boolean),
      secondary_muscles: formData.secondary_muscles.split(',').map(s => s.trim()).filter(Boolean),
      equipment: formData.equipment.split(',').map(s => s.trim()).filter(Boolean),
      difficulty: formData.difficulty || null,
      cues: formData.cues.split(',').map(s => s.trim()).filter(Boolean),
      tags: formData.tags.split(',').map(s => s.trim()).filter(Boolean)
    };

    try {
      setSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      if (editingId) {
        await apiRequestJson(`/api/admin/exercises/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setSuccessMessage('Exercise updated successfully');
      } else {
        await apiRequestJson('/api/admin/exercises', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setSuccessMessage('Exercise created successfully');
      }

      resetForm();
      await fetchExercises();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(exercise) {
    setFormData({
      name: exercise.name,
      description: exercise.description || '',
      youtube_url: exercise.youtube_url || '',
      primary_muscles: exercise.primary_muscles?.join(', ') || '',
      secondary_muscles: exercise.secondary_muscles?.join(', ') || '',
      equipment: exercise.equipment?.join(', ') || '',
      difficulty: exercise.difficulty || '',
      cues: exercise.cues?.join(', ') || '',
      tags: exercise.tags?.join(', ') || ''
    });
    setEditingId(exercise.id);
    setShowForm(true);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this exercise?')) return;

    try {
      setError(null);
      setSuccessMessage(null);
      await apiRequestJson(`/api/admin/exercises/${id}`, { method: 'DELETE' });
      setSuccessMessage('Exercise deleted successfully');
      await fetchExercises();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div style={{ padding: '1rem' }}>Loading exercises...</div>;

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Exercises</h2>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="btn btn-primary">
          {showForm ? 'Cancel' : 'Create Exercise'}
        </button>
      </div>

      {error && <div style={{ padding: '1rem', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '4px', marginBottom: '1rem', color: '#721c24' }}>{error}</div>}
      {successMessage && <div style={{ padding: '1rem', backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '4px', marginBottom: '1rem', color: '#155724' }}>{successMessage}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '1rem', backgroundColor: '#f8f9fa' }}>
          <h3>{editingId ? 'Edit Exercise' : 'Create New Exercise'}</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label>Name:*</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required style={{ width: '100%', padding: '0.5rem' }} />
            </div>
            <div>
              <label>Description:</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="3" style={{ width: '100%', padding: '0.5rem' }} />
            </div>
            <div>
              <label>YouTube URL:</label>
              <input type="text" value={formData.youtube_url} onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." style={{ width: '100%', padding: '0.5rem' }} />
            </div>
            <div>
              <label>Primary Muscles (comma-separated):</label>
              <input type="text" value={formData.primary_muscles} onChange={(e) => setFormData({ ...formData, primary_muscles: e.target.value })} placeholder="chest, shoulders" style={{ width: '100%', padding: '0.5rem' }} />
            </div>
            <div>
              <label>Equipment (comma-separated):</label>
              <input type="text" value={formData.equipment} onChange={(e) => setFormData({ ...formData, equipment: e.target.value })} placeholder="dumbbells, bench" style={{ width: '100%', padding: '0.5rem' }} />
            </div>
            <div>
              <label>Difficulty:</label>
              <select value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })} style={{ width: '100%', padding: '0.5rem' }}>
                <option value="">Select...</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Saving...' : editingId ? 'Update Exercise' : 'Create Exercise'}
            </button>
          </div>
        </form>
      )}

      {exercises.length === 0 ? (
        <p>No exercises found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Name</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Difficulty</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Equipment</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {exercises.map((ex) => (
              <tr key={ex.id}>
                <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{ex.name}</td>
                <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{ex.difficulty || '-'}</td>
                <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{ex.equipment?.join(', ') || '-'}</td>
                <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                  <button onClick={() => handleEdit(ex)} style={{ marginRight: '0.5rem', padding: '0.25rem 0.5rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem' }}>Edit</button>
                  <button onClick={() => handleDelete(ex.id)} style={{ padding: '0.25rem 0.5rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// Workouts Tab - Builder + Assignment
function WorkoutsTab() {
  const [workouts, setWorkouts] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [workoutExercises, setWorkoutExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDescription, setWorkoutDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [assignUserId, setAssignUserId] = useState('');

  useEffect(() => {
    fetchWorkouts();
    fetchExercises();
  }, []);

  async function fetchWorkouts() {
    try {
      setLoading(true);
      setError(null);
      const data = await apiRequestJson('/api/admin/workouts');
      setWorkouts(data.workouts || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchExercises() {
    try {
      const data = await apiRequestJson('/api/admin/exercises');
      setExercises(data.exercises || []);
    } catch (err) {
      console.error('Failed to fetch exercises:', err);
    }
  }

  async function fetchWorkoutDetails(workoutId) {
    try {
      setError(null);
      const data = await apiRequestJson(`/api/admin/workouts/${workoutId}`);
      setWorkoutExercises(data.exercises || []);
      setSelectedWorkout(data.workout);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreateWorkout(e) {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      await apiRequestJson('/api/admin/workouts', {
        method: 'POST',
        body: JSON.stringify({
          name: workoutName,
          description: workoutDescription || null
        })
      });

      setSuccessMessage('Workout created successfully');
      setShowCreateForm(false);
      setWorkoutName('');
      setWorkoutDescription('');
      await fetchWorkouts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddExercise(exerciseId) {
    if (!selectedWorkout) return;

    try {
      setError(null);
      setSuccessMessage(null);

      await apiRequestJson(`/api/admin/workouts/${selectedWorkout.id}/exercises`, {
        method: 'POST',
        body: JSON.stringify({ exercise_id: exerciseId })
      });

      setSuccessMessage('Exercise added to workout');
      await fetchWorkoutDetails(selectedWorkout.id);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemoveExercise(exerciseId) {
    if (!selectedWorkout) return;
    if (!confirm('Remove this exercise from the workout?')) return;

    try {
      setError(null);
      setSuccessMessage(null);

      await apiRequestJson(`/api/admin/workouts/${selectedWorkout.id}/exercises/${exerciseId}`, {
        method: 'DELETE'
      });

      setSuccessMessage('Exercise removed from workout');
      await fetchWorkoutDetails(selectedWorkout.id);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleMoveExercise(exerciseId, direction) {
    const currentIndex = workoutExercises.findIndex(ex => ex.id === exerciseId);
    if (currentIndex === -1) return;
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === workoutExercises.length - 1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const reordered = [...workoutExercises];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(newIndex, 0, moved);

    const items = reordered.map((ex, index) => ({
      exercise_id: ex.id,
      sort_order: index
    }));

    try {
      setError(null);

      await apiRequestJson(`/api/admin/workouts/${selectedWorkout.id}/exercises/reorder`, {
        method: 'PUT',
        body: JSON.stringify({ items })
      });

      await fetchWorkoutDetails(selectedWorkout.id);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAssignWorkout(e) {
    e.preventDefault();
    if (!selectedWorkout || !assignUserId) return;

    try {
      setSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      await apiRequestJson(`/api/admin/workouts/${selectedWorkout.id}/assign`, {
        method: 'POST',
        body: JSON.stringify({ user_id: parseInt(assignUserId) })
      });

      setSuccessMessage(`Workout assigned to user ${assignUserId}`);
      setAssignUserId('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div style={{ padding: '1rem' }}>Loading workouts...</div>;

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Workouts</h2>
        <button onClick={() => setShowCreateForm(!showCreateForm)} className="btn btn-primary">
          {showCreateForm ? 'Cancel' : 'Create Workout'}
        </button>
      </div>

      {error && <div style={{ padding: '1rem', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '4px', marginBottom: '1rem', color: '#721c24' }}>{error}</div>}
      {successMessage && <div style={{ padding: '1rem', backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '4px', marginBottom: '1rem', color: '#155724' }}>{successMessage}</div>}

      {showCreateForm && (
        <form onSubmit={handleCreateWorkout} style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '1rem', backgroundColor: '#f8f9fa' }}>
          <h3>Create New Workout</h3>
          <div style={{ marginBottom: '1rem' }}>
            <label>Name:*</label>
            <input type="text" value={workoutName} onChange={(e) => setWorkoutName(e.target.value)} required style={{ width: '100%', padding: '0.5rem' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Description:</label>
            <textarea value={workoutDescription} onChange={(e) => setWorkoutDescription(e.target.value)} rows="3" style={{ width: '100%', padding: '0.5rem' }} />
          </div>
          <button type="submit" disabled={submitting} className="btn btn-primary">
            {submitting ? 'Creating...' : 'Create Workout'}
          </button>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        <div>
          <h3>Workouts List</h3>
          {workouts.length === 0 ? (
            <p>No workouts found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {workouts.map((workout) => (
                <button
                  key={workout.id}
                  onClick={() => fetchWorkoutDetails(workout.id)}
                  style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: selectedWorkout?.id === workout.id ? '#e3f2fd' : 'white',
                    cursor: 'pointer'
                  }}
                >
                  <strong>{workout.name}</strong>
                  {workout.description && <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>{workout.description}</div>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {selectedWorkout ? (
            <>
              <h3>{selectedWorkout.name}</h3>
              {selectedWorkout.description && <p style={{ color: '#6c757d' }}>{selectedWorkout.description}</p>}

              <h4 style={{ marginTop: '1.5rem' }}>Exercises ({workoutExercises.length})</h4>
              {workoutExercises.length === 0 ? (
                <p>No exercises in this workout yet.</p>
              ) : (
                <div style={{ marginBottom: '1rem' }}>
                  {workoutExercises.map((ex, index) => (
                    <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '0.5rem', backgroundColor: 'white' }}>
                      <span style={{ fontWeight: 'bold', minWidth: '30px' }}>{index + 1}.</span>
                      <span style={{ flex: 1 }}>{ex.name}</span>
                      <button onClick={() => handleMoveExercise(ex.id, 'up')} disabled={index === 0} style={{ padding: '0.25rem 0.5rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: index === 0 ? 'not-allowed' : 'pointer', fontSize: '0.75rem' }}>↑</button>
                      <button onClick={() => handleMoveExercise(ex.id, 'down')} disabled={index === workoutExercises.length - 1} style={{ padding: '0.25rem 0.5rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: index === workoutExercises.length - 1 ? 'not-allowed' : 'pointer', fontSize: '0.75rem' }}>↓</button>
                      <button onClick={() => handleRemoveExercise(ex.id)} style={{ padding: '0.25rem 0.5rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Remove</button>
                    </div>
                  ))}
                </div>
              )}

              <h4>Add Exercise</h4>
              <select onChange={(e) => e.target.value && handleAddExercise(e.target.value)} value="" style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}>
                <option value="">Select exercise to add...</option>
                {exercises.filter(ex => !workoutExercises.find(we => we.id === ex.id)).map((ex) => (
                  <option key={ex.id} value={ex.id}>{ex.name}</option>
                ))}
              </select>

              <h4>Assign to Client</h4>
              <form onSubmit={handleAssignWorkout} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input
                  type="number"
                  value={assignUserId}
                  onChange={(e) => setAssignUserId(e.target.value)}
                  placeholder="User ID"
                  required
                  style={{ flex: 1, padding: '0.5rem' }}
                />
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Assigning...' : 'Assign'}
                </button>
              </form>
              <p style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                Note: No user list endpoint available. Enter user ID manually (admin=1, first client=2, etc.)
              </p>
            </>
          ) : (
            <p style={{ color: '#6c757d' }}>Select a workout from the list to view and edit exercises.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Clients Tab - View client information
function ClientsTab() {
  const [bookings, setBookings] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [intakeData, setIntakeData] = useState(null);
  const [creditsData, setCreditsData] = useState(null);
  const [waiverData, setWaiverData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      setLoading(true);
      setError(null);
      const data = await apiRequestJson('/api/admin/bookings');
      const bookingsData = data.bookings || [];
      setBookings(bookingsData);

      // Extract unique clients from bookings
      const uniqueClientsMap = new Map();
      bookingsData.forEach(booking => {
        if (!uniqueClientsMap.has(booking.user_id)) {
          uniqueClientsMap.set(booking.user_id, {
            user_id: booking.user_id,
            email: booking.user_email
          });
        }
      });

      const uniqueClients = Array.from(uniqueClientsMap.values()).sort((a, b) => a.user_id - b.user_id);
      setClients(uniqueClients);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectClient(client) {
    setSelectedClient(client);
    setIntakeData(null);
    setCreditsData(null);
    setWaiverData(null);
    setDetailsLoading(true);
    setError(null);

    try {
      // Fetch intake submissions
      const intakeResp = await apiRequestJson(`/api/admin/intake?user_id=${client.user_id}`);
      setIntakeData(intakeResp);

      // Fetch credits ledger
      const creditsResp = await apiRequestJson(`/api/admin/credits/ledger?user_id=${client.user_id}`);
      setCreditsData(creditsResp);

      // Fetch waiver signatures
      const waiverResp = await apiRequestJson(`/api/admin/waiver?user_id=${client.user_id}`);
      setWaiverData(waiverResp);
    } catch (err) {
      setError(err.message);
    } finally {
      setDetailsLoading(false);
    }
  }

  function renderIntakeReadable(data) {
    const formatValue = (val) => {
      if (val === null || val === undefined || val === '') return '—';
      if (typeof val === 'boolean') return val ? 'Yes' : 'No';
      return val;
    };

    const renderSection = (title, fields) => (
      <div key={title} style={{ marginBottom: '1.5rem' }}>
        <h5 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#495057', marginBottom: '0.5rem', borderBottom: '1px solid #dee2e6', paddingBottom: '0.25rem' }}>
          {title}
        </h5>
        <div style={{ fontSize: '0.75rem', lineHeight: 1.6 }}>
          {fields.map(({ label, value }) => (
            <div key={label} style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <strong>{label}:</strong>
              <span>{formatValue(value)}</span>
            </div>
          ))}
        </div>
      </div>
    );

    const sections = [];

    if (data.personalInfo) {
      const p = data.personalInfo;
      sections.push(renderSection('Personal Information', [
        { label: 'Name', value: p.name },
        { label: 'Date of Birth', value: p.dateOfBirth },
        { label: 'Height', value: p.height },
        { label: 'Address', value: p.address },
        { label: 'City', value: p.city },
        { label: 'State', value: p.state },
        { label: 'Zip', value: p.zip },
        { label: 'Phone', value: p.phone },
        { label: 'Email', value: p.email },
        { label: 'Employer', value: p.employer },
        { label: 'Occupation', value: p.occupation },
        { label: 'Emergency Contact', value: p.emergencyContactName },
        { label: 'Emergency Phone', value: p.emergencyContactPhone },
        { label: 'Alt Contact', value: p.alternateContactName },
        { label: 'Alt Phone', value: p.alternateContactPhone },
        { label: 'Referral Source', value: p.referralSource }
      ]));
    }

    if (data.lifestyle) {
      const l = data.lifestyle;
      sections.push(renderSection('Lifestyle', [
        { label: 'Smoker', value: l.smoker },
        { label: 'Cigarettes/Day', value: l.smokesPerDay },
        { label: 'Former Smoker Quit', value: l.formerSmokerQuitDate },
        { label: 'Drinks Alcohol', value: l.drinksAlcohol },
        { label: 'Drinks/Week', value: l.alcoholPerWeek },
        { label: 'Takes Supplements', value: l.takesSupplements },
        { label: 'Supplements List', value: l.supplementsList },
        { label: 'Sleep Hours/Night', value: l.sleepHours }
      ]));
    }

    if (data.goals) {
      const g = data.goals;
      sections.push(renderSection('Goals & Program Info', [
        { label: 'Health Goal A', value: g.healthGoalA },
        { label: 'Health Goal B', value: g.healthGoalB },
        { label: 'Health Goal C', value: g.healthGoalC },
        { label: 'Goals Importance', value: g.goalsImportance },
        { label: 'Trainer Importance', value: g.trainerImportance },
        { label: 'Obstacle A', value: g.obstacleA },
        { label: 'Obstacle B', value: g.obstacleB },
        { label: 'Obstacle C', value: g.obstacleC }
      ]));
    }

    if (data.nutrition) {
      const n = data.nutrition;
      sections.push(renderSection('Nutrition', [
        { label: 'Rating (1-5)', value: n.rating },
        { label: 'Meals Per Day', value: n.mealsPerDay },
        { label: 'Skip Meals', value: n.skipMeals },
        { label: 'Eating Activities', value: n.eatingActivities },
        { label: 'Water Glasses/Day', value: n.waterGlasses },
        { label: 'Regular Foods', value: n.regularFoods },
        { label: 'Knows Calories', value: n.knowsCalories },
        { label: 'Daily Calories', value: n.dailyCalories },
        { label: 'Nutrition Goal A', value: n.nutritionGoalA },
        { label: 'Nutrition Goal B', value: n.nutritionGoalB },
        { label: 'Nutrition Goal C', value: n.nutritionGoalC },
        { label: 'Additional Concerns', value: n.additionalConcerns }
      ]));
    }

    if (data.parq) {
      const p = data.parq;
      sections.push(renderSection('PAR-Q Health Screening', [
        { label: 'Q1: Heart condition', value: p.question1 },
        { label: 'Q2: Chest pain', value: p.question2 },
        { label: 'Q3: Chest pain (month)', value: p.question3 },
        { label: 'Q4: Balance/dizziness', value: p.question4 },
        { label: 'Q5: Bone/joint problem', value: p.question5 },
        { label: 'Q6: Blood pressure meds', value: p.question6 },
        { label: 'Q7: Other reason', value: p.question7 },
        { label: 'Any Yes Answers', value: p.hasYes },
        { label: 'Details', value: p.details }
      ]));
    }

    if (data.certification) {
      const c = data.certification;
      sections.push(renderSection('Certification & Signature', [
        { label: 'Agreed', value: c.agreed },
        { label: 'Signature', value: c.signature },
        { label: 'Date Signed', value: c.date }
      ]));
    }

    return <div style={{ fontSize: '0.875rem' }}>{sections}</div>;
  }

  function handlePrintIntake(submission, client) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print the intake form.');
      return;
    }

    const formattedDate = new Date(submission.submitted_at).toLocaleString();

    const renderSectionForPrint = (title, fields) => {
      const rows = fields.map(({ label, value }) => {
        const displayValue = value === null || value === undefined || value === '' ? '—' :
                            typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;
        return `
          <tr>
            <td style="padding: 4px 8px; border: 1px solid #ddd; font-weight: 600;">${label}:</td>
            <td style="padding: 4px 8px; border: 1px solid #ddd;">${displayValue}</td>
          </tr>
        `;
      }).join('');

      return `
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 14px; font-weight: 600; color: #333; margin-bottom: 8px; border-bottom: 2px solid #333; padding-bottom: 4px;">
            ${title}
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            ${rows}
          </table>
        </div>
      `;
    };

    let sectionsHtml = '';
    const data = submission.data;

    if (data.personalInfo) {
      const p = data.personalInfo;
      sectionsHtml += renderSectionForPrint('Personal Information', [
        { label: 'Name', value: p.name },
        { label: 'Date of Birth', value: p.dateOfBirth },
        { label: 'Height', value: p.height },
        { label: 'Address', value: p.address },
        { label: 'City', value: p.city },
        { label: 'State', value: p.state },
        { label: 'Zip', value: p.zip },
        { label: 'Phone', value: p.phone },
        { label: 'Email', value: p.email },
        { label: 'Employer', value: p.employer },
        { label: 'Occupation', value: p.occupation },
        { label: 'Emergency Contact', value: p.emergencyContactName },
        { label: 'Emergency Phone', value: p.emergencyContactPhone },
        { label: 'Alt Contact', value: p.alternateContactName },
        { label: 'Alt Phone', value: p.alternateContactPhone },
        { label: 'Referral Source', value: p.referralSource }
      ]);
    }

    if (data.lifestyle) {
      const l = data.lifestyle;
      sectionsHtml += renderSectionForPrint('Lifestyle', [
        { label: 'Smoker', value: l.smoker },
        { label: 'Cigarettes/Day', value: l.smokesPerDay },
        { label: 'Former Smoker Quit', value: l.formerSmokerQuitDate },
        { label: 'Drinks Alcohol', value: l.drinksAlcohol },
        { label: 'Drinks/Week', value: l.alcoholPerWeek },
        { label: 'Takes Supplements', value: l.takesSupplements },
        { label: 'Supplements List', value: l.supplementsList },
        { label: 'Sleep Hours/Night', value: l.sleepHours }
      ]);
    }

    if (data.goals) {
      const g = data.goals;
      sectionsHtml += renderSectionForPrint('Goals & Program Info', [
        { label: 'Health Goal A', value: g.healthGoalA },
        { label: 'Health Goal B', value: g.healthGoalB },
        { label: 'Health Goal C', value: g.healthGoalC },
        { label: 'Goals Importance', value: g.goalsImportance },
        { label: 'Trainer Importance', value: g.trainerImportance },
        { label: 'Obstacle A', value: g.obstacleA },
        { label: 'Obstacle B', value: g.obstacleB },
        { label: 'Obstacle C', value: g.obstacleC }
      ]);
    }

    if (data.nutrition) {
      const n = data.nutrition;
      sectionsHtml += renderSectionForPrint('Nutrition', [
        { label: 'Rating (1-5)', value: n.rating },
        { label: 'Meals Per Day', value: n.mealsPerDay },
        { label: 'Skip Meals', value: n.skipMeals },
        { label: 'Eating Activities', value: n.eatingActivities },
        { label: 'Water Glasses/Day', value: n.waterGlasses },
        { label: 'Regular Foods', value: n.regularFoods },
        { label: 'Knows Calories', value: n.knowsCalories },
        { label: 'Daily Calories', value: n.dailyCalories },
        { label: 'Nutrition Goal A', value: n.nutritionGoalA },
        { label: 'Nutrition Goal B', value: n.nutritionGoalB },
        { label: 'Nutrition Goal C', value: n.nutritionGoalC },
        { label: 'Additional Concerns', value: n.additionalConcerns }
      ]);
    }

    if (data.parq) {
      const p = data.parq;
      sectionsHtml += renderSectionForPrint('PAR-Q Health Screening', [
        { label: 'Q1: Heart condition', value: p.question1 },
        { label: 'Q2: Chest pain', value: p.question2 },
        { label: 'Q3: Chest pain (month)', value: p.question3 },
        { label: 'Q4: Balance/dizziness', value: p.question4 },
        { label: 'Q5: Bone/joint problem', value: p.question5 },
        { label: 'Q6: Blood pressure meds', value: p.question6 },
        { label: 'Q7: Other reason', value: p.question7 },
        { label: 'Any Yes Answers', value: p.hasYes },
        { label: 'Details', value: p.details }
      ]);
    }

    if (data.certification) {
      const c = data.certification;
      sectionsHtml += renderSectionForPrint('Certification & Signature', [
        { label: 'Agreed', value: c.agreed },
        { label: 'Signature', value: c.signature },
        { label: 'Date Signed', value: c.date }
      ]);
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Client Intake Form - ${client.email}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background: white;
          }
          h1 {
            font-size: 20px;
            margin-bottom: 10px;
            color: #000;
          }
          .meta {
            font-size: 12px;
            color: #666;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #000;
          }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <h1>Client Intake Form</h1>
        <div class="meta">
          <div><strong>Client:</strong> ${client.email}</div>
          <div><strong>User ID:</strong> ${client.user_id}</div>
          <div><strong>Form Type:</strong> ${submission.form_type}</div>
          <div><strong>Submitted:</strong> ${formattedDate}</div>
        </div>
        ${sectionsHtml}
      </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }

  function handleDownloadIntake(submission, userId) {
    const payload = {
      user_id: userId,
      form_type: submission.form_type,
      submitted_at: submission.submitted_at,
      data: submission.data
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Format date as YYYY-MM-DD
    const date = new Date(submission.submitted_at);
    const dateStr = date.toISOString().split('T')[0];

    const filename = `intake_${userId}_${submission.form_type}_${dateStr}.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (loading) return <div style={{ padding: '1rem' }}>Loading clients...</div>;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Client Management</h2>
      <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
        View client information including intake status and credit history. Client list is built from booking records.
      </p>

      {error && <div style={{ padding: '1rem', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '4px', marginBottom: '1rem', color: '#721c24' }}>{error}</div>}

      {clients.length === 0 ? (
        <p>No clients found. Clients appear here once they have bookings.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
          {/* Client List */}
          <div>
            <h3 style={{ marginBottom: '1rem' }}>Clients ({clients.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {clients.map(client => (
                <button
                  key={client.user_id}
                  onClick={() => handleSelectClient(client)}
                  style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: selectedClient?.user_id === client.user_id ? '#e3f2fd' : 'white',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>ID: {client.user_id}</div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>{client.email}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Client Details */}
          <div>
            {!selectedClient ? (
              <p style={{ color: '#6c757d' }}>Select a client from the list to view their details.</p>
            ) : detailsLoading ? (
              <p>Loading client details...</p>
            ) : (
              <>
                <h3 style={{ marginBottom: '1rem' }}>Client: {selectedClient.email}</h3>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '2rem' }}>User ID: {selectedClient.user_id}</div>

                {/* Intake Status */}
                <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
                  <h4 style={{ marginBottom: '1rem' }}>Intake Submissions</h4>
                  {intakeData && intakeData.submissions && intakeData.submissions.length > 0 ? (
                    <div>
                      {intakeData.submissions.map(sub => {
                        const canDownload = !sub.parse_error && sub.data !== null;
                        return (
                          <div key={sub.id} style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <strong>{sub.form_type}</strong>
                                <span style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                                  {new Date(sub.submitted_at).toLocaleDateString()}
                                </span>
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                  onClick={() => handlePrintIntake(sub, selectedClient)}
                                  disabled={!canDownload}
                                  className="btn btn-sm"
                                  style={{
                                    backgroundColor: canDownload ? '#28a745' : '#e9ecef',
                                    color: canDownload ? 'white' : '#6c757d',
                                    cursor: canDownload ? 'pointer' : 'not-allowed',
                                    border: 'none',
                                    padding: '0.375rem 0.75rem',
                                    fontSize: '0.875rem',
                                    borderRadius: '4px'
                                  }}
                                >
                                  Print / Save PDF
                                </button>
                                <button
                                  onClick={() => handleDownloadIntake(sub, selectedClient.user_id)}
                                  disabled={!canDownload}
                                  className="btn btn-sm"
                                  style={{
                                    backgroundColor: canDownload ? '#6c757d' : '#e9ecef',
                                    color: canDownload ? 'white' : '#6c757d',
                                    cursor: canDownload ? 'pointer' : 'not-allowed',
                                    border: 'none',
                                    padding: '0.375rem 0.75rem',
                                    fontSize: '0.875rem',
                                    borderRadius: '4px'
                                  }}
                                >
                                  Download JSON
                                </button>
                              </div>
                            </div>
                            {sub.parse_error ? (
                              <div style={{ color: '#dc3545', fontSize: '0.875rem' }}>
                                Error parsing submission data - Cannot display or download.
                              </div>
                            ) : sub.data === null ? (
                              <div style={{ color: '#dc3545', fontSize: '0.875rem' }}>
                                Cannot display - data is null.
                              </div>
                            ) : (
                              <div style={{ backgroundColor: '#f8f9fa', padding: '0.75rem', borderRadius: '4px', maxHeight: '400px', overflow: 'auto' }}>
                                {renderIntakeReadable(sub.data)}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p style={{ color: '#6c757d' }}>No intake submissions found for this client.</p>
                  )}
                </div>

                {/* Credits Ledger */}
                <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
                  <h4 style={{ marginBottom: '1rem' }}>Credit History</h4>
                  {creditsData && creditsData.ledger && creditsData.ledger.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                          <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #ddd' }}>Date</th>
                          <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #ddd' }}>Credit Type</th>
                          <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #ddd' }}>Change</th>
                          <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #ddd' }}>Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {creditsData.ledger.map(entry => (
                          <tr key={entry.id}>
                            <td style={{ padding: '0.5rem', border: '1px solid #ddd', fontSize: '0.875rem' }}>
                              {new Date(entry.created_at).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{entry.credit_type_name}</td>
                            <td style={{ padding: '0.5rem', border: '1px solid #ddd', fontWeight: 'bold', color: entry.delta > 0 ? '#28a745' : '#dc3545' }}>
                              {entry.delta > 0 ? '+' : ''}{entry.delta}
                            </td>
                            <td style={{ padding: '0.5rem', border: '1px solid #ddd', fontSize: '0.875rem' }}>{entry.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{ color: '#6c757d' }}>No credit history found for this client.</p>
                  )}
                </div>

                {/* Waiver Signatures */}
                <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
                  <h4 style={{ marginBottom: '1rem' }}>Waiver Signatures</h4>
                  {waiverData && waiverData.signatures && waiverData.signatures.length > 0 ? (
                    <div>
                      {waiverData.signatures.map(sig => (
                        <div key={sig.id} style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid #eee' }}>
                            <strong>{sig.waiver_title || 'Waiver'}</strong>
                            <span style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                              Signed: {new Date(sig.signed_at).toLocaleString()}
                            </span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
                            <div>
                              <strong>Participant Name:</strong> {sig.participant_name || '-'}
                            </div>
                            <div>
                              <strong>Date of Birth:</strong> {sig.participant_dob || '-'}
                            </div>
                            <div>
                              <strong>Signature:</strong> <span style={{ fontFamily: 'cursive' }}>{sig.participant_signature || '-'}</span>
                            </div>
                            <div>
                              <strong>Printed Name:</strong> {sig.participant_printed_name || '-'}
                            </div>
                            <div>
                              <strong>Date Signed:</strong> {sig.participant_signed_date || '-'}
                            </div>
                            <div>
                              <strong>Type:</strong> {sig.is_minor ? 'Minor Participant' : 'Adult Participant'}
                            </div>
                          </div>

                          {sig.is_minor && (
                            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #eee' }}>
                              <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#495057' }}>Minor Participant Addendum</h5>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
                                <div>
                                  <strong>Minor's Name:</strong> {sig.minor_name || '-'}
                                </div>
                                <div>
                                  <strong>Minor's DOB:</strong> {sig.minor_dob || '-'}
                                </div>
                                <div>
                                  <strong>Guardian Name:</strong> {sig.guardian_name || '-'}
                                </div>
                                <div>
                                  <strong>Relationship:</strong> {sig.guardian_relationship || '-'}
                                </div>
                                <div>
                                  <strong>Guardian Signature:</strong> <span style={{ fontFamily: 'cursive' }}>{sig.guardian_signature || '-'}</span>
                                </div>
                                <div>
                                  <strong>Guardian Printed Name:</strong> {sig.guardian_printed_name || '-'}
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                  <strong>Guardian Date Signed:</strong> {sig.guardian_signed_date || '-'}
                                </div>
                              </div>
                            </div>
                          )}

                          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #eee', fontSize: '0.75rem', color: '#6c757d' }}>
                            <strong>IP:</strong> {sig.ip_address || 'N/A'} | <strong>User Agent:</strong> {sig.user_agent || 'N/A'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#6c757d' }}>No waiver signatures found for this client.</p>
                  )}
                </div>

                {/* Limitations Note */}
                <div style={{ padding: '1rem', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px' }}>
                  <strong>Note:</strong> Rewards balance and assigned workouts are not currently available in this view due to API limitations.
                  To grant credits or assign workouts, use the Credits and Workouts tabs respectively (requires manual user ID entry).
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
