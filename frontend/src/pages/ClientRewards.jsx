import { useState, useEffect } from 'react';
import { Container } from '../components/Container';
import { apiRequestJson } from '../lib/api';

export function ClientRewards() {
  const [rewards, setRewards] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRewards();
  }, []);

  async function fetchRewards() {
    try {
      setLoading(true);
      setError(null);
      const data = await apiRequestJson('/api/rewards');
      setRewards(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Container>
        <div style={{ padding: 'var(--space-xl)' }}>Loading rewards...</div>
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

  return (
    <Container>
      <div style={{ padding: 'var(--space-xl) 0' }}>
        <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-md)' }}>
          My Rewards
        </h1>
        <p style={{ color: 'var(--color-text-light)', marginBottom: 'var(--space-2xl)' }}>
          Earn points by attending sessions. Points can be redeemed for rewards (coming soon).
        </p>

        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-3xl)', marginBottom: 'var(--space-2xl)' }}>
          <div style={{
            fontSize: '4rem',
            fontWeight: 700,
            color: 'var(--color-primary)',
            marginBottom: 'var(--space-md)'
          }}>
            {rewards?.points_balance || 0}
          </div>
          <h2 style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 700,
            color: 'var(--color-text)'
          }}>
            Reward Points
          </h2>
          <p style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-light)',
            marginTop: 'var(--space-md)'
          }}>
            Keep attending sessions to earn more points!
          </p>
        </div>

        {rewards?.recent && rewards.recent.length > 0 && (
          <div>
            <h2 style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 700,
              marginBottom: 'var(--space-lg)'
            }}>
              Recent Activity
            </h2>
            <div className="card">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                    <th style={{ padding: 'var(--space-md)', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: 'var(--space-md)', textAlign: 'left' }}>Reason</th>
                    <th style={{ padding: 'var(--space-md)', textAlign: 'right' }}>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {rewards.recent.map((entry) => (
                    <tr key={entry.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: 'var(--space-md)' }}>
                        {new Date(entry.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: 'var(--space-md)', color: 'var(--color-text-light)' }}>
                        {entry.reason}
                      </td>
                      <td style={{
                        padding: 'var(--space-md)',
                        textAlign: 'right',
                        fontWeight: 600,
                        color: entry.delta_points > 0 ? 'var(--color-success)' : 'var(--color-error)'
                      }}>
                        {entry.delta_points > 0 ? '+' : ''}{entry.delta_points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}
