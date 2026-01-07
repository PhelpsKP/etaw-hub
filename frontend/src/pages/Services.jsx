import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../components/Container';
import { gallery } from '../assets/images/imageRegistry';

export function Services() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const goPrev = () => setActiveIndex((i) => (i - 1 + gallery.length) % gallery.length);
  const goNext = () => setActiveIndex((i) => (i + 1) % gallery.length);

  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen]);

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
            Choose the coaching format that fits your goals, from 1:1 training to small-group conditioning.
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
            <div style={{
              color: 'var(--color-text)',
              marginBottom: 'var(--space-lg)',
              lineHeight: 1.7
            }}>
              <p style={{ marginBottom: 'var(--space-md)' }}>
                We're talking about <strong>YOUR</strong> workout, <strong>YOUR</strong> body and <strong>YOUR</strong> goals. <strong>YOUR</strong> training should be specifically tailored to meet your needs and help you achieve <strong>YOUR</strong> goals. I promise to do just that with comprehensive, unique and personalized workouts every time we train together.
              </p>
              <p style={{ marginBottom: 'var(--space-md)' }}>
                Some examples of goals for private training sessions would be:
              </p>
              <ul style={{
                listStyle: 'disc',
                marginLeft: 'var(--space-lg)',
                marginBottom: 'var(--space-md)',
                color: 'var(--color-text-light)'
              }}>
                <li style={{ marginBottom: 'var(--space-xs)' }}>technical boxing skill development/training/sparring</li>
                <li style={{ marginBottom: 'var(--space-xs)' }}>muscle-building</li>
                <li style={{ marginBottom: 'var(--space-xs)' }}>weight loss/fat loss</li>
                <li style={{ marginBottom: 'var(--space-xs)' }}>a combination of the above (again, totally based on your goals!)</li>
              </ul>
              <p style={{ marginBottom: 'var(--space-md)' }}>
                Many of my clients love to learn how to box/kickbox (i.e. hitting the bag, mitts, boxing drills) as part of their workout and are impressed with the results. Fitness boxing is an incredible full-body workout that tones and transforms.
              </p>
              <p style={{ marginBottom: 'var(--space-md)' }}>
                One-on-one sessions can also be done virtually. This could be live or through a programmed, set plan, which is updated in an app with weekly check-ins (or a combination of both).
              </p>
              <p style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                Price ranges from $55–70/session depending on how often you come and which package you choose.
              </p>
            </div>
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
            <div style={{
              color: 'var(--color-text)',
              marginBottom: 'var(--space-lg)',
              lineHeight: 1.7
            }}>
              <p style={{ marginBottom: 'var(--space-md)' }}>
                Circuit training at Elite is a full-body workout, with both resistance and cardio exercises. Exercises are refreshed every few weeks to keep things interesting, engaging, and challenging. This circuit is designed to take the guess-work out of training and help you lose fat, while gaining muscle, strength, and mobility.
              </p>
              <p style={{ marginBottom: 'var(--space-md)' }}>
                Each time you come in, you'll start with a warm up/mobility exercise, progress to strength training, and finish your workout with a cardio circuit. With a warm-up and cool-down, you can expect your workout to last 45 minutes - 1 hour.
              </p>
              <p style={{ marginBottom: 'var(--space-md)' }}>
                This type of circuit training is flexible and convenient. You're able to come anytime the gym is open. This means you can choose the best days/times for your schedule. You can tailor the circuit to your needs (go through as many times as you want, come as often as you want, do only strength training or cardio, modify as needed, etc). Easily add other services, such as nutrition consultations.
              </p>
              <p style={{ marginBottom: 'var(--space-md)' }}>
                During open circuit hours, a trainer will be in the gym, available to answer any questions, help with modifications, and correct technique.
              </p>
              <p style={{ marginBottom: 'var(--space-md)' }}>
                Your first visit to try circuit training is <strong>FREE!</strong> Call or email before you come for your first visit so we know to expect you.
              </p>
              <p style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: 'var(--space-sm)' }}>
                Prices:
              </p>
              <ul style={{
                listStyle: 'disc',
                marginLeft: 'var(--space-lg)',
                marginBottom: 0,
                color: 'var(--color-text-light)'
              }}>
                <li style={{ marginBottom: 'var(--space-xs)' }}>1 month unlimited: $80</li>
                <li style={{ marginBottom: 'var(--space-xs)' }}>3 months unlimited: $210</li>
                <li style={{ marginBottom: 'var(--space-xs)' }}>10 visits: $110</li>
                <li style={{ marginBottom: 'var(--space-xs)' }}>Drop-in: $15</li>
              </ul>
            </div>
            <Link to="/book" className="btn btn-primary" style={{ width: '100%' }}>
              Book Circuit Training
            </Link>
          </div>
        </div>

        {/* Training Gallery */}
        <section style={{ margin: 'var(--space-3xl) 0' }}>
          <h2 style={{
            fontSize: 'var(--font-size-3xl)',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: 'var(--space-md)',
            color: 'var(--color-text)'
          }}>
            Training Gallery
          </h2>
          <p style={{
            textAlign: 'center',
            fontSize: 'var(--font-size-lg)',
            color: 'var(--color-text-light)',
            marginBottom: 'var(--space-2xl)',
            maxWidth: 'var(--maxw-content)',
            margin: '0 auto var(--space-2xl)'
          }}>
            Get a glimpse into training at ETAW—strength, conditioning, and boxing in action.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 'var(--space-lg)'
          }}>
            {gallery.map((image, index) => (
              <div
                key={index}
                onClick={() => {
                  setActiveIndex(index);
                  setLightboxOpen(true);
                }}
                style={{
                  overflow: 'hidden',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-surface)',
                  boxShadow: 'var(--shadow)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'var(--shadow)';
                }}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  style={{
                    width: '100%',
                    height: '280px',
                    objectFit: 'cover',
                    display: 'block',
                    pointerEvents: 'none'
                  }}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Lightbox Modal */}
        {lightboxOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '20px'
            }}
            onClick={() => setLightboxOpen(false)}
          >
            <div
              style={{
                position: 'relative',
                maxWidth: '92vw',
                maxHeight: '92vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setLightboxOpen(false)}
                aria-label="Close"
                style={{
                  position: 'absolute',
                  top: '-50px',
                  right: '0',
                  background: 'rgba(0, 0, 0, 0.35)',
                  border: 'none',
                  color: 'white',
                  fontSize: '48px',
                  cursor: 'pointer',
                  padding: '10px',
                  lineHeight: 1,
                  zIndex: 10000,
                  borderRadius: '999px'
                }}
              >
                ×
              </button>

              {/* Navigation Buttons */}
              <button
                onClick={goPrev}
                aria-label="Previous image"
                style={{
                  position: 'absolute',
                  left: '-60px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: 'white',
                  fontSize: '64px',
                  cursor: 'pointer',
                  padding: '10px 20px',
                  lineHeight: 1,
                  borderRadius: '4px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
              >
                ‹
              </button>

              <button
                onClick={goNext}
                aria-label="Next image"
                style={{
                  position: 'absolute',
                  right: '-60px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: 'white',
                  fontSize: '64px',
                  cursor: 'pointer',
                  padding: '10px 20px',
                  lineHeight: 1,
                  borderRadius: '4px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
              >
                ›
              </button>

              {/* Image */}
              <img
                src={gallery[activeIndex].src}
                alt={gallery[activeIndex].alt}
                style={{
                  maxWidth: '90vw',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                  borderRadius: '8px'
                }}
              />
            </div>
          </div>
        )}

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
            Ready to train?
          </h2>
          <p style={{
            fontSize: 'var(--font-size-lg)',
            color: 'var(--color-text-light)',
            marginBottom: 'var(--space-xl)',
            maxWidth: 'var(--maxw-content)',
            margin: '0 auto var(--space-xl)'
          }}>
            Book your first session and we'll build a plan that fits your goals.
          </p>
          <Link to="/book" className="btn btn-primary btn-lg">
            Book Now
          </Link>
        </div>
      </Container>
    </div>
  );
}
