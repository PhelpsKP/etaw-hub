import { Container } from '../components/Container';

export function Terms() {
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
            Terms of Service
          </h1>
        </Container>
      </section>

      <Container>
        <div style={{
          maxWidth: 'var(--maxw-content)',
          margin: '0 auto',
          padding: 'var(--space-3xl) 0'
        }}>
          <p style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-light)',
            marginBottom: 'var(--space-2xl)',
            fontStyle: 'italic'
          }}>
            Last updated: January 7, 2026
          </p>

          <section style={{ marginBottom: 'var(--space-2xl)' }}>
            <h2 style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 700,
              color: 'var(--color-text)',
              marginBottom: 'var(--space-md)'
            }}>
              1. Acceptance of Terms
            </h2>
            <p style={{
              fontSize: 'var(--font-size-base)',
              lineHeight: 1.8,
              color: 'var(--color-text)',
              marginBottom: 'var(--space-md)'
            }}>
              By accessing and using the Elite Training & Wellness website and services, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section style={{ marginBottom: 'var(--space-2xl)' }}>
            <h2 style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 700,
              color: 'var(--color-text)',
              marginBottom: 'var(--space-md)'
            }}>
              2. Services Provided
            </h2>
            <p style={{
              fontSize: 'var(--font-size-base)',
              lineHeight: 1.8,
              color: 'var(--color-text)',
              marginBottom: 'var(--space-md)'
            }}>
              Elite Training & Wellness provides personal training, small group training, and circuit training services. All services are provided by appointment only at our Cincinnati, Ohio location.
            </p>
          </section>

          <section style={{ marginBottom: 'var(--space-2xl)' }}>
            <h2 style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 700,
              color: 'var(--color-text)',
              marginBottom: 'var(--space-md)'
            }}>
              3. User Responsibilities
            </h2>
            <p style={{
              fontSize: 'var(--font-size-base)',
              lineHeight: 1.8,
              color: 'var(--color-text)',
              marginBottom: 'var(--space-md)'
            }}>
              You are responsible for providing accurate information when creating an account and booking sessions. You agree to notify us of any changes to your health status or fitness goals.
            </p>
          </section>

          <section style={{ marginBottom: 'var(--space-2xl)' }}>
            <h2 style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 700,
              color: 'var(--color-text)',
              marginBottom: 'var(--space-md)'
            }}>
              4. Cancellation Policy
            </h2>
            <p style={{
              fontSize: 'var(--font-size-base)',
              lineHeight: 1.8,
              color: 'var(--color-text)',
              marginBottom: 'var(--space-md)'
            }}>
              Cancellation policies will be communicated at the time of booking. Please contact us directly for specific cancellation terms for your scheduled sessions.
            </p>
          </section>

          <section style={{ marginBottom: 'var(--space-2xl)' }}>
            <h2 style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 700,
              color: 'var(--color-text)',
              marginBottom: 'var(--space-md)'
            }}>
              5. Limitation of Liability
            </h2>
            <p style={{
              fontSize: 'var(--font-size-base)',
              lineHeight: 1.8,
              color: 'var(--color-text)',
              marginBottom: 'var(--space-md)'
            }}>
              Elite Training & Wellness is not liable for any injuries sustained during training sessions. All participants must complete a waiver and health intake form before participating in any fitness activities.
            </p>
          </section>

          <section style={{ marginBottom: 'var(--space-2xl)' }}>
            <h2 style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 700,
              color: 'var(--color-text)',
              marginBottom: 'var(--space-md)'
            }}>
              6. Changes to Terms
            </h2>
            <p style={{
              fontSize: 'var(--font-size-base)',
              lineHeight: 1.8,
              color: 'var(--color-text)',
              marginBottom: 'var(--space-md)'
            }}>
              We reserve the right to modify these terms at any time. Changes will be posted on this page with an updated revision date.
            </p>
          </section>

          <section style={{ marginBottom: 'var(--space-2xl)' }}>
            <h2 style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 700,
              color: 'var(--color-text)',
              marginBottom: 'var(--space-md)'
            }}>
              7. Contact Information
            </h2>
            <p style={{
              fontSize: 'var(--font-size-base)',
              lineHeight: 1.8,
              color: 'var(--color-text)'
            }}>
              For questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:etw.katie@gmail.com" style={{ color: 'var(--color-primary)' }}>
                etw.katie@gmail.com
              </a>
              {' '}or call{' '}
              <a href="tel:+15138079388" style={{ color: 'var(--color-primary)' }}>
                (513) 807-9388
              </a>.
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}
