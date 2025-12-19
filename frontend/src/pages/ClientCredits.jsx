import { useState, useEffect } from 'react';
import { Container } from '../components/Container';
import { apiRequestJson } from '../lib/api';

export function ClientCredits() {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBalances();
  }, []);

  async function fetchBalances() {
    try {
      setLoading(true);
      setError(null);
      const data = await apiRequestJson('/api/credits/balances');
      setBalances(data.balances || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Container>
        <div style={{ padding: 'var(--space-xl)' }}>Loading credits...</div>
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
          My Credits
        </h1>
        <p style={{ color: 'var(--color-text-light)', marginBottom: 'var(--space-2xl)' }}>
          View your available session credits. Contact your trainer to purchase additional credits.
        </p>

        {balances.length === 0 ? (
          <div className="card">
            <p style={{ color: 'var(--color-text-light)' }}>
              No credit balances found. Contact your trainer to get started with session credits.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-lg)' }}>
            {balances.map((balance) => (
              <div key={balance.credit_type_id} className="card" style={{
                textAlign: 'center',
                padding: 'var(--space-2xl)'
              }}>
                <div style={{
                  fontSize: 'var(--font-size-4xl)',
                  fontWeight: 700,
                  color: 'var(--color-primary)',
                  marginBottom: 'var(--space-md)'
                }}>
                  {balance.balance}
                </div>
                <h2 style={{
                  fontSize: 'var(--font-size-xl)',
                  fontWeight: 700,
                  marginBottom: 'var(--space-sm)'
                }}>
                  {balance.credit_type_name}
                </h2>
                {balance.credit_type_description && (
                  <p style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-light)'
                  }}>
                    {balance.credit_type_description}
                  </p>
                )}
                <div style={{
                  marginTop: 'var(--space-md)',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-muted)'
                }}>
                  Last updated: {new Date(balance.updated_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
