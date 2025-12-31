import { Link } from 'react-router-dom';
import { Container } from '../components/Container';
import { useAuth } from '../contexts/AuthContext';

export function Home() {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section" style={{
        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
        color: 'white',
        padding: 'var(--space-3xl) 0',
        minHeight: '500px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <Container>
          <div style={{
            maxWidth: 'var(--maxw-content)',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <h1 style={{
              fontSize: 'var(--font-size-4xl)',
              fontWeight: 800,
              marginBottom: 'var(--space-lg)',
              lineHeight: 1.2
            }}>
              Transform Your Fitness Journey
            </h1>
            <p style={{
              fontSize: 'var(--font-size-xl)',
              marginBottom: 'var(--space-2xl)',
              opacity: 0.95,
              lineHeight: 1.6
            }}>
              Expert personal training and circuit classes designed to help you reach your goals
              and build lasting strength and wellness.
            </p>
            <div style={{
              display: 'flex',
              gap: 'var(--space-md)',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              {user ? (
                <Link to="/app" className="btn btn-lg" style={{
                  backgroundColor: 'white',
                  color: 'var(--color-primary)',
                  fontWeight: 700
                }}>
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/book" className="btn btn-lg" style={{
                    backgroundColor: 'white',
                    color: 'var(--color-primary)',
                    fontWeight: 700
                  }}>
                    Book a Session
                  </Link>
                  <Link to="/services" className="btn btn-lg" style={{
                    backgroundColor: 'transparent',
                    border: '2px solid white',
                    color: 'white'
                  }}>
                    View Services
                  </Link>
                </>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* Services Preview */}
      <section style={{ padding: 'var(--space-3xl) 0' }}>
        <Container>
          <h2 style={{
            fontSize: 'var(--font-size-3xl)',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: 'var(--space-sm)',
            color: 'var(--color-text)'
          }}>
            What We Offer
          </h2>
          <p style={{
            textAlign: 'center',
            fontSize: 'var(--font-size-lg)',
            color: 'var(--color-text-light)',
            marginBottom: 'var(--space-2xl)',
            maxWidth: 'var(--maxw-content)',
            margin: '0 auto var(--space-2xl)'
          }}>
            Customized training programs for every fitness level and goal.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--space-2xl)'
          }}>
            <div className="card">
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-accent-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 'var(--space-lg)',
                fontSize: 'var(--font-size-3xl)'
              }}>
                💪
              </div>
              <h3 style={{
                fontSize: 'var(--font-size-2xl)',
                fontWeight: 700,
                color: 'var(--color-primary)',
                marginBottom: 'var(--space-md)'
              }}>
                Personal Training
              </h3>
              <p style={{
                color: 'var(--color-text-light)',
                lineHeight: 1.7,
                marginBottom: 'var(--space-lg)'
              }}>
                One-on-one sessions tailored to your specific goals. Get expert guidance, custom
                workout plans, and the accountability you need to succeed.
              </p>
              <Link to="/services" style={{
                color: 'var(--color-primary)',
                fontWeight: 600,
                textDecoration: 'none'
              }}>
                Learn more →
              </Link>
            </div>

            <div className="card">
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-accent-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 'var(--space-lg)',
                fontSize: 'var(--font-size-3xl)'
              }}>
                🔥
              </div>
              <h3 style={{
                fontSize: 'var(--font-size-2xl)',
                fontWeight: 700,
                color: 'var(--color-primary)',
                marginBottom: 'var(--space-md)'
              }}>
                Circuit Training
              </h3>
              <p style={{
                color: 'var(--color-text-light)',
                lineHeight: 1.7,
                marginBottom: 'var(--space-lg)'
              }}>
                High-energy group sessions combining strength and cardio. Challenge yourself
                alongside others in a supportive, motivating environment.
              </p>
              <Link to="/services" style={{
                color: 'var(--color-primary)',
                fontWeight: 600,
                textDecoration: 'none'
              }}>
                Learn more →
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Testimonials */}
      <section style={{
        backgroundColor: 'var(--color-surface)',
        padding: 'var(--space-3xl) 0'
      }}>
        <Container>
          <h2 style={{
            fontSize: 'var(--font-size-3xl)',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: 'var(--space-2xl)',
            color: 'var(--color-text)'
          }}>
            What Our Clients Say
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--space-xl)',
            maxWidth: '900px',
            margin: '0 auto'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: 'var(--space-xl)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow)'
            }}>
              <p style={{
                fontSize: 'var(--font-size-lg)',
                fontStyle: 'italic',
                color: 'var(--color-text)',
                marginBottom: 'var(--space-md)',
                lineHeight: 1.7
              }}>
                "Katie's training has completely transformed how I approach fitness. I'm stronger,
                more confident, and actually enjoying my workouts for the first time."
              </p>
              <p style={{
                fontWeight: 600,
                color: 'var(--color-primary)'
              }}>
                — Sarah M.
              </p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: 'var(--space-xl)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow)'
            }}>
              <p style={{
                fontSize: 'var(--font-size-lg)',
                fontStyle: 'italic',
                color: 'var(--color-text)',
                marginBottom: 'var(--space-md)',
                lineHeight: 1.7
              }}>
                "The circuit classes are challenging but so much fun. Great mix of people at all
                levels, and Katie keeps everyone motivated and safe."
              </p>
              <p style={{
                fontWeight: 600,
                color: 'var(--color-primary)'
              }}>
                — James R.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section style={{ padding: 'var(--space-3xl) 0' }}>
        <Container>
          <div style={{
            maxWidth: 'var(--maxw-content)',
            margin: '0 auto',
            textAlign: 'center',
            padding: 'var(--space-3xl)',
            backgroundColor: 'var(--color-accent-light)',
            borderRadius: 'var(--radius-lg)'
          }}>
            <h2 style={{
              fontSize: 'var(--font-size-3xl)',
              fontWeight: 700,
              marginBottom: 'var(--space-md)',
              color: 'var(--color-text)'
            }}>
              Ready to Start Your Journey?
            </h2>
            <p style={{
              fontSize: 'var(--font-size-lg)',
              color: 'var(--color-text-light)',
              marginBottom: 'var(--space-xl)',
              lineHeight: 1.7
            }}>
              Join Elite Training & Wellness today and take the first step toward becoming
              the strongest version of yourself.
            </p>
            {user ? (
              <Link to="/app" className="btn btn-primary btn-lg">
                Go to Dashboard
              </Link>
            ) : (
              <div style={{
                display: 'flex',
                gap: 'var(--space-md)',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <Link to="/book" className="btn btn-primary btn-lg">
                  Book a Session
                </Link>
                <Link to="/about" className="btn btn-secondary btn-lg">
                  Learn More
                </Link>
              </div>
            )}
          </div>
        </Container>
      </section>
    </div>
  );
}
