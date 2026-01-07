import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '../components/Container';
import { apiRequestJson } from '../lib/api';

export function ClientIntake() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  // Personal Information
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('');

  // PAR-Q (Physical Activity Readiness Questionnaire)
  const [parq1, setParq1] = useState(false); // Heart condition
  const [parq2, setParq2] = useState(false); // Chest pain
  const [parq3, setParq3] = useState(false); // Dizziness/loss of consciousness
  const [parq4, setParq4] = useState(false); // Bone/joint problem
  const [parq5, setParq5] = useState(false); // Blood pressure/heart medication
  const [parq6, setParq6] = useState(false); // Other reason
  const [parq7, setParq7] = useState(false); // Pregnant

  // Health Information
  const [medications, setMedications] = useState('');
  const [injuries, setInjuries] = useState('');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [surgeries, setSurgeries] = useState('');
  const [physicianClearance, setPhysicianClearance] = useState('no');

  // Lifestyle
  const [occupation, setOccupation] = useState('');
  const [stressLevel, setStressLevel] = useState('moderate');
  const [sleepHours, setSleepHours] = useState('');
  const [sleepQuality, setSleepQuality] = useState('good');
  const [tobaccoUse, setTobaccoUse] = useState('no');
  const [alcoholUse, setAlcoholUse] = useState('occasional');

  // Exercise History
  const [currentlyExercising, setCurrentlyExercising] = useState('no');
  const [exerciseFrequency, setExerciseFrequency] = useState('');
  const [exerciseTypes, setExerciseTypes] = useState([]);
  const [exerciseHistory, setExerciseHistory] = useState('');

  // Goals
  const [primaryGoals, setPrimaryGoals] = useState([]);
  const [specificGoals, setSpecificGoals] = useState('');
  const [timeline, setTimeline] = useState('');
  const [obstacles, setObstacles] = useState('');

  // Nutrition
  const [mealsPerDay, setMealsPerDay] = useState('');
  const [waterIntake, setWaterIntake] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [nutritionChallenges, setNutritionChallenges] = useState('');

  useEffect(() => {
    checkStatus();
  }, []);

  async function checkStatus() {
    try {
      setLoading(true);
      const data = await apiRequestJson('/api/intake/status');
      if (data.basic_submitted) {
        setAlreadySubmitted(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleExerciseTypeToggle(type) {
    setExerciseTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  }

  function handleGoalToggle(goal) {
    setPrimaryGoals(prev =>
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');

    // Validate PAR-Q - if any yes, need physician clearance
    const hasParqYes = parq1 || parq2 || parq3 || parq4 || parq5 || parq6 || parq7;
    if (hasParqYes && physicianClearance === 'no') {
      setError('Based on your health screening responses, you must obtain physician clearance before starting a fitness program. Please consult your doctor and update your response.');
      return;
    }

    const intakeData = {
      // Personal
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      dateOfBirth: dateOfBirth,
      address: address.trim(),
      emergencyContact: {
        name: emergencyName.trim(),
        phone: emergencyPhone.trim(),
        relationship: emergencyRelationship.trim()
      },

      // PAR-Q
      parq: {
        heartCondition: parq1,
        chestPain: parq2,
        dizziness: parq3,
        boneJointProblem: parq4,
        bloodPressureMedication: parq5,
        otherReason: parq6,
        pregnant: parq7,
        anyYes: hasParqYes
      },

      // Health
      health: {
        medications: medications.trim(),
        injuries: injuries.trim(),
        medicalConditions: medicalConditions.trim(),
        surgeries: surgeries.trim(),
        physicianClearance: physicianClearance
      },

      // Lifestyle
      lifestyle: {
        occupation: occupation.trim(),
        stressLevel: stressLevel,
        sleepHours: sleepHours,
        sleepQuality: sleepQuality,
        tobaccoUse: tobaccoUse,
        alcoholUse: alcoholUse
      },

      // Exercise
      exercise: {
        currentlyExercising: currentlyExercising,
        frequency: exerciseFrequency,
        types: exerciseTypes,
        history: exerciseHistory.trim()
      },

      // Goals
      goals: {
        primary: primaryGoals,
        specific: specificGoals.trim(),
        timeline: timeline.trim(),
        obstacles: obstacles.trim()
      },

      // Nutrition
      nutrition: {
        mealsPerDay: mealsPerDay,
        waterIntake: waterIntake,
        dietaryRestrictions: dietaryRestrictions.trim(),
        challenges: nutritionChallenges.trim()
      },

      submittedAt: new Date().toISOString()
    };

    try {
      setSubmitting(true);
      await apiRequestJson('/api/intake/submit', {
        method: 'POST',
        body: JSON.stringify({
          form_type: 'basic',
          data: intakeData
        })
      });

      setSuccessMessage('Intake form submitted successfully!');
      setTimeout(() => {
        navigate('/app', { replace: true });
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to submit intake form');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <Container>
        <div style={{ padding: '24px' }}>Loading...</div>
      </Container>
    );
  }

  const inputStyle = {
    width: '100%',
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginBottom: '16px'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    fontSize: '14px'
  };

  const sectionStyle = {
    marginBottom: '32px',
    padding: '24px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #dee2e6'
  };

  const checkboxLabelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
    fontSize: '14px',
    cursor: 'pointer'
  };

  return (
    <Container>
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '24px' }}>
        <h1 style={{ marginBottom: '8px' }}>Client Intake Form</h1>
        <p style={{ color: '#6c757d', marginBottom: '24px' }}>
          {alreadySubmitted
            ? 'You have already submitted your intake form. You can update it below if needed.'
            : 'Please complete this intake form to help us design the best fitness program for you.'}
        </p>

        {error && (
          <div style={{
            padding: '16px',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            marginBottom: '24px',
            color: '#721c24'
          }}>
            {error}
          </div>
        )}

        {successMessage && (
          <div style={{
            padding: '16px',
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '4px',
            marginBottom: '24px',
            color: '#155724'
          }}>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <div style={sectionStyle}>
            <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>Personal Information</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>First Name *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Last Name *</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            <label style={labelStyle}>Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              required
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Phone *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Date of Birth *</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            <label style={labelStyle}>Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={inputStyle}
              placeholder="Street, City, State, ZIP"
            />

            <h3 style={{ marginTop: '24px', marginBottom: '16px', fontSize: '18px' }}>Emergency Contact</h3>

            <label style={labelStyle}>Emergency Contact Name *</label>
            <input
              type="text"
              value={emergencyName}
              onChange={(e) => setEmergencyName(e.target.value)}
              style={inputStyle}
              required
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Emergency Contact Phone *</label>
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Relationship *</label>
                <input
                  type="text"
                  value={emergencyRelationship}
                  onChange={(e) => setEmergencyRelationship(e.target.value)}
                  style={inputStyle}
                  placeholder="e.g., Spouse, Parent, Friend"
                  required
                />
              </div>
            </div>
          </div>

          {/* PAR-Q Health Screening */}
          <div style={sectionStyle}>
            <h2 style={{ marginBottom: '8px', fontSize: '20px' }}>Health Screening (PAR-Q)</h2>
            <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '16px' }}>
              Please answer YES or NO to the following questions:
            </p>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={parq1}
                onChange={(e) => setParq1(e.target.checked)}
              />
              <span>Has your doctor ever said that you have a heart condition and that you should only perform physical activity recommended by a doctor?</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={parq2}
                onChange={(e) => setParq2(e.target.checked)}
              />
              <span>Do you feel pain in your chest when you perform physical activity?</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={parq3}
                onChange={(e) => setParq3(e.target.checked)}
              />
              <span>In the past month, have you had chest pain when you were not performing any physical activity?</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={parq4}
                onChange={(e) => setParq4(e.target.checked)}
              />
              <span>Do you lose your balance because of dizziness or do you ever lose consciousness?</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={parq5}
                onChange={(e) => setParq5(e.target.checked)}
              />
              <span>Do you have a bone or joint problem that could be made worse by a change in your physical activity?</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={parq6}
                onChange={(e) => setParq6(e.target.checked)}
              />
              <span>Is your doctor currently prescribing medication for your blood pressure or heart condition?</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={parq7}
                onChange={(e) => setParq7(e.target.checked)}
              />
              <span>Are you pregnant or have you given birth within the last 6 months?</span>
            </label>

            {(parq1 || parq2 || parq3 || parq4 || parq5 || parq6 || parq7) && (
              <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px' }}>
                <label style={labelStyle}>Have you obtained physician clearance to exercise? *</label>
                <select
                  value={physicianClearance}
                  onChange={(e) => setPhysicianClearance(e.target.value)}
                  style={inputStyle}
                  required
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
            )}
          </div>

          {/* Health Information */}
          <div style={sectionStyle}>
            <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>Health Information</h2>

            <label style={labelStyle}>Current Medications</label>
            <textarea
              value={medications}
              onChange={(e) => setMedications(e.target.value)}
              style={{ ...inputStyle, minHeight: '80px' }}
              placeholder="List any medications you are currently taking, or write 'None'"
            />

            <label style={labelStyle}>Injuries or Pain</label>
            <textarea
              value={injuries}
              onChange={(e) => setInjuries(e.target.value)}
              style={{ ...inputStyle, minHeight: '80px' }}
              placeholder="Any current or past injuries, chronic pain, or physical limitations"
            />

            <label style={labelStyle}>Medical Conditions</label>
            <textarea
              value={medicalConditions}
              onChange={(e) => setMedicalConditions(e.target.value)}
              style={{ ...inputStyle, minHeight: '80px' }}
              placeholder="Any medical conditions we should be aware of (diabetes, asthma, etc.)"
            />

            <label style={labelStyle}>Past Surgeries</label>
            <textarea
              value={surgeries}
              onChange={(e) => setSurgeries(e.target.value)}
              style={{ ...inputStyle, minHeight: '80px' }}
              placeholder="List any past surgeries and approximate dates"
            />
          </div>

          {/* Lifestyle */}
          <div style={sectionStyle}>
            <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>Lifestyle</h2>

            <label style={labelStyle}>Occupation</label>
            <input
              type="text"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              style={inputStyle}
              placeholder="What do you do for work?"
            />

            <label style={labelStyle}>Stress Level</label>
            <select
              value={stressLevel}
              onChange={(e) => setStressLevel(e.target.value)}
              style={inputStyle}
            >
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
            </select>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Average Sleep Hours/Night</label>
                <input
                  type="number"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  style={inputStyle}
                  min="0"
                  max="24"
                  step="0.5"
                  placeholder="e.g., 7.5"
                />
              </div>
              <div>
                <label style={labelStyle}>Sleep Quality</label>
                <select
                  value={sleepQuality}
                  onChange={(e) => setSleepQuality(e.target.value)}
                  style={inputStyle}
                >
                  <option value="poor">Poor</option>
                  <option value="fair">Fair</option>
                  <option value="good">Good</option>
                  <option value="excellent">Excellent</option>
                </select>
              </div>
            </div>

            <label style={labelStyle}>Tobacco Use</label>
            <select
              value={tobaccoUse}
              onChange={(e) => setTobaccoUse(e.target.value)}
              style={inputStyle}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
              <option value="former">Former User</option>
            </select>

            <label style={labelStyle}>Alcohol Use</label>
            <select
              value={alcoholUse}
              onChange={(e) => setAlcoholUse(e.target.value)}
              style={inputStyle}
            >
              <option value="none">None</option>
              <option value="occasional">Occasional (1-3 drinks/week)</option>
              <option value="moderate">Moderate (4-7 drinks/week)</option>
              <option value="frequent">Frequent (8+ drinks/week)</option>
            </select>
          </div>

          {/* Exercise History */}
          <div style={sectionStyle}>
            <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>Exercise History</h2>

            <label style={labelStyle}>Are you currently exercising regularly?</label>
            <select
              value={currentlyExercising}
              onChange={(e) => setCurrentlyExercising(e.target.value)}
              style={inputStyle}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>

            {currentlyExercising === 'yes' && (
              <>
                <label style={labelStyle}>How many days per week?</label>
                <input
                  type="number"
                  value={exerciseFrequency}
                  onChange={(e) => setExerciseFrequency(e.target.value)}
                  style={inputStyle}
                  min="1"
                  max="7"
                  placeholder="e.g., 3"
                />

                <label style={labelStyle}>Types of exercise (select all that apply):</label>
                <div style={{ marginBottom: '16px' }}>
                  {['Cardio', 'Strength Training', 'Yoga/Pilates', 'Sports', 'Walking/Running', 'Cycling', 'Swimming', 'Group Classes'].map(type => (
                    <label key={type} style={checkboxLabelStyle}>
                      <input
                        type="checkbox"
                        checked={exerciseTypes.includes(type)}
                        onChange={() => handleExerciseTypeToggle(type)}
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </>
            )}

            <label style={labelStyle}>Exercise History</label>
            <textarea
              value={exerciseHistory}
              onChange={(e) => setExerciseHistory(e.target.value)}
              style={{ ...inputStyle, minHeight: '80px' }}
              placeholder="Tell us about your past experience with exercise and fitness programs"
            />
          </div>

          {/* Goals */}
          <div style={sectionStyle}>
            <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>Fitness Goals</h2>

            <label style={labelStyle}>Primary Goals (select all that apply):</label>
            <div style={{ marginBottom: '16px' }}>
              {[
                'Weight Loss',
                'Muscle Gain',
                'Strength',
                'Endurance',
                'Flexibility',
                'Athletic Performance',
                'General Health',
                'Stress Relief',
                'Injury Rehab'
              ].map(goal => (
                <label key={goal} style={checkboxLabelStyle}>
                  <input
                    type="checkbox"
                    checked={primaryGoals.includes(goal)}
                    onChange={() => handleGoalToggle(goal)}
                  />
                  <span>{goal}</span>
                </label>
              ))}
            </div>

            <label style={labelStyle}>Specific Goals</label>
            <textarea
              value={specificGoals}
              onChange={(e) => setSpecificGoals(e.target.value)}
              style={{ ...inputStyle, minHeight: '100px' }}
              placeholder="Describe your specific fitness goals in detail (e.g., lose 20 lbs, run a 5K, bench press 200 lbs)"
            />

            <label style={labelStyle}>Timeline</label>
            <input
              type="text"
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              style={inputStyle}
              placeholder="When would you like to achieve your goals? (e.g., 3 months, 6 months, 1 year)"
            />

            <label style={labelStyle}>Obstacles or Challenges</label>
            <textarea
              value={obstacles}
              onChange={(e) => setObstacles(e.target.value)}
              style={{ ...inputStyle, minHeight: '80px' }}
              placeholder="What obstacles have prevented you from reaching your fitness goals in the past?"
            />
          </div>

          {/* Nutrition */}
          <div style={sectionStyle}>
            <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>Nutrition</h2>

            <label style={labelStyle}>Meals Per Day</label>
            <input
              type="number"
              value={mealsPerDay}
              onChange={(e) => setMealsPerDay(e.target.value)}
              style={inputStyle}
              min="1"
              max="10"
              placeholder="How many meals/snacks do you eat per day?"
            />

            <label style={labelStyle}>Daily Water Intake</label>
            <input
              type="text"
              value={waterIntake}
              onChange={(e) => setWaterIntake(e.target.value)}
              style={inputStyle}
              placeholder="e.g., 8 glasses, 64 oz, 2 liters"
            />

            <label style={labelStyle}>Dietary Restrictions or Preferences</label>
            <textarea
              value={dietaryRestrictions}
              onChange={(e) => setDietaryRestrictions(e.target.value)}
              style={{ ...inputStyle, minHeight: '80px' }}
              placeholder="Vegetarian, vegan, gluten-free, allergies, etc."
            />

            <label style={labelStyle}>Nutrition Challenges</label>
            <textarea
              value={nutritionChallenges}
              onChange={(e) => setNutritionChallenges(e.target.value)}
              style={{ ...inputStyle, minHeight: '80px' }}
              placeholder="What are your biggest challenges with nutrition? (e.g., eating out, late-night snacking, meal prep)"
            />
          </div>

          {/* Submit */}
          <div style={{
            marginTop: '24px',
            padding: '16px',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '4px',
            marginBottom: '16px'
          }}>
            <p style={{ margin: 0, fontSize: '14px' }}>
              <strong>By submitting this form, you certify that the information provided is accurate and complete to the best of your knowledge.</strong>
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '18px',
              fontWeight: 'bold',
              backgroundColor: submitting ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}
          >
            {submitting ? 'Submitting...' : alreadySubmitted ? 'Update Intake Form' : 'Submit Intake Form'}
          </button>
        </form>
      </div>
    </Container>
  );
}
