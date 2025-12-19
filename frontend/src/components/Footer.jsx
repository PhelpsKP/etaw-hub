import { Container } from './Container';

export function Footer() {
  return (
    <footer style={{
      backgroundColor: 'var(--color-surface)',
      borderTop: '1px solid var(--color-border)',
      marginTop: 'var(--space-3xl)',
      padding: 'var(--space-3xl) 0 var(--space-xl)'
    }}>
      <Container>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 'var(--space-2xl)'
        }}>
          <div>
            <h3 style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: 700,
              color: 'var(--color-primary)',
              marginBottom: 'var(--space-md)'
            }}>
              Elite Training & Wellness
            </h3>
            <p style={{
              color: 'var(--color-text-light)',
              fontSize: 'var(--font-size-sm)'
            }}>
              Personalized fitness training designed to help you reach your goals.
            </p>
          </div>

          <div>
            <h4 style={{
              fontSize: 'var(--font-size-base)',
              fontWeight: 600,
              marginBottom: 'var(--space-md)'
            }}>
              Location
            </h4>
            <p style={{
              color: 'var(--color-text-light)',
              fontSize: 'var(--font-size-sm)',
              lineHeight: 1.6
            }}>
              Serving the Greater Atlanta Area<br />
              By Appointment Only
            </p>
          </div>

          <div>
            <h4 style={{
              fontSize: 'var(--font-size-base)',
              fontWeight: 600,
              marginBottom: 'var(--space-md)'
            }}>
              Contact
            </h4>
            <p style={{
              color: 'var(--color-text-light)',
              fontSize: 'var(--font-size-sm)',
              lineHeight: 1.6
            }}>
              Email: info@elitetrainingwellness.com<br />
              Phone: (555) 123-4567
            </p>
          </div>
        </div>

        <div style={{
          marginTop: 'var(--space-2xl)',
          paddingTop: 'var(--space-xl)',
          borderTop: '1px solid var(--color-border)',
          textAlign: 'center',
          color: 'var(--color-muted)',
          fontSize: 'var(--font-size-sm)'
        }}>
          © {new Date().getFullYear()} Elite Training & Wellness. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}
