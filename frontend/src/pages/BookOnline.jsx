import { Link } from 'react-router-dom';
import { Container } from '../components/Container';
import { useAuth } from '../contexts/AuthContext';
import { getDisplayName } from '../lib/displayName';

export function BookOnline() {
  const { user } = useAuth();

  return (
    <div>
      <section style={{
        backgroundColor: 'var(--color-surface)',
        padding: 'var(--space-3xl) 0'
      }}>
        <Container>
          <h1 style={{
            fontSize: 'var(--font-size-4xl)',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: 'var(--space-md)',
            color: 'var(--color-text)'
          }}>
            Book Online
          </h1>
          <p style={{
            textAlign: 'center',
            fontSize: 'var(--font-size-lg)',
            color: 'var(--color-text-light)',
            maxWidth: 'var(--maxw-content)',
            margin: '0 auto'
          }}>
            Simple steps to schedule your training sessions.
          </p>
        </Container>
      </section>

      <Container>
        <div style={{
          maxWidth: 'var(--maxw-content)',
          margin: '0 auto',
          padding: 'var(--space-3xl) 0'
        }}>
          {user ? (
            <div className="card" style={{ textAlign: 'center' }}>
              <h2 style={{
                fontSize: 'var(--font-size-3xl)',
                fontWeight: 700,
                marginBottom: 'var(--space-md)',
                color: 'var(--color-primary)'
              }}>
                Welcome back, {getDisplayName(user)}!
              </h2>
              <p style={{
                fontSize: 'var(--font-size-lg)',
                color: 'var(--color-text-light)',
                marginBottom: 'var(--space-xl)'
              }}>
                You're all set to book sessions. Head to your dashboard to view available times
                and schedule your next workout.
              </p>
              <Link to="/app" className="btn btn-primary btn-lg">
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 'var(--space-3xl)' }}>
                <h2 style={{
                  fontSize: 'var(--font-size-3xl)',
                  fontWeight: 700,
                  marginBottom: 'var(--space-xl)',
                  textAlign: 'center',
                  color: 'var(--color-text)'
                }}>
                  How to Book a Session
                </h2>

                <div style={{
                  display: 'grid',
                  gap: 'var(--space-lg)'
                }}>
                  <div style={{
                    display: 'flex',
                    gap: 'var(--space-lg)',
                    padding: 'var(--space-xl)',
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: 'var(--radius-lg)'
                  }}>
                    <div style={{
                      flexShrink: 0,
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 'var(--font-size-xl)'
                    }}>
                      1
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: 'var(--font-size-xl)',
                        fontWeight: 700,
                        marginBottom: 'var(--space-sm)'
                      }}>
                        Create Your Account
                      </h3>
                      <p style={{
                        color: 'var(--color-text-light)',
                        lineHeight: 1.7
                      }}>
                        Sign up with your email address to create your client profile. This only
                        takes a minute and gives you access to the booking system.
                      </p>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: 'var(--space-lg)',
                    padding: 'var(--space-xl)',
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: 'var(--radius-lg)'
                  }}>
                    <div style={{
                      flexShrink: 0,
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 'var(--font-size-xl)'
                    }}>
                      2
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: 'var(--font-size-xl)',
                        fontWeight: 700,
                        marginBottom: 'var(--space-sm)'
                      }}>
                        Sign the Waiver
                      </h3>
                      <p style={{
                        color: 'var(--color-text-light)',
                        lineHeight: 1.7
                      }}>
                        Review and digitally sign the liability waiver. This is a one-time step
                        required before you can book your first session.
                      </p>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: 'var(--space-lg)',
                    padding: 'var(--space-xl)',
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: 'var(--radius-lg)'
                  }}>
                    <div style={{
                      flexShrink: 0,
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 'var(--font-size-xl)'
                    }}>
                      3
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: 'var(--font-size-xl)',
                        fontWeight: 700,
                        marginBottom: 'var(--space-sm)'
                      }}>
                        Get Your Credits
                      </h3>
                      <p style={{
                        color: 'var(--color-text-light)',
                        lineHeight: 1.7
                      }}>
                        Sessions are booked using credits. Contact Katie to purchase a session
                        package or membership, and credits will be added to your account.
                      </p>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: 'var(--space-lg)',
                    padding: 'var(--space-xl)',
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: 'var(--radius-lg)'
                  }}>
                    <div style={{
                      flexShrink: 0,
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 'var(--font-size-xl)'
                    }}>
                      4
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: 'var(--font-size-xl)',
                        fontWeight: 700,
                        marginBottom: 'var(--space-sm)'
                      }}>
                        Book Your Session
                      </h3>
                      <p style={{
                        color: 'var(--color-text-light)',
                        lineHeight: 1.7
                      }}>
                        Browse available sessions in your dashboard and book the times that work
                        best for your schedule. You can manage all your bookings online.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                textAlign: 'center',
                padding: 'var(--space-3xl)',
                backgroundColor: 'var(--color-accent-light)',
                borderRadius: 'var(--radius-lg)'
              }}>
                <h2 style={{
                  fontSize: 'var(--font-size-3xl)',
                  fontWeight: 700,
                  marginBottom: 'var(--space-md)'
                }}>
                  Ready to Get Started?
                </h2>
                <p style={{
                  fontSize: 'var(--font-size-lg)',
                  color: 'var(--color-text-light)',
                  marginBottom: 'var(--space-xl)'
                }}>
                  Create your account or log in to start booking sessions.
                </p>
                <div style={{
                  display: 'flex',
                  gap: 'var(--space-md)',
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  <Link to="/signup" className="btn btn-primary btn-lg">
                    Create Account
                  </Link>
                  <Link to="/login" className="btn btn-secondary btn-lg">
                    Log In
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </Container>
    </div>
  );
}
