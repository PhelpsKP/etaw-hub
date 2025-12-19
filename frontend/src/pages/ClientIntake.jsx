import { useState, useEffect } from 'react';
import { Container } from '../components/Container';
import { apiRequestJson } from '../lib/api';

export function ClientIntake() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [basicData, setBasicData] = useState('');
  const [ptData, setPtData] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchStatus();
  }, []);

  async function fetchStatus() {
    try {
      setLoading(true);
      setError(null);
      const data = await apiRequestJson('/api/intake/status');
      setStatus(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(formType) {
    const dataStr = formType === 'basic' ? basicData : ptData;

    if (!dataStr.trim()) {
      setError('Please enter form data as JSON');
      return;
    }

    let parsedData;
    try {
      parsedData = JSON.parse(dataStr);
    } catch (err) {
      setError('Invalid JSON format. Please check your input.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccessMessage('');

      await apiRequestJson('/api/intake/submit', {
        method: 'POST',
        body: JSON.stringify({
          form_type: formType,
          data: parsedData
        })
      });

      setSuccessMessage(`${formType === 'basic' ? 'Basic' : 'PT'} intake form submitted successfully!`);

      if (formType === 'basic') setBasicData('');
      if (formType === 'pt') setPtData('');

      await fetchStatus();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <Container>
        <div style={{ padding: 'var(--space-xl)' }}>Loading intake status...</div>
      </Container>
    );
  }

  return (
    <Container>
      <div style={{ padding: 'var(--space-xl) 0', maxWidth: 'var(--maxw-content)', margin: '0 auto' }}>
        <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-md)' }}>
          Intake Forms
        </h1>
        <p style={{ color: 'var(--color-text-light)', marginBottom: 'var(--space-2xl)' }}>
          Complete your intake forms to help your trainer design the best program for you.
        </p>

        {error && (
          <div style={{
            padding: 'var(--space-md)',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: 'var(--radius)',
            marginBottom: 'var(--space-lg)',
            color: 'var(--color-error)'
          }}>
            {error}
          </div>
        )}

        {successMessage && (
          <div style={{
            padding: 'var(--space-md)',
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: 'var(--radius)',
            marginBottom: 'var(--space-lg)',
            color: '#155724'
          }}>
            {successMessage}
          </div>
        )}

        {/* Basic Intake */}
        <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
            <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>
              Basic Intake Form
            </h2>
            {status?.basic_submitted && (
              <span style={{
                padding: 'var(--space-xs) var(--space-sm)',
                backgroundColor: 'var(--color-success)',
                color: 'white',
                borderRadius: 'var(--radius)',
                fontSize: 'var(--font-size-sm)'
              }}>
                ✓ Submitted
              </span>
            )}
          </div>

          <p style={{ color: 'var(--color-text-light)', marginBottom: 'var(--space-lg)' }}>
            {status?.basic_submitted
              ? 'You have submitted your basic intake form. You can update it anytime below.'
              : 'Please submit your basic information. For now, enter your data as JSON format.'}
          </p>

          <div style={{ marginBottom: 'var(--space-md)' }}>
            <label style={{ display: 'block', marginBottom: 'var(--space-sm)', fontWeight: 500 }}>
              Form Data (JSON format)
            </label>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-sm)' }}>
              Example: {`{"goals": "Build strength", "experience": "Beginner", "injuries": "None"}`}
            </p>
            <textarea
              value={basicData}
              onChange={(e) => setBasicData(e.target.value)}
              rows={6}
              style={{
                width: '100%',
                padding: 'var(--space-md)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                fontFamily: 'monospace',
                fontSize: 'var(--font-size-sm)'
              }}
              placeholder='{"goals": "Your fitness goals", "experience": "Beginner/Intermediate/Advanced"}'
            />
          </div>

          <button
            onClick={() => handleSubmit('basic')}
            disabled={submitting || !basicData.trim()}
            className="btn btn-primary"
          >
            {submitting ? 'Submitting...' : status?.basic_submitted ? 'Update Basic Form' : 'Submit Basic Form'}
          </button>
        </div>

        {/* PT Intake (if required or already submitted) */}
        {(status?.pt_required || status?.pt_submitted) && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
              <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>
                Personal Training Intake Form
              </h2>
              <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                {status?.pt_required && (
                  <span style={{
                    padding: 'var(--space-xs) var(--space-sm)',
                    backgroundColor: 'var(--color-warning)',
                    color: 'white',
                    borderRadius: 'var(--radius)',
                    fontSize: 'var(--font-size-sm)'
                  }}>
                    Required
                  </span>
                )}
                {status?.pt_submitted && (
                  <span style={{
                    padding: 'var(--space-xs) var(--space-sm)',
                    backgroundColor: 'var(--color-success)',
                    color: 'white',
                    borderRadius: 'var(--radius)',
                    fontSize: 'var(--font-size-sm)'
                  }}>
                    ✓ Submitted
                  </span>
                )}
              </div>
            </div>

            <p style={{ color: 'var(--color-text-light)', marginBottom: 'var(--space-lg)' }}>
              {status?.pt_submitted
                ? 'You have submitted your PT intake form. You can update it anytime below.'
                : 'Additional questions for personal training clients. Enter your data as JSON format.'}
            </p>

            <div style={{ marginBottom: 'var(--space-md)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--space-sm)', fontWeight: 500 }}>
                Form Data (JSON format)
              </label>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-sm)' }}>
                Example: {`{"medical_conditions": "None", "medications": "None", "training_frequency": "3x/week"}`}
              </p>
              <textarea
                value={ptData}
                onChange={(e) => setPtData(e.target.value)}
                rows={6}
                style={{
                  width: '100%',
                  padding: 'var(--space-md)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius)',
                  fontFamily: 'monospace',
                  fontSize: 'var(--font-size-sm)'
                }}
                placeholder='{"medical_conditions": "Any medical conditions", "medications": "Current medications"}'
              />
            </div>

            <button
              onClick={() => handleSubmit('pt')}
              disabled={submitting || !ptData.trim()}
              className="btn btn-primary"
            >
              {submitting ? 'Submitting...' : status?.pt_submitted ? 'Update PT Form' : 'Submit PT Form'}
            </button>
          </div>
        )}

        {!status?.pt_required && !status?.pt_submitted && (
          <div style={{
            padding: 'var(--space-md)',
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-light)'
          }}>
            PT intake form is not currently required for your account.
          </div>
        )}
      </div>
    </Container>
  );
}
