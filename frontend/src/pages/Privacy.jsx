import { Container } from '../components/Container';

export function Privacy() {
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
            Privacy Policy
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
              1. Information We Collect
            </h2>
            <p style={{
              fontSize: 'var(--font-size-base)',
              lineHeight: 1.8,
              color: 'var(--color-text)',
              marginBottom: 'var(--space-md)'
            }}>
              We collect information that you provide directly to us, including your name, email address, phone number, health information, fitness goals, and payment information. This information is necessary to provide our training services and manage your account.
            </p>
          </section>

          <section style={{ marginBottom: 'var(--space-2xl)' }}>
            <h2 style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 700,
              color: 'var(--color-text)',
              marginBottom: 'var(--space-md)'
            }}>
              2. How We Use Your Information
            </h2>
            <p style={{
              fontSize: 'var(--font-size-base)',
              lineHeight: 1.8,
              color: 'var(--color-text)',
              marginBottom: 'var(--space-md)'
            }}>
              Your information is used to provide and improve our services, communicate with you about your training, process payments, and ensure your safety during fitness activities. We will never sell or share your personal information with third parties for marketing purposes.
            </p>
          </section>

          <section style={{ marginBottom: 'var(--space-2xl)' }}>
            <h2 style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 700,
              color: 'var(--color-text)',
              marginBottom: 'var(--space-md)'
            }}>
              3. Health Information
            </h2>
            <p style={{
              fontSize: 'var(--font-size-base)',
              lineHeight: 1.8,
              color: 'var(--color-text)',
              marginBottom: 'var(--space-md)'
            }}>
              Health and fitness information you provide is kept confidential and used solely for the purpose of designing safe and effective training programs. This information is stored securely and accessed only by authorized personnel.
            </p>
          </section>

          <section style={{ marginBottom: 'var(--space-2xl)' }}>
            <h2 style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 700,
              color: 'var(--color-text)',
              marginBottom: 'var(--space-md)'
            }}>
              4. Data Security
            </h2>
            <p style={{
              fontSize: 'var(--font-size-base)',
              lineHeight: 1.8,
              color: 'var(--color-text)',
              marginBottom: 'var(--space-md)'
            }}>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section style={{ marginBottom: 'var(--space-2xl)' }}>
            <h2 style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 700,
              color: 'var(--color-text)',
              marginBottom: 'var(--space-md)'
            }}>
              5. Your Rights
            </h2>
            <p style={{
              fontSize: 'var(--font-size-base)',
              lineHeight: 1.8,
              color: 'var(--color-text)',
              marginBottom: 'var(--space-md)'
            }}>
              You have the right to access, update, or delete your personal information at any time. You may also request a copy of the information we hold about you. Contact us to exercise these rights.
            </p>
          </section>

          <section style={{ marginBottom: 'var(--space-2xl)' }}>
            <h2 style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 700,
              color: 'var(--color-text)',
              marginBottom: 'var(--space-md)'
            }}>
              6. Cookies and Tracking
            </h2>
            <p style={{
              fontSize: 'var(--font-size-base)',
              lineHeight: 1.8,
              color: 'var(--color-text)',
              marginBottom: 'var(--space-md)'
            }}>
              We use cookies and similar tracking technologies to maintain your session and improve your experience on our website. You can control cookies through your browser settings.
            </p>
          </section>

          <section style={{ marginBottom: 'var(--space-2xl)' }}>
            <h2 style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 700,
              color: 'var(--color-text)',
              marginBottom: 'var(--space-md)'
            }}>
              7. Changes to This Policy
            </h2>
            <p style={{
              fontSize: 'var(--font-size-base)',
              lineHeight: 1.8,
              color: 'var(--color-text)',
              marginBottom: 'var(--space-md)'
            }}>
              We may update this privacy policy from time to time. Changes will be posted on this page with an updated revision date.
            </p>
          </section>

          <section style={{ marginBottom: 'var(--space-2xl)' }}>
            <h2 style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 700,
              color: 'var(--color-text)',
              marginBottom: 'var(--space-md)'
            }}>
              8. Contact Us
            </h2>
            <p style={{
              fontSize: 'var(--font-size-base)',
              lineHeight: 1.8,
              color: 'var(--color-text)'
            }}>
              If you have questions about this Privacy Policy or how we handle your information, please contact us at{' '}
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
