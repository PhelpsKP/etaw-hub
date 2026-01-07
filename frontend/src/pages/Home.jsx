import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../components/Container';
import { useAuth } from '../contexts/AuthContext';
import { hero, people } from '../assets/images/imageRegistry';
import { testimonials } from '../content/testimonials';

export function Home() {
  const { user } = useAuth();
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);
  const intervalRef = useRef(null);

  // Ensure active index is always in bounds when testimonials length changes
  useEffect(() => {
    if (activeTestimonialIndex >= testimonials.length && testimonials.length > 0) {
      setActiveTestimonialIndex(0);
    }
  }, [testimonials.length, activeTestimonialIndex]);

  // Auto-cycle testimonials every 6 seconds
  useEffect(() => {
    if (testimonials.length === 0) return;

    const startInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(() => {
        setActiveTestimonialIndex((current) => (current + 1) % testimonials.length);
      }, 6000);
    };

    startInterval();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [testimonials.length]);

  // Handle manual testimonial navigation
  const handleDotClick = (index) => {
    setActiveTestimonialIndex(index);
    // Restart the timer when user manually navigates
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setActiveTestimonialIndex((current) => (current + 1) % testimonials.length);
    }, 6000);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section" style={{
        padding: 'var(--space-xl) 0'
      }}>
        <Container>
          <div style={{
            position: 'relative',
            maxWidth: '1200px',
            margin: '0 auto',
            minHeight: '520px',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: 'var(--shadow)',
            backgroundImage: `url(${hero.primary})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 20%',
            backgroundRepeat: 'no-repeat',
            display: 'flex',
            alignItems: 'center'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.55)',
              zIndex: 1,
              pointerEvents: 'none'
            }}></div>
            <div style={{
              position: 'relative',
              zIndex: 2,
              width: '100%',
              padding: 'var(--space-2xl)',
              textAlign: 'center'
            }}>
              <div style={{
                background: 'rgba(0, 0, 0, 0.75)',
                borderRadius: '14px',
                padding: '32px',
                maxWidth: '700px',
                margin: '0 auto'
              }}>
                <h1 style={{
                  fontSize: 'var(--font-size-4xl)',
                  fontWeight: 700,
                  marginBottom: 'var(--space-lg)',
                  lineHeight: 1.2,
                  color: '#fff'
                }}>
                  Welcome to Elite Training & Wellness
                </h1>
                <p style={{
                  fontSize: 'var(--font-size-lg)',
                  marginBottom: 'var(--space-2xl)',
                  lineHeight: 1.7,
                  color: '#fff'
                }}>
                  At Elite Training & Wellness, fitness is more than workouts — it's a lifestyle. We help you train smart, build lasting habits, and create positive change that strengthens your body and your life.
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
            Training built around you, whether you're working one-on-one or in a small group.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--space-2xl)'
          }}>
            <div className="card">
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
                One-on-one coaching built around your goals, your schedule, and sustainable progress.
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
                High-energy small-group training that blends strength and conditioning, with coaching and scalable options.
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

      {/* About Me */}
      <section style={{
        backgroundColor: 'var(--color-surface)',
        padding: 'var(--space-3xl) 0'
      }}>
        <Container>
          <div style={{
            maxWidth: 'var(--maxw-content)',
            margin: '0 auto'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 'var(--space-2xl)',
              alignItems: 'center',
              marginBottom: 'var(--space-2xl)'
            }}>
              <div>
                <img
                  src={people.coachBoxing}
                  alt="Katie coaching boxing technique"
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow)'
                  }}
                />
              </div>
              <div>
                <h2 style={{
                  fontSize: 'var(--font-size-3xl)',
                  fontWeight: 700,
                  color: 'var(--color-primary)',
                  marginBottom: 'var(--space-lg)'
                }}>
                  Meet Katie
                </h2>
                <p style={{
                  fontSize: 'var(--font-size-base)',
                  lineHeight: 1.8,
                  color: 'var(--color-text)',
                  marginBottom: 'var(--space-md)'
                }}>
                  Hi, I'm Katie! I am here to help you identify your fitness goals, design an exercise program that fits your needs, and guide you through every exercise during every workout. My holistic approach to fitness and health will have you feeling great and seeing results in no time.
                </p>
                <p style={{
                  fontSize: 'var(--font-size-base)',
                  lineHeight: 1.8,
                  color: 'var(--color-text)',
                  marginBottom: 'var(--space-md)'
                }}>
                  I am a certified personal trainer and nutrition coach through The International Sports Sciences Association (ISSA). I also have a bachelor's degree in Psychology and a minor in Sports Management.
                </p>
                <p style={{
                  fontSize: 'var(--font-size-base)',
                  lineHeight: 1.8,
                  color: 'var(--color-text)'
                }}>
                  I have always been passionate about fitness, having played a wide variety of sports since childhood. I hold a current passbook with USA Boxing and often compete in tournaments and matches.
                </p>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 'var(--space-lg)'
            }}>
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
                    height: '280px',
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
                    height: '280px',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
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
              maxWidth: '700px',
              margin: '0 auto'
            }}>
              {/* Single testimonial card with fade transition */}
              <div
                key={activeTestimonialIndex}
                style={{
                  backgroundColor: 'white',
                  padding: 'var(--space-xl)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow)',
                  minHeight: '200px',
                  animation: 'fadeIn 0.5s ease-in-out'
                }}
              >
                <p style={{
                  fontSize: 'var(--font-size-lg)',
                  fontStyle: 'italic',
                  color: 'var(--color-text)',
                  marginBottom: 'var(--space-md)',
                  lineHeight: 1.7
                }}>
                  "{testimonials[activeTestimonialIndex].quote}"
                </p>
                <p style={{
                  fontWeight: 600,
                  color: 'var(--color-primary)'
                }}>
                  — {testimonials[activeTestimonialIndex].author}
                </p>
              </div>

              {/* Dot indicators */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 'var(--space-sm)',
                marginTop: 'var(--space-xl)'
              }}>
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    aria-label={`View testimonial ${index + 1}`}
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      border: 'none',
                      backgroundColor: index === activeTestimonialIndex
                        ? 'var(--color-primary)'
                        : 'var(--color-border)',
                      cursor: 'pointer',
                      padding: 0,
                      transition: 'background-color 0.3s ease'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Fade-in animation */}
            <style>{`
              @keyframes fadeIn {
                from {
                  opacity: 0;
                }
                to {
                  opacity: 1;
                }
              }
            `}</style>
          </Container>
        </section>
      )}

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
              Ready to train?
            </h2>
            <p style={{
              fontSize: 'var(--font-size-lg)',
              color: 'var(--color-text-light)',
              marginBottom: 'var(--space-xl)',
              lineHeight: 1.7
            }}>
              Book your first session and we'll build a plan that fits your goals.
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
