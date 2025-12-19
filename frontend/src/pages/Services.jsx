import { Link } from 'react-router-dom';
import { Container } from '../components/Container';

export function Services() {
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
            Our Services
          </h1>
          <p style={{
            textAlign: 'center',
            fontSize: 'var(--font-size-lg)',
            color: 'var(--color-text-light)',
            maxWidth: 'var(--maxw-content)',
            margin: '0 auto'
          }}>
            Personalized training programs designed to help you achieve your fitness goals.
          </p>
        </Container>
      </section>

      <Container>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--space-2xl)',
          margin: 'var(--space-3xl) 0'
        }}>
          <div className="card">
            <h2 style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 700,
              color: 'var(--color-primary)',
              marginBottom: 'var(--space-md)'
            }}>
              Personal Training
            </h2>
            <p style={{
              color: 'var(--color-text-light)',
              marginBottom: 'var(--space-lg)',
              lineHeight: 1.7
            }}>
              One-on-one sessions tailored to your specific needs and goals. Work directly with
              Katie to develop a customized fitness program that evolves with your progress.
              Perfect for those seeking individualized attention and accountability.
            </p>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              marginBottom: 'var(--space-lg)'
            }}>
              <li style={{ padding: 'var(--space-sm) 0', color: 'var(--color-text-light)' }}>
                ✓ Customized workout plans
              </li>
              <li style={{ padding: 'var(--space-sm) 0', color: 'var(--color-text-light)' }}>
                ✓ Form coaching and technique refinement
              </li>
              <li style={{ padding: 'var(--space-sm) 0', color: 'var(--color-text-light)' }}>
                ✓ Progress tracking and goal setting
              </li>
              <li style={{ padding: 'var(--space-sm) 0', color: 'var(--color-text-light)' }}>
                ✓ Nutritional guidance and support
              </li>
            </ul>
            <Link to="/book" className="btn btn-primary" style={{ width: '100%' }}>
              Book Personal Training
            </Link>
          </div>

          <div className="card">
            <h2 style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 700,
              color: 'var(--color-primary)',
              marginBottom: 'var(--space-md)'
            }}>
              Circuit Training
            </h2>
            <p style={{
              color: 'var(--color-text-light)',
              marginBottom: 'var(--space-lg)',
              lineHeight: 1.7
            }}>
              High-energy group sessions that combine strength training and cardio in a dynamic,
              supportive environment. Work through timed circuits designed to maximize results
              while building community and camaraderie with fellow members.
            </p>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              marginBottom: 'var(--space-lg)'
            }}>
              <li style={{ padding: 'var(--space-sm) 0', color: 'var(--color-text-light)' }}>
                ✓ Full-body workouts
              </li>
              <li style={{ padding: 'var(--space-sm) 0', color: 'var(--color-text-light)' }}>
                ✓ Scalable to all fitness levels
              </li>
              <li style={{ padding: 'var(--space-sm) 0', color: 'var(--color-text-light)' }}>
                ✓ Motivating group atmosphere
              </li>
              <li style={{ padding: 'var(--space-sm) 0', color: 'var(--color-text-light)' }}>
                ✓ Varied programming to prevent plateaus
              </li>
            </ul>
            <Link to="/book" className="btn btn-primary" style={{ width: '100%' }}>
              Book Circuit Training
            </Link>
          </div>
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: 'var(--space-3xl)',
          marginBottom: 'var(--space-3xl)',
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
            marginBottom: 'var(--space-xl)',
            maxWidth: 'var(--maxw-content)',
            margin: '0 auto var(--space-xl)'
          }}>
            Create an account, sign the waiver, and book your first session today.
          </p>
          <Link to="/book" className="btn btn-primary btn-lg">
            Book Now
          </Link>
        </div>
      </Container>
    </div>
  );
}
