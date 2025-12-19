import { Link } from 'react-router-dom';
import { Container } from '../components/Container';

export function About() {
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
            About Us
          </h1>
          <p style={{
            textAlign: 'center',
            fontSize: 'var(--font-size-lg)',
            color: 'var(--color-text-light)',
            maxWidth: 'var(--maxw-content)',
            margin: '0 auto'
          }}>
            Committed to helping you achieve sustainable fitness results through personalized training.
          </p>
        </Container>
      </section>

      <Container>
        <div style={{
          maxWidth: 'var(--maxw-content)',
          margin: '0 auto',
          padding: 'var(--space-3xl) 0'
        }}>
          <div className="card" style={{ marginBottom: 'var(--space-2xl)' }}>
            <h2 style={{
              fontSize: 'var(--font-size-3xl)',
              fontWeight: 700,
              color: 'var(--color-primary)',
              marginBottom: 'var(--space-lg)'
            }}>
              Meet Katie
            </h2>
            <p style={{
              fontSize: 'var(--font-size-lg)',
              lineHeight: 1.8,
              color: 'var(--color-text)',
              marginBottom: 'var(--space-md)'
            }}>
              Katie brings over a decade of experience in personal training and fitness coaching.
              With certifications in strength and conditioning, nutrition, and functional movement,
              she creates comprehensive programs that address both physical performance and overall wellness.
            </p>
            <p style={{
              fontSize: 'var(--font-size-lg)',
              lineHeight: 1.8,
              color: 'var(--color-text)',
              marginBottom: 'var(--space-md)'
            }}>
              Her approach combines evidence-based training methods with a deep understanding of
              individual needs, ensuring every client receives the attention and guidance necessary
              to reach their goals safely and effectively.
            </p>
            <p style={{
              fontSize: 'var(--font-size-lg)',
              lineHeight: 1.8,
              color: 'var(--color-text)'
            }}>
              Whether you're training for a specific event, recovering from an injury, or simply
              looking to improve your overall fitness, Katie will work with you to develop a plan
              that fits your lifestyle and helps you achieve lasting results.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--space-xl)',
            marginBottom: 'var(--space-3xl)'
          }}>
            <div style={{
              padding: 'var(--space-xl)',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center'
            }}>
              <h3 style={{
                fontSize: 'var(--font-size-xl)',
                fontWeight: 700,
                marginBottom: 'var(--space-md)',
                color: 'var(--color-primary)'
              }}>
                Our Mission
              </h3>
              <p style={{
                color: 'var(--color-text-light)',
                lineHeight: 1.7
              }}>
                To empower individuals to achieve their fitness goals through personalized training,
                expert guidance, and unwavering support in a welcoming environment.
              </p>
            </div>

            <div style={{
              padding: 'var(--space-xl)',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center'
            }}>
              <h3 style={{
                fontSize: 'var(--font-size-xl)',
                fontWeight: 700,
                marginBottom: 'var(--space-md)',
                color: 'var(--color-primary)'
              }}>
                Our Values
              </h3>
              <p style={{
                color: 'var(--color-text-light)',
                lineHeight: 1.7
              }}>
                We believe in sustainable progress over quick fixes, individualized attention over
                one-size-fits-all programs, and building strength from the inside out.
              </p>
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
              Start Your Fitness Journey
            </h2>
            <p style={{
              fontSize: 'var(--font-size-lg)',
              color: 'var(--color-text-light)',
              marginBottom: 'var(--space-xl)'
            }}>
              Join Elite Training & Wellness and discover what you're capable of achieving.
            </p>
            <Link to="/book" className="btn btn-primary btn-lg">
              Book Your First Session
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
