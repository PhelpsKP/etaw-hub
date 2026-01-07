/**
 * Client Intake Form - Based on Katie's Intake Packet
 *
 * Smoke Test Plan:
 * 1. Sign up new user → redirected to /waiver
 * 2. Sign waiver → redirected to /app/intake
 * 3. Fill out intake form with all required fields
 * 4. Submit → redirected to /app/book
 * 5. Verify submission stored in DB (admin can view)
 * 6. Try to book session → should succeed (backend checks intake)
 * 7. Try to access /app/book directly without intake → redirected to /app/intake
 */

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

  // PERSONAL INFO
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [height, setHeight] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [employer, setEmployer] = useState('');
  const [occupation, setOccupation] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [altContact, setAltContact] = useState('');
  const [referralSource, setReferralSource] = useState('');

  // LIFESTYLE QUESTIONNAIRE
  const [smoker, setSmoker] = useState('no');
  const [smokesPerDay, setSmokesPerDay] = useState('');
  const [formerSmokerQuitDate, setFormerSmokerQuitDate] = useState('');
  const [drinksAlcohol, setDrinksAlcohol] = useState('no');
  const [alcoholPerWeek, setAlcoholPerWeek] = useState('');
  const [takesSupplements, setTakesSupplements] = useState('no');
  const [supplementsList, setSupplementsList] = useState('');
  const [sleepHours, setSleepHours] = useState('');

  // GOALS / PROGRAM INFO
  const [healthGoal1, setHealthGoal1] = useState('');
  const [healthGoal2, setHealthGoal2] = useState('');
  const [healthGoal3, setHealthGoal3] = useState('');
  const [goalsImportance, setGoalsImportance] = useState('');
  const [trainerImportance, setTrainerImportance] = useState('');
  const [obstacle1, setObstacle1] = useState('');
  const [obstacle2, setObstacle2] = useState('');
  const [obstacle3, setObstacle3] = useState('');

  // NUTRITION
  const [nutritionRating, setNutritionRating] = useState('');
  const [mealsPerDay, setMealsPerDay] = useState('');
  const [skipMeals, setSkipMeals] = useState('no');
  const [eatingActivities, setEatingActivities] = useState('');
  const [waterGlasses, setWaterGlasses] = useState('');
  const [regularFoods, setRegularFoods] = useState('');
  const [knowsCalories, setKnowsCalories] = useState('no');
  const [dailyCalories, setDailyCalories] = useState('');
  const [nutritionGoal1, setNutritionGoal1] = useState('');
  const [nutritionGoal2, setNutritionGoal2] = useState('');
  const [nutritionGoal3, setNutritionGoal3] = useState('');
  const [additionalConcerns, setAdditionalConcerns] = useState('');

  // PAR-Q (Health Screening)
  const [parq1, setParq1] = useState('');
  const [parq2, setParq2] = useState('');
  const [parq3, setParq3] = useState('');
  const [parq4, setParq4] = useState('');
  const [parq5, setParq5] = useState('');
  const [parq6, setParq6] = useState('');
  const [parq7, setParq7] = useState('');
  const [parqDetails, setParqDetails] = useState('');

  // CERTIFICATION + SIGNATURE
  const [certificationAgreed, setCertificationAgreed] = useState(false);
  const [signature, setSignature] = useState('');
  const [signatureDate, setSignatureDate] = useState('');

  useEffect(() => {
    checkStatus();
    // Auto-fill today's date
    const today = new Date().toISOString().split('T')[0];
    setSignatureDate(today);
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

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');

    // Check if any PAR-Q is YES and details not provided
    const hasParqYes = [parq1, parq2, parq3, parq4, parq5, parq6, parq7].some(q => q === 'yes');
    if (hasParqYes && !parqDetails.trim()) {
      setError('You answered YES to a PAR-Q question. Please provide details.');
      return;
    }

    const intakeData = {
      personalInfo: {
        name: name.trim(),
        dateOfBirth: dateOfBirth,
        height: height.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        zip: zip.trim(),
        phone: phone.trim(),
        email: email.trim(),
        employer: employer.trim(),
        occupation: occupation.trim(),
        emergencyContact: emergencyContact.trim(),
        emergencyRelationship: emergencyRelationship.trim(),
        emergencyPhone: emergencyPhone.trim(),
        altContact: altContact.trim(),
        referralSource: referralSource.trim()
      },
      lifestyle: {
        smoker: smoker,
        smokesPerDay: smokesPerDay.trim(),
        formerSmokerQuitDate: formerSmokerQuitDate.trim(),
        drinksAlcohol: drinksAlcohol,
        alcoholPerWeek: alcoholPerWeek.trim(),
        takesSupplements: takesSupplements,
        supplementsList: supplementsList.trim(),
        sleepHours: sleepHours.trim()
      },
      goals: {
        healthGoals: [
          healthGoal1.trim(),
          healthGoal2.trim(),
          healthGoal3.trim()
        ],
        goalsImportance: goalsImportance,
        trainerImportance: trainerImportance.trim(),
        obstacles: [
          obstacle1.trim(),
          obstacle2.trim(),
          obstacle3.trim()
        ]
      },
      nutrition: {
        rating: nutritionRating,
        mealsPerDay: mealsPerDay.trim(),
        skipMeals: skipMeals,
        eatingActivities: eatingActivities.trim(),
        waterGlasses: waterGlasses.trim(),
        regularFoods: regularFoods.trim(),
        knowsCalories: knowsCalories,
        dailyCalories: dailyCalories.trim(),
        nutritionGoals: [
          nutritionGoal1.trim(),
          nutritionGoal2.trim(),
          nutritionGoal3.trim()
        ],
        additionalConcerns: additionalConcerns.trim()
      },
      parq: {
        question1: parq1,
        question2: parq2,
        question3: parq3,
        question4: parq4,
        question5: parq5,
        question6: parq6,
        question7: parq7,
        hasYes: hasParqYes,
        details: parqDetails.trim()
      },
      certification: {
        agreed: certificationAgreed,
        signature: signature.trim(),
        date: signatureDate
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

      setSuccessMessage('Intake form submitted successfully! Redirecting...');
      setTimeout(() => {
        navigate('/app/book', { replace: true });
      }, 1500);
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

  return (
    <Container>
      <div style={{ maxWidth: '900px', margin: '40px auto', padding: '24px' }}>
        <h1 style={{ marginBottom: '8px' }}>Client Intake Form</h1>
        <p style={{ color: '#6c757d', marginBottom: '24px' }}>
          {alreadySubmitted
            ? 'You have already submitted your intake form. You can update it below if needed.'
            : 'Please complete this form to help us design the best fitness program for you.'}
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
          {/* PERSONAL INFO */}
          <div style={sectionStyle}>
            <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>Personal Information</h2>

            <label style={labelStyle}>Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              required
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
              <div>
                <label style={labelStyle}>Height</label>
                <input
                  type="text"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  style={inputStyle}
                  placeholder="e.g., 5'10&quot;"
                />
              </div>
            </div>

            <label style={labelStyle}>Address / Apt #</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={inputStyle}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  style={inputStyle}
                  maxLength="2"
                  placeholder="CA"
                />
              </div>
              <div>
                <label style={labelStyle}>Zip</label>
                <input
                  type="text"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  style={inputStyle}
                  maxLength="10"
                />
              </div>
            </div>

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
                <label style={labelStyle}>Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Employer</label>
                <input
                  type="text"
                  value={employer}
                  onChange={(e) => setEmployer(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Occupation</label>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <h3 style={{ marginTop: '24px', marginBottom: '16px', fontSize: '18px' }}>Emergency Contact</h3>

            <label style={labelStyle}>Emergency Contact *</label>
            <input
              type="text"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              style={inputStyle}
              required
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Relationship *</label>
                <input
                  type="text"
                  value={emergencyRelationship}
                  onChange={(e) => setEmergencyRelationship(e.target.value)}
                  style={inputStyle}
                  placeholder="e.g., Spouse, Parent"
                  required
                />
              </div>
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
            </div>

            <label style={labelStyle}>Alt. Phone/Contact</label>
            <input
              type="text"
              value={altContact}
              onChange={(e) => setAltContact(e.target.value)}
              style={inputStyle}
              placeholder="Alternative phone number or contact person"
            />

            <label style={labelStyle}>How did you hear about me?</label>
            <input
              type="text"
              value={referralSource}
              onChange={(e) => setReferralSource(e.target.value)}
              style={inputStyle}
              placeholder="Referral, social media, website, etc."
            />
          </div>

          {/* LIFESTYLE QUESTIONNAIRE */}
          <div style={sectionStyle}>
            <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>Lifestyle Questionnaire</h2>

            <label style={labelStyle}>Do you smoke?</label>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', marginRight: '24px' }}>
                <input
                  type="radio"
                  value="no"
                  checked={smoker === 'no'}
                  onChange={(e) => setSmoker(e.target.value)}
                  style={{ marginRight: '8px' }}
                />
                No
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center' }}>
                <input
                  type="radio"
                  value="yes"
                  checked={smoker === 'yes'}
                  onChange={(e) => setSmoker(e.target.value)}
                  style={{ marginRight: '8px' }}
                />
                Yes
              </label>
            </div>

            {smoker === 'yes' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>How many per day?</label>
                <input
                  type="text"
                  value={smokesPerDay}
                  onChange={(e) => setSmokesPerDay(e.target.value)}
                  style={inputStyle}
                />
              </div>
            )}

            <label style={labelStyle}>If former smoker, quit date</label>
            <input
              type="text"
              value={formerSmokerQuitDate}
              onChange={(e) => setFormerSmokerQuitDate(e.target.value)}
              style={inputStyle}
              placeholder="e.g., January 2020"
            />

            <label style={labelStyle}>Do you drink alcohol?</label>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', marginRight: '24px' }}>
                <input
                  type="radio"
                  value="no"
                  checked={drinksAlcohol === 'no'}
                  onChange={(e) => setDrinksAlcohol(e.target.value)}
                  style={{ marginRight: '8px' }}
                />
                No
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center' }}>
                <input
                  type="radio"
                  value="yes"
                  checked={drinksAlcohol === 'yes'}
                  onChange={(e) => setDrinksAlcohol(e.target.value)}
                  style={{ marginRight: '8px' }}
                />
                Yes
              </label>
            </div>

            {drinksAlcohol === 'yes' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>How much per week?</label>
                <input
                  type="text"
                  value={alcoholPerWeek}
                  onChange={(e) => setAlcoholPerWeek(e.target.value)}
                  style={inputStyle}
                  placeholder="e.g., 2-3 drinks"
                />
              </div>
            )}

            <label style={labelStyle}>Are you currently taking a multi-vitamin or any other supplements?</label>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', marginRight: '24px' }}>
                <input
                  type="radio"
                  value="no"
                  checked={takesSupplements === 'no'}
                  onChange={(e) => setTakesSupplements(e.target.value)}
                  style={{ marginRight: '8px' }}
                />
                No
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center' }}>
                <input
                  type="radio"
                  value="yes"
                  checked={takesSupplements === 'yes'}
                  onChange={(e) => setTakesSupplements(e.target.value)}
                  style={{ marginRight: '8px' }}
                />
                Yes
              </label>
            </div>

            {takesSupplements === 'yes' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Please list</label>
                <textarea
                  value={supplementsList}
                  onChange={(e) => setSupplementsList(e.target.value)}
                  style={{ ...inputStyle, minHeight: '80px' }}
                />
              </div>
            )}

            <label style={labelStyle}>How many hours do you regularly sleep at night?</label>
            <input
              type="text"
              value={sleepHours}
              onChange={(e) => setSleepHours(e.target.value)}
              style={inputStyle}
              placeholder="e.g., 7-8 hours"
            />
          </div>

          {/* GOALS / PROGRAM INFO */}
          <div style={sectionStyle}>
            <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>Goals / Program Info</h2>

            <label style={labelStyle}>List three things you would like to improve pertaining to your health/fitness:</label>

            <label style={{ ...labelStyle, fontWeight: 400 }}>a)</label>
            <input
              type="text"
              value={healthGoal1}
              onChange={(e) => setHealthGoal1(e.target.value)}
              style={inputStyle}
            />

            <label style={{ ...labelStyle, fontWeight: 400 }}>b)</label>
            <input
              type="text"
              value={healthGoal2}
              onChange={(e) => setHealthGoal2(e.target.value)}
              style={inputStyle}
            />

            <label style={{ ...labelStyle, fontWeight: 400 }}>c)</label>
            <input
              type="text"
              value={healthGoal3}
              onChange={(e) => setHealthGoal3(e.target.value)}
              style={inputStyle}
            />

            <label style={labelStyle}>How important is it for you to achieve these?</label>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px' }}>
                <input
                  type="radio"
                  value="not-important"
                  checked={goalsImportance === 'not-important'}
                  onChange={(e) => setGoalsImportance(e.target.value)}
                  style={{ marginRight: '8px' }}
                />
                Not important
              </label>
              <label style={{ display: 'block', marginBottom: '8px' }}>
                <input
                  type="radio"
                  value="semi-important"
                  checked={goalsImportance === 'semi-important'}
                  onChange={(e) => setGoalsImportance(e.target.value)}
                  style={{ marginRight: '8px' }}
                />
                Semi-important
              </label>
              <label style={{ display: 'block', marginBottom: '8px' }}>
                <input
                  type="radio"
                  value="very-important"
                  checked={goalsImportance === 'very-important'}
                  onChange={(e) => setGoalsImportance(e.target.value)}
                  style={{ marginRight: '8px' }}
                />
                Very important
              </label>
            </div>

            <label style={labelStyle}>What do you think is the most important thing your trainer can do for you?</label>
            <textarea
              value={trainerImportance}
              onChange={(e) => setTrainerImportance(e.target.value)}
              style={{ ...inputStyle, minHeight: '80px' }}
            />

            <label style={labelStyle}>List potential obstacles/actions/behaviors/activities that could interfere:</label>

            <label style={{ ...labelStyle, fontWeight: 400 }}>a)</label>
            <input
              type="text"
              value={obstacle1}
              onChange={(e) => setObstacle1(e.target.value)}
              style={inputStyle}
            />

            <label style={{ ...labelStyle, fontWeight: 400 }}>b)</label>
            <input
              type="text"
              value={obstacle2}
              onChange={(e) => setObstacle2(e.target.value)}
              style={inputStyle}
            />

            <label style={{ ...labelStyle, fontWeight: 400 }}>c)</label>
            <input
              type="text"
              value={obstacle3}
              onChange={(e) => setObstacle3(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* NUTRITION */}
          <div style={sectionStyle}>
            <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>Nutrition</h2>

            <label style={labelStyle}>On a scale from 1-5, rate your nutrition (1=poor, 5=excellent)</label>
            <div style={{ marginBottom: '16px' }}>
              {[1, 2, 3, 4, 5].map(num => (
                <label key={num} style={{ display: 'inline-flex', alignItems: 'center', marginRight: '16px' }}>
                  <input
                    type="radio"
                    value={num.toString()}
                    checked={nutritionRating === num.toString()}
                    onChange={(e) => setNutritionRating(e.target.value)}
                    style={{ marginRight: '8px' }}
                  />
                  {num}
                </label>
              ))}
            </div>

            <label style={labelStyle}>How many times throughout the day do you eat?</label>
            <input
              type="text"
              value={mealsPerDay}
              onChange={(e) => setMealsPerDay(e.target.value)}
              style={inputStyle}
              placeholder="e.g., 3 meals, 2 snacks"
            />

            <label style={labelStyle}>Do you skip meals?</label>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', marginRight: '24px' }}>
                <input
                  type="radio"
                  value="no"
                  checked={skipMeals === 'no'}
                  onChange={(e) => setSkipMeals(e.target.value)}
                  style={{ marginRight: '8px' }}
                />
                No
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center' }}>
                <input
                  type="radio"
                  value="yes"
                  checked={skipMeals === 'yes'}
                  onChange={(e) => setSkipMeals(e.target.value)}
                  style={{ marginRight: '8px' }}
                />
                Yes
              </label>
            </div>

            <label style={labelStyle}>What activities do you engage in while eating (TV, reading, etc)?</label>
            <input
              type="text"
              value={eatingActivities}
              onChange={(e) => setEatingActivities(e.target.value)}
              style={inputStyle}
            />

            <label style={labelStyle}>How many glasses of water do you consume daily?</label>
            <input
              type="text"
              value={waterGlasses}
              onChange={(e) => setWaterGlasses(e.target.value)}
              style={inputStyle}
              placeholder="e.g., 8 glasses"
            />

            <label style={labelStyle}>What kinds of food do you regularly eat?</label>
            <textarea
              value={regularFoods}
              onChange={(e) => setRegularFoods(e.target.value)}
              style={{ ...inputStyle, minHeight: '80px' }}
              placeholder="Describe your typical diet"
            />

            <label style={labelStyle}>Do you know how many calories you consume in a day?</label>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', marginRight: '24px' }}>
                <input
                  type="radio"
                  value="no"
                  checked={knowsCalories === 'no'}
                  onChange={(e) => setKnowsCalories(e.target.value)}
                  style={{ marginRight: '8px' }}
                />
                No
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center' }}>
                <input
                  type="radio"
                  value="yes"
                  checked={knowsCalories === 'yes'}
                  onChange={(e) => setKnowsCalories(e.target.value)}
                  style={{ marginRight: '8px' }}
                />
                Yes
              </label>
            </div>

            {knowsCalories === 'yes' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>How many?</label>
                <input
                  type="text"
                  value={dailyCalories}
                  onChange={(e) => setDailyCalories(e.target.value)}
                  style={inputStyle}
                  placeholder="e.g., 2000 calories"
                />
              </div>
            )}

            <label style={labelStyle}>List three things you would like to improve pertaining to your nutrition:</label>

            <label style={{ ...labelStyle, fontWeight: 400 }}>a)</label>
            <input
              type="text"
              value={nutritionGoal1}
              onChange={(e) => setNutritionGoal1(e.target.value)}
              style={inputStyle}
            />

            <label style={{ ...labelStyle, fontWeight: 400 }}>b)</label>
            <input
              type="text"
              value={nutritionGoal2}
              onChange={(e) => setNutritionGoal2(e.target.value)}
              style={inputStyle}
            />

            <label style={{ ...labelStyle, fontWeight: 400 }}>c)</label>
            <input
              type="text"
              value={nutritionGoal3}
              onChange={(e) => setNutritionGoal3(e.target.value)}
              style={inputStyle}
            />

            <label style={labelStyle}>Please list anything else that you may feel is a concern or is relevant</label>
            <textarea
              value={additionalConcerns}
              onChange={(e) => setAdditionalConcerns(e.target.value)}
              style={{ ...inputStyle, minHeight: '100px' }}
              placeholder="Any additional information about your health, fitness, or nutrition"
            />
          </div>

          {/* PAR-Q (HEALTH SCREENING) */}
          <div style={sectionStyle}>
            <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>PAR-Q (Health Screening)</h2>
            <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '16px' }}>
              Please answer YES or NO to the following questions:
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>1) Has your doctor ever said you have a heart condition and that you should only do physical activity recommended by a doctor? *</label>
              <div>
                <label style={{ display: 'inline-flex', alignItems: 'center', marginRight: '24px' }}>
                  <input
                    type="radio"
                    value="no"
                    checked={parq1 === 'no'}
                    onChange={(e) => setParq1(e.target.value)}
                    style={{ marginRight: '8px' }}
                    required
                  />
                  No
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <input
                    type="radio"
                    value="yes"
                    checked={parq1 === 'yes'}
                    onChange={(e) => setParq1(e.target.value)}
                    style={{ marginRight: '8px' }}
                    required
                  />
                  Yes
                </label>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>2) Do you feel pain in your chest when you perform physical activity? *</label>
              <div>
                <label style={{ display: 'inline-flex', alignItems: 'center', marginRight: '24px' }}>
                  <input
                    type="radio"
                    value="no"
                    checked={parq2 === 'no'}
                    onChange={(e) => setParq2(e.target.value)}
                    style={{ marginRight: '8px' }}
                    required
                  />
                  No
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <input
                    type="radio"
                    value="yes"
                    checked={parq2 === 'yes'}
                    onChange={(e) => setParq2(e.target.value)}
                    style={{ marginRight: '8px' }}
                    required
                  />
                  Yes
                </label>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>3) In the past month, have you had chest pain when you were not performing any physical activity? *</label>
              <div>
                <label style={{ display: 'inline-flex', alignItems: 'center', marginRight: '24px' }}>
                  <input
                    type="radio"
                    value="no"
                    checked={parq3 === 'no'}
                    onChange={(e) => setParq3(e.target.value)}
                    style={{ marginRight: '8px' }}
                    required
                  />
                  No
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <input
                    type="radio"
                    value="yes"
                    checked={parq3 === 'yes'}
                    onChange={(e) => setParq3(e.target.value)}
                    style={{ marginRight: '8px' }}
                    required
                  />
                  Yes
                </label>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>4) Do you lose your balance because of dizziness, or do you ever lose consciousness? *</label>
              <div>
                <label style={{ display: 'inline-flex', alignItems: 'center', marginRight: '24px' }}>
                  <input
                    type="radio"
                    value="no"
                    checked={parq4 === 'no'}
                    onChange={(e) => setParq4(e.target.value)}
                    style={{ marginRight: '8px' }}
                    required
                  />
                  No
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <input
                    type="radio"
                    value="yes"
                    checked={parq4 === 'yes'}
                    onChange={(e) => setParq4(e.target.value)}
                    style={{ marginRight: '8px' }}
                    required
                  />
                  Yes
                </label>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>5) Do you have a bone or joint problem that could be worsened by a change in your physical activity? *</label>
              <div>
                <label style={{ display: 'inline-flex', alignItems: 'center', marginRight: '24px' }}>
                  <input
                    type="radio"
                    value="no"
                    checked={parq5 === 'no'}
                    onChange={(e) => setParq5(e.target.value)}
                    style={{ marginRight: '8px' }}
                    required
                  />
                  No
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <input
                    type="radio"
                    value="yes"
                    checked={parq5 === 'yes'}
                    onChange={(e) => setParq5(e.target.value)}
                    style={{ marginRight: '8px' }}
                    required
                  />
                  Yes
                </label>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>6) Is your doctor currently prescribing any medication for your blood pressure or a heart condition? *</label>
              <div>
                <label style={{ display: 'inline-flex', alignItems: 'center', marginRight: '24px' }}>
                  <input
                    type="radio"
                    value="no"
                    checked={parq6 === 'no'}
                    onChange={(e) => setParq6(e.target.value)}
                    style={{ marginRight: '8px' }}
                    required
                  />
                  No
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <input
                    type="radio"
                    value="yes"
                    checked={parq6 === 'yes'}
                    onChange={(e) => setParq6(e.target.value)}
                    style={{ marginRight: '8px' }}
                    required
                  />
                  Yes
                </label>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>7) Do you know of any other reason why you should not engage in physical activity? *</label>
              <div>
                <label style={{ display: 'inline-flex', alignItems: 'center', marginRight: '24px' }}>
                  <input
                    type="radio"
                    value="no"
                    checked={parq7 === 'no'}
                    onChange={(e) => setParq7(e.target.value)}
                    style={{ marginRight: '8px' }}
                    required
                  />
                  No
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <input
                    type="radio"
                    value="yes"
                    checked={parq7 === 'yes'}
                    onChange={(e) => setParq7(e.target.value)}
                    style={{ marginRight: '8px' }}
                    required
                  />
                  Yes
                </label>
              </div>
            </div>

            {[parq1, parq2, parq3, parq4, parq5, parq6, parq7].some(q => q === 'yes') && (
              <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px' }}>
                <label style={labelStyle}>If you answered Yes to any of the above questions, please provide details: *</label>
                <textarea
                  value={parqDetails}
                  onChange={(e) => setParqDetails(e.target.value)}
                  style={{ ...inputStyle, minHeight: '100px' }}
                  placeholder="Please explain which question(s) you answered yes to and provide relevant details"
                  required
                />
                <p style={{ fontSize: '14px', color: '#856404', marginTop: '8px', marginBottom: 0 }}>
                  <strong>PLEASE NOTE:</strong> If you answered YES to one or more of the above questions, please consult with your physician before engaging in physical activity. Inform your physician which questions you answered YES to and follow their guidance.
                </p>
              </div>
            )}
          </div>

          {/* CERTIFICATION + SIGNATURE */}
          <div style={sectionStyle}>
            <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>Certification and Signature</h2>

            <div style={{ padding: '16px', backgroundColor: '#e7f3ff', border: '1px solid #b3d9ff', borderRadius: '4px', marginBottom: '16px' }}>
              <p style={{ fontSize: '14px', marginBottom: '12px' }}>
                <strong>Certification Statement:</strong>
              </p>
              <p style={{ fontSize: '14px', marginBottom: 0 }}>
                I certify that the information provided in this intake form is accurate and complete to the best of my knowledge. I understand that this information will be used to help design an appropriate fitness program for me, and I agree to inform my trainer of any changes to my health status.
              </p>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={certificationAgreed}
                onChange={(e) => setCertificationAgreed(e.target.checked)}
                style={{ marginRight: '8px', width: '18px', height: '18px' }}
                required
              />
              <span style={{ fontSize: '14px', fontWeight: 600 }}>I certify that the information above is accurate *</span>
            </label>

            <label style={labelStyle}>Signature (type your full name) *</label>
            <input
              type="text"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              style={{ ...inputStyle, fontFamily: 'cursive', fontSize: '18px' }}
              placeholder="Type your full legal name"
              required
            />

            <label style={labelStyle}>Date *</label>
            <input
              type="date"
              value={signatureDate}
              onChange={(e) => setSignatureDate(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '18px',
              fontWeight: 'bold',
              backgroundColor: submitting ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              marginTop: '8px'
            }}
          >
            {submitting ? 'Submitting...' : alreadySubmitted ? 'Update Intake Form' : 'Submit Intake Form'}
          </button>
        </form>
      </div>
    </Container>
  );
}
