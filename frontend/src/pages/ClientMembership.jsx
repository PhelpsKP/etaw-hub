import { useState, useEffect } from 'react';
import { Container } from '../components/Container';
import { apiRequestJson } from '../lib/api';

export function ClientMembership() {
  const [membershipData, setMembershipData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMembership();
  }, []);

  async function fetchMembership() {
    try {
      setLoading(true);
      setError(null);
      const data = await apiRequestJson('/api/membership/status');
      setMembershipData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Container>
        <div style={{ padding: 'var(--space-xl)' }}>Loading membership...</div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div style={{ padding: 'var(--space-xl)', color: 'var(--color-error)' }}>
          Error: {error}
        </div>
      </Container>
    );
  }

  const { hasUnlimited, membership } = membershipData || {};

  return (
    <Container>
      <div style={{ padding: 'var(--space-xl) 0', maxWidth: 'var(--maxw-content)', margin: '0 auto' }}>
        <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-md)' }}>
          My Membership
        </h1>
        <p style={{ color: 'var(--color-text-light)', marginBottom: 'var(--space-2xl)' }}>
          View your current membership status and benefits.
        </p>

        {!membership ? (
          <div className="card">
            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
              No Active Membership
            </h2>
            <p style={{ color: 'var(--color-text-light)', marginBottom: 'var(--space-lg)' }}>
              You don't currently have an active membership. Contact your trainer to set up a membership plan with unlimited access to circuit training sessions.
            </p>
            <p style={{
              fontSize: 'var(--font-size-sm)',
              padding: 'var(--space-md)',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius)',
              borderLeft: '4px solid var(--color-primary)'
            }}>
              <strong>Note:</strong> You can still book sessions using your available session credits.
            </p>
          </div>
        ) : (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
              <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>
                {membership.plan === 'circuit' ? 'Circuit Training Membership' : membership.plan}
              </h2>
              {membership.is_active ? (
                <span style={{
                  padding: 'var(--space-sm) var(--space-md)',
                  backgroundColor: 'var(--color-success)',
                  color: 'white',
                  borderRadius: 'var(--radius)',
                  fontWeight: 600
                }}>
                  Active
                </span>
              ) : (
                <span style={{
                  padding: 'var(--space-sm) var(--space-md)',
                  backgroundColor: 'var(--color-muted)',
                  color: 'white',
                  borderRadius: 'var(--radius)',
                  fontWeight: 600
                }}>
                  Inactive
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
              <div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-xs)' }}>
                  Membership Type
                </div>
                <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>
                  {hasUnlimited ? 'Unlimited Access' : 'Standard'}
                </div>
              </div>

              {membership.starts_at && (
                <div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-xs)' }}>
                    Start Date
                  </div>
                  <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>
                    {new Date(membership.starts_at).toLocaleDateString()}
                  </div>
                </div>
              )}

              {membership.ends_at && (
                <div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-xs)' }}>
                    {hasUnlimited ? 'Expires On' : 'Ended On'}
                  </div>
                  <div style={{
                    fontSize: 'var(--font-size-lg)',
                    fontWeight: 600,
                    color: hasUnlimited ? 'var(--color-text)' : 'var(--color-error)'
                  }}>
                    {new Date(membership.ends_at).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>

            {hasUnlimited && (
              <div style={{
                padding: 'var(--space-lg)',
                backgroundColor: 'var(--color-accent-light)',
                borderRadius: 'var(--radius)',
                marginBottom: 'var(--space-lg)'
              }}>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
                  Unlimited Circuit Training
                </h3>
                <p style={{ color: 'var(--color-text-light)' }}>
                  Your membership includes unlimited access to all circuit training sessions.
                  No credits required when booking circuit classes!
                </p>
              </div>
            )}

            <div style={{
              padding: 'var(--space-md)',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius)',
              borderLeft: '4px solid var(--color-warning)'
            }}>
              <strong>Auto-Renewal:</strong> Not currently enabled. Contact your trainer to set up automatic membership renewal.
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}
