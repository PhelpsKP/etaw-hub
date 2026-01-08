import { Link } from 'react-router-dom';
import { Container } from '../components/Container';
import { hero, people } from '../assets/images/imageRegistry';

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
            Welcome to Elite Training & Wellness
          </h1>
        </Container>
      </section>

      <Container>
        <div style={{
          maxWidth: 'var(--maxw-content)',
          margin: '0 auto',
          padding: 'var(--space-3xl) 0'
        }}>
          {/* Welcome Text */}
          <div style={{
            marginBottom: 'var(--space-3xl)'
          }}>
            <p style={{
              fontSize: 'var(--font-size-lg)',
              lineHeight: 1.8,
              color: 'var(--color-text)',
              marginBottom: 'var(--space-lg)'
            }}>
              We chose the name Elite because we stand apart not just in instruction, but in intentional guidance. We don't simply show you how to move; we help you understand why you're doing it — from safe, effective form to goal-focused strength and conditioning — because the best results come from training with purpose.
            </p>
            <p style={{
              fontSize: 'var(--font-size-lg)',
              lineHeight: 1.8,
              color: 'var(--color-text)',
              marginBottom: 'var(--space-lg)'
            }}>
              We also know that true transformation goes beyond physical performance and physique. That's why wellness is in our name, and guides everything we do. We combine proper training with habits that support long-term health, balanced living, and a mindset that keeps you dedicated for years to come. Whether your goal is more strength, confidence, energy, or something else entirely, we'll work together to build habits that last a lifetime.
            </p>
            <p style={{
              fontSize: 'var(--font-size-lg)',
              lineHeight: 1.8,
              color: 'var(--color-text)',
              marginBottom: 'var(--space-lg)'
            }}>
              You're not just signing up for a gym; you're starting a lifestyle shift.
            </p>
            <p style={{
              fontSize: 'var(--font-size-lg)',
              lineHeight: 1.8,
              color: 'var(--color-text)',
              fontWeight: 600
            }}>
              Let's build something strong — together.
            </p>
          </div>

          {/* Katie Image with Certifications */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--space-2xl)',
            alignItems: 'start',
            marginBottom: 'var(--space-3xl)'
          }}>
            <div>
              <img
                src={hero.coachIdentity}
                alt="Katie Harrington, owner and head coach at Elite Training & Wellness"
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow)'
                }}
              />
            </div>
            <div>
              <h2 id="experience-certifications" style={{
                fontSize: 'var(--font-size-2xl)',
                fontWeight: 700,
                color: 'var(--color-primary)',
                marginBottom: 'var(--space-lg)'
              }}>
                Experience & Certifications
              </h2>
              <ul style={{
                listStyle: 'disc',
                marginLeft: 'var(--space-lg)',
                color: 'var(--color-text)',
                lineHeight: 1.8
              }}>
                <li style={{ marginBottom: 'var(--space-sm)' }}>ISSA Certified Personal Trainer</li>
                <li style={{ marginBottom: 'var(--space-sm)' }}>ISSA Certified Nutrition Coach</li>
                <li style={{ marginBottom: 'var(--space-sm)' }}>USA Boxing Certified Coach</li>
                <li style={{ marginBottom: 'var(--space-sm)' }}>Bachelors of Science in Psychology (Sports Management Minor)</li>
                <li style={{ marginBottom: 'var(--space-sm)' }}>Certified in safe and proper body movement and equipment use by the YMCA</li>
                <li style={{ marginBottom: 'var(--space-sm)' }}>Certified in CPR, first aid, bloodborne pathogens, and AED use</li>
                <li style={{ marginBottom: 'var(--space-sm)' }}>12+ years teaching and coaching multiple sports, including boxing</li>
                <li style={{ marginBottom: 'var(--space-sm)' }}>Former assistant coach, Cincinnati High School Boxing team</li>
                <li style={{ marginBottom: 'var(--space-sm)' }}>Former president, University of Cincinnati Boxing Club (3 years)</li>
              </ul>
            </div>
          </div>

          {/* Coaching Images Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--space-lg)',
            marginBottom: 'var(--space-3xl)'
          }}>
            <div style={{
              overflow: 'hidden',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow)'
            }}>
              <img
                src={people.coachBoxing}
                alt="Katie coaching boxing technique"
                style={{
                  width: '100%',
                  height: '300px',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            </div>
            <div style={{
              overflow: 'hidden',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow)'
            }}>
              <img
                src={people.coachStrength}
                alt="Katie coaching strength training"
                style={{
                  width: '100%',
                  height: '300px',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            </div>
            <div style={{
              overflow: 'hidden',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow)'
            }}>
              <img
                src={people.coachCandid}
                alt="Katie in the gym environment"
                style={{
                  width: '100%',
                  height: '300px',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
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
              Ready to train?
            </h2>
            <p style={{
              fontSize: 'var(--font-size-lg)',
              color: 'var(--color-text-light)',
              marginBottom: 'var(--space-xl)'
            }}>
              Book your first session and we'll build a plan that fits your goals.
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
