import { useState, useEffect } from 'react';
import { Container } from '../components/Container';
import { apiRequestJson } from '../lib/api';

export function ClientWorkouts() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedWorkoutId, setExpandedWorkoutId] = useState(null);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  async function fetchWorkouts() {
    try {
      setLoading(true);
      setError(null);
      const data = await apiRequestJson('/api/workouts');
      setWorkouts(data.workouts || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function toggleWorkout(workoutId) {
    setExpandedWorkoutId(expandedWorkoutId === workoutId ? null : workoutId);
  }

  if (loading) {
    return (
      <Container>
        <div style={{ padding: 'var(--space-xl)' }}>Loading workouts...</div>
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
        <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-lg)' }}>
          My Workouts
        </h1>

        {workouts.length === 0 ? (
          <div className="card">
            <p style={{ color: 'var(--color-text-light)' }}>
              No workouts assigned yet. Your trainer will assign workouts for you to follow.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {workouts.map((workout) => (
              <div key={workout.id} className="card">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleWorkout(workout.id)}
                >
                  <div>
                    <h2 style={{
                      fontSize: 'var(--font-size-xl)',
                      fontWeight: 700,
                      color: 'var(--color-primary)',
                      marginBottom: 'var(--space-sm)'
                    }}>
                      {workout.name}
                    </h2>
                    {workout.description && (
                      <p style={{ color: 'var(--color-text-light)' }}>
                        {workout.description}
                      </p>
                    )}
                    <p style={{
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--color-muted)',
                      marginTop: 'var(--space-sm)'
                    }}>
                      {workout.exercises?.length || 0} exercise{workout.exercises?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <button className="btn btn-sm btn-secondary">
                    {expandedWorkoutId === workout.id ? 'Hide' : 'View'} Exercises
                  </button>
                </div>

                {expandedWorkoutId === workout.id && workout.exercises && (
                  <div style={{ marginTop: 'var(--space-xl)', paddingTop: 'var(--space-xl)', borderTop: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
                      {workout.exercises.map((exercise, index) => (
                        <div key={exercise.id} style={{
                          padding: 'var(--space-lg)',
                          backgroundColor: 'var(--color-surface)',
                          borderRadius: 'var(--radius-lg)'
                        }}>
                          <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start' }}>
                            <div style={{
                              minWidth: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--color-primary)',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700
                            }}>
                              {index + 1}
                            </div>
                            <div style={{ flex: 1 }}>
                              <h3 style={{
                                fontSize: 'var(--font-size-lg)',
                                fontWeight: 600,
                                marginBottom: 'var(--space-sm)'
                              }}>
                                {exercise.name}
                              </h3>
                              {exercise.description && (
                                <p style={{
                                  color: 'var(--color-text-light)',
                                  marginBottom: 'var(--space-md)'
                                }}>
                                  {exercise.description}
                                </p>
                              )}
                              {exercise.difficulty && (
                                <span style={{
                                  display: 'inline-block',
                                  padding: 'var(--space-xs) var(--space-sm)',
                                  backgroundColor: 'var(--color-accent-light)',
                                  borderRadius: 'var(--radius)',
                                  fontSize: 'var(--font-size-sm)',
                                  marginRight: 'var(--space-sm)'
                                }}>
                                  {exercise.difficulty}
                                </span>
                              )}
                              {exercise.equipment && exercise.equipment.length > 0 && (
                                <span style={{
                                  fontSize: 'var(--font-size-sm)',
                                  color: 'var(--color-text-light)'
                                }}>
                                  Equipment: {exercise.equipment.join(', ')}
                                </span>
                              )}
                              {exercise.cues && exercise.cues.length > 0 && (
                                <div style={{ marginTop: 'var(--space-md)' }}>
                                  <strong style={{ fontSize: 'var(--font-size-sm)' }}>Cues:</strong>
                                  <ul style={{ margin: 'var(--space-sm) 0', paddingLeft: 'var(--space-lg)' }}>
                                    {exercise.cues.map((cue, i) => (
                                      <li key={i} style={{ fontSize: 'var(--font-size-sm)' }}>{cue}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {exercise.embed_url && (
                                <div style={{ marginTop: 'var(--space-md)' }}>
                                  <iframe
                                    width="100%"
                                    height="315"
                                    src={exercise.embed_url}
                                    title={exercise.name}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    style={{ borderRadius: 'var(--radius)' }}
                                  ></iframe>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
