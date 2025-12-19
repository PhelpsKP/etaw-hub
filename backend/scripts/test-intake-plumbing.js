// Test script to validate intake forms plumbing
// Tests submission, status checking, and admin settings

const BASE_URL = "http://127.0.0.1:8787";

async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  return data.token;
}

async function submitIntake(clientToken, formType, data) {
  const res = await fetch(`${BASE_URL}/api/intake/submit`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${clientToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ form_type: formType, data }),
  });
  const responseData = await res.json();
  return { status: res.status, data: responseData };
}

async function getIntakeStatus(clientToken) {
  const res = await fetch(`${BASE_URL}/api/intake/status`, {
    headers: { Authorization: `Bearer ${clientToken}` },
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function setPtRequired(adminToken, required) {
  const res = await fetch(`${BASE_URL}/api/admin/settings/pt-intake-required`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${adminToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ required }),
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function getAdminIntake(adminToken, userId) {
  const res = await fetch(`${BASE_URL}/api/admin/intake?user_id=${userId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function main() {
  console.log("=== Testing Intake Forms Plumbing ===\n");

  // Login
  console.log("1. Logging in...");
  const adminToken = await login("admin@test.com", "Password123!");
  const clientToken = await login("check@test.com", "Password123!");
  console.log("✓ Logged in\n");

  // Check initial status
  console.log("2. Checking initial intake status...");
  const initialStatus = await getIntakeStatus(clientToken);
  console.log(`Status: ${initialStatus.status}`);
  console.log("Response:", JSON.stringify(initialStatus.data, null, 2));
  console.log("");

  // Submit basic intake
  console.log("3. Submitting basic intake form...");
  const basicData = {
    name: "Test User",
    age: 30,
    goals: "Get fit",
    medical_history: "None",
  };
  const basicSubmit = await submitIntake(clientToken, "basic", basicData);
  console.log(`Status: ${basicSubmit.status}`);
  console.log("Response:", JSON.stringify(basicSubmit.data, null, 2));
  console.log("");

  // Check status after basic submission
  console.log("4. Checking status after basic submission...");
  const afterBasicStatus = await getIntakeStatus(clientToken);
  console.log("Response:", JSON.stringify(afterBasicStatus.data, null, 2));
  console.log(
    `✓ Basic submitted: ${afterBasicStatus.data.basic_submitted} (expected: true)`
  );
  console.log(
    `✓ PT submitted: ${afterBasicStatus.data.pt_submitted} (expected: false)`
  );
  console.log(
    `✓ PT required: ${afterBasicStatus.data.pt_required} (expected: false)`
  );
  console.log("");

  // Toggle PT required to true
  console.log("5. Toggling PT intake requirement to TRUE...");
  const setPtTrue = await setPtRequired(adminToken, true);
  console.log(`Status: ${setPtTrue.status}`);
  console.log("Response:", JSON.stringify(setPtTrue.data, null, 2));
  console.log("");

  // Check status after PT required toggle
  console.log("6. Checking status after PT required toggle...");
  const afterPtRequiredStatus = await getIntakeStatus(clientToken);
  console.log("Response:", JSON.stringify(afterPtRequiredStatus.data, null, 2));
  console.log(
    `✓ PT required: ${afterPtRequiredStatus.data.pt_required} (expected: true)`
  );
  console.log(
    `✓ PT submitted: ${afterPtRequiredStatus.data.pt_submitted} (expected: false)`
  );
  console.log("");

  // Submit PT intake
  console.log("7. Submitting PT intake form...");
  const ptData = {
    fitness_level: "intermediate",
    injuries: "None",
    training_frequency: 3,
    preferences: "Morning sessions",
  };
  const ptSubmit = await submitIntake(clientToken, "pt", ptData);
  console.log(`Status: ${ptSubmit.status}`);
  console.log("Response:", JSON.stringify(ptSubmit.data, null, 2));
  console.log("");

  // Check final status
  console.log("8. Checking final status after PT submission...");
  const finalStatus = await getIntakeStatus(clientToken);
  console.log("Response:", JSON.stringify(finalStatus.data, null, 2));
  console.log(
    `✓ Basic submitted: ${finalStatus.data.basic_submitted} (expected: true)`
  );
  console.log(
    `✓ PT submitted: ${finalStatus.data.pt_submitted} (expected: true)`
  );
  console.log(
    `✓ PT required: ${finalStatus.data.pt_required} (expected: true)`
  );
  console.log("");

  // Admin view submissions
  console.log("9. Admin viewing user's intake submissions...");
  const adminView = await getAdminIntake(adminToken, 3); // user_id=3 for check@test.com
  console.log(`Status: ${adminView.status}`);
  console.log("Submissions count:", adminView.data.submissions.length);
  adminView.data.submissions.forEach((sub) => {
    console.log(`  - ${sub.form_type}: ${Object.keys(sub.data).length} fields`);
    console.log(`    Submitted at: ${sub.submitted_at}`);
  });
  console.log("");

  // Test upsert (resubmit basic with updated data)
  console.log("10. Testing upsert (resubmitting basic form)...");
  const updatedBasicData = {
    name: "Test User Updated",
    age: 31,
    goals: "Get really fit",
    medical_history: "None",
  };
  const basicResubmit = await submitIntake(clientToken, "basic", updatedBasicData);
  console.log(`Status: ${basicResubmit.status}`);
  console.log("Response:", JSON.stringify(basicResubmit.data, null, 2));

  const afterResubmit = await getAdminIntake(adminToken, 3);
  const basicSubmission = afterResubmit.data.submissions.find(
    (s) => s.form_type === "basic"
  );
  console.log(`✓ Basic form data updated: ${basicSubmission.data.name}`);
  console.log(`✓ Still only 2 submissions total (upsert worked)\n`);

  // Test array payload (hardening change)
  console.log("11. Testing array payload submission...");
  const arrayData = [
    { field: "name", value: "Test Array" },
    { field: "age", value: 25 },
    { field: "goals", value: "Array format test" },
  ];
  const arraySubmit = await submitIntake(clientToken, "basic", arrayData);
  console.log(`Status: ${arraySubmit.status}`);
  console.log("Response:", JSON.stringify(arraySubmit.data, null, 2));

  const afterArraySubmit = await getAdminIntake(adminToken, 3);
  const arraySubmission = afterArraySubmit.data.submissions.find(
    (s) => s.form_type === "basic"
  );
  console.log(`✓ Array payload accepted: ${Array.isArray(arraySubmission.data)}`);
  console.log(`✓ Array length: ${arraySubmission.data.length}`);
  console.log(`✓ Parse error: ${arraySubmission.parse_error} (expected: false)`);
  console.log("Admin intake shape for array case:");
  console.log(JSON.stringify(arraySubmission, null, 2));
  console.log("");

  // Final verification
  console.log("=== VERIFICATION RESULTS ===");
  console.log(
    `Basic submission worked: ${basicSubmit.status === 200} (expected: true)`
  );
  console.log(
    `PT submission worked: ${ptSubmit.status === 200} (expected: true)`
  );
  console.log(
    `Status shows basic submitted: ${finalStatus.data.basic_submitted} (expected: true)`
  );
  console.log(
    `Status shows PT submitted: ${finalStatus.data.pt_submitted} (expected: true)`
  );
  console.log(
    `Status shows PT required: ${finalStatus.data.pt_required} (expected: true)`
  );
  console.log(
    `Admin can view submissions: ${adminView.status === 200} (expected: true)`
  );
  console.log(
    `Upsert works (still 2 submissions): ${afterResubmit.data.submissions.length === 2} (expected: true)`
  );
  console.log(
    `Array payload works: ${arraySubmit.status === 200 && Array.isArray(arraySubmission.data)} (expected: true)`
  );
  console.log(
    `Array parse error: ${arraySubmission.parse_error === false} (expected: true)`
  );

  const success =
    basicSubmit.status === 200 &&
    ptSubmit.status === 200 &&
    finalStatus.data.basic_submitted === true &&
    finalStatus.data.pt_submitted === true &&
    finalStatus.data.pt_required === true &&
    adminView.status === 200 &&
    afterResubmit.data.submissions.length === 2 &&
    arraySubmit.status === 200 &&
    Array.isArray(arraySubmission.data) &&
    arraySubmission.parse_error === false;

  console.log(`\n✓ TEST ${success ? "PASSED" : "FAILED"}`);
}

main().catch(console.error);
