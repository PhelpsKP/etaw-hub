/**
 * Phase 2 Backend Test Script
 * Tests feature-flagged /api/v2 endpoints
 *
 * Usage:
 *   node test-phase2.js <base_url> <admin_token>
 *
 * Example:
 *   node test-phase2.js http://localhost:8787 eyJhbGc...
 */

const BASE_URL = process.argv[2] || 'http://localhost:8787';
const ADMIN_TOKEN = process.argv[3] || '';

if (!ADMIN_TOKEN) {
  console.error('ERROR: Admin token is required');
  console.error('Usage: node test-phase2.js <base_url> <admin_token>');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${ADMIN_TOKEN}`,
};

let testsPassed = 0;
let testsFailed = 0;

async function test(name, fn) {
  try {
    console.log(`\n[TEST] ${name}`);
    await fn();
    console.log(`✓ PASS: ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`✗ FAIL: ${name}`);
    console.error(`  Error: ${err.message}`);
    if (err.response) {
      console.error(`  Response:`, err.response);
    }
    testsFailed++;
  }
}

async function apiCall(method, path, body = null) {
  const url = `${BASE_URL}${path}`;
  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const text = await response.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
    error.response = data;
    error.status = response.status;
    throw error;
  }

  return { status: response.status, data };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// Test state
let createdGroupId;
let createdMembershipId;
let createdWorkoutId;
let createdAssignmentId;
let createdSessionId;
let testClientId = 1; // Assume client with ID 1 exists

(async function runTests() {
  console.log('='.repeat(60));
  console.log('Phase 2 Backend Tests');
  console.log('='.repeat(60));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Testing with Admin Token: ${ADMIN_TOKEN.substring(0, 20)}...`);

  // Test 1: Create a group
  await test('Create group', async () => {
    const result = await apiCall('POST', '/api/v2/admin/groups', {
      name: 'Test Group 001',
      description: 'Automated test group',
    });

    assert(result.data.ok, 'Response should have ok: true');
    assert(result.data.group, 'Response should include group object');
    assert(result.data.group.name === 'Test Group 001', 'Group name should match');

    createdGroupId = result.data.group.id;
    console.log(`  Created group ID: ${createdGroupId}`);
  });

  // Test 2: List groups
  await test('List groups', async () => {
    const result = await apiCall('GET', '/api/v2/admin/groups');

    assert(Array.isArray(result.data.groups), 'Response should include groups array');
    assert(result.data.groups.length > 0, 'Should have at least one group');

    const ourGroup = result.data.groups.find(g => g.id === createdGroupId);
    assert(ourGroup, 'Should find our created group');
    console.log(`  Found ${result.data.groups.length} group(s)`);
  });

  // Test 3: Get specific group
  await test('Get group by ID', async () => {
    const result = await apiCall('GET', `/api/v2/admin/groups/${createdGroupId}`);

    assert(result.data.group, 'Response should include group object');
    assert(result.data.group.id === createdGroupId, 'Group ID should match');
    console.log(`  Retrieved group: ${result.data.group.name}`);
  });

  // Test 4: Update group
  await test('Update group', async () => {
    const result = await apiCall('PATCH', `/api/v2/admin/groups/${createdGroupId}`, {
      description: 'Updated description',
    });

    assert(result.data.ok, 'Response should have ok: true');
    console.log(`  Updated group description`);
  });

  // Test 5: Add member to group
  await test('Add group membership', async () => {
    const startDate = new Date().toISOString();
    const result = await apiCall('POST', '/api/v2/admin/group-memberships', {
      group_id: createdGroupId,
      client_id: testClientId,
      start_date: startDate,
      end_date: null,
    });

    assert(result.data.ok, 'Response should have ok: true');
    assert(result.data.membership, 'Response should include membership object');

    createdMembershipId = result.data.membership.id;
    console.log(`  Created membership ID: ${createdMembershipId}`);
  });

  // Test 6: List group members
  await test('List group members', async () => {
    const result = await apiCall('GET', `/api/v2/admin/groups/${createdGroupId}/members`);

    assert(Array.isArray(result.data.members), 'Response should include members array');
    assert(result.data.members.length > 0, 'Should have at least one member');

    const ourMembership = result.data.members.find(m => m.id === createdMembershipId);
    assert(ourMembership, 'Should find our created membership');
    console.log(`  Found ${result.data.members.length} member(s) in group`);
  });

  // Test 7: Create workout (prerequisite for assignment)
  await test('Create workout', async () => {
    const result = await apiCall('POST', '/api/admin/workouts', {
      name: 'Test Workout 001',
      description: 'Automated test workout',
    });

    assert(result.data.ok, 'Response should have ok: true');
    assert(result.data.id, 'Response should include workout ID');

    createdWorkoutId = result.data.id;
    console.log(`  Created workout ID: ${createdWorkoutId}`);
  });

  // Test 8: Assign workout to group
  await test('Create workout assignment to group', async () => {
    const startDate = new Date().toISOString();
    const result = await apiCall('POST', '/api/v2/admin/workout-assignments', {
      workout_id: createdWorkoutId,
      assignee_type: 'group',
      assignee_id: createdGroupId,
      start_date: startDate,
      end_date: null,
    });

    assert(result.data.ok, 'Response should have ok: true');
    assert(result.data.assignment, 'Response should include assignment object');
    assert(result.data.assignment.assignee_type === 'group', 'Assignee type should be group');

    createdAssignmentId = result.data.assignment.id;
    console.log(`  Created assignment ID: ${createdAssignmentId}`);
  });

  // Test 9: List workout assignments
  await test('List workout assignments', async () => {
    const result = await apiCall('GET', '/api/v2/admin/workout-assignments');

    assert(Array.isArray(result.data.assignments), 'Response should include assignments array');
    assert(result.data.assignments.length > 0, 'Should have at least one assignment');

    const ourAssignment = result.data.assignments.find(a => a.id === createdAssignmentId);
    assert(ourAssignment, 'Should find our created assignment');
    console.log(`  Found ${result.data.assignments.length} assignment(s)`);
  });

  // Test 10: Start workout session
  await test('Create workout session', async () => {
    const performedAt = new Date().toISOString();
    const result = await apiCall('POST', '/api/v2/workout-sessions', {
      workout_id: createdWorkoutId,
      assignment_id: createdAssignmentId,
      performed_at: performedAt,
      notes: 'Test session notes',
    });

    assert(result.data.ok, 'Response should have ok: true');
    assert(result.data.session, 'Response should include session object');

    createdSessionId = result.data.session.id;
    console.log(`  Created session ID: ${createdSessionId}`);
  });

  // Test 11: Get workout session
  await test('Get workout session', async () => {
    const result = await apiCall('GET', `/api/v2/workout-sessions/${createdSessionId}`);

    assert(result.data.session, 'Response should include session object');
    assert(result.data.session.id === createdSessionId, 'Session ID should match');
    console.log(`  Retrieved session with ${result.data.session.notes || 'no notes'}`);
  });

  // Test 12: List my workout sessions
  await test('List my workout sessions', async () => {
    const result = await apiCall('GET', '/api/v2/my-workout-sessions');

    assert(Array.isArray(result.data.sessions), 'Response should include sessions array');
    console.log(`  Found ${result.data.sessions.length} session(s)`);
  });

  // Test 13: Create workout set log (prerequisite: need an exercise)
  await test('Create workout set log', async () => {
    // First, create a test exercise if needed
    let exerciseId;
    try {
      const exerciseResult = await apiCall('POST', '/api/admin/exercises', {
        name: 'Test Exercise 001',
        category: 'strength',
        muscle_groups: ['chest'],
        equipment: ['barbell'],
        description: 'Test exercise for Phase 2',
      });
      exerciseId = exerciseResult.data.id;
    } catch (err) {
      // If exercise creation fails, try to use any existing exercise
      const exercisesResult = await apiCall('GET', '/api/admin/exercises');
      if (exercisesResult.data.exercises && exercisesResult.data.exercises.length > 0) {
        exerciseId = exercisesResult.data.exercises[0].id;
      } else {
        throw new Error('No exercises available for set log test');
      }
    }

    const result = await apiCall('POST', '/api/v2/workout-set-logs', {
      workout_session_id: createdSessionId,
      exercise_id: exerciseId,
      set_index: 1,
      reps: 10,
      weight: 135,
      rest_seconds: 60,
      notes: 'Test set',
    });

    assert(result.data.ok, 'Response should have ok: true');
    assert(result.data.set_log, 'Response should include set_log object');
    console.log(`  Created set log with ${result.data.set_log.reps} reps @ ${result.data.set_log.weight} lbs`);
  });

  // Test 14: Get set logs for session
  await test('Get set logs for session', async () => {
    const result = await apiCall('GET', `/api/v2/workout-sessions/${createdSessionId}/set-logs`);

    assert(Array.isArray(result.data.set_logs), 'Response should include set_logs array');
    assert(result.data.set_logs.length > 0, 'Should have at least one set log');
    console.log(`  Found ${result.data.set_logs.length} set log(s)`);
  });

  // Test 15: Create credit purchase (idempotent)
  await test('Create credit purchase (idempotent)', async () => {
    const txnId = `TEST-${Date.now()}`;
    const purchasedAt = new Date().toISOString();

    // First call - should create
    const result1 = await apiCall('POST', '/api/v2/credit-purchases', {
      provider: 'stripe',
      provider_txn_id: txnId,
      dollars_amount: 100.0,
      credits_amount: 10,
      status: 'completed',
      purchased_at: purchasedAt,
    });

    assert(result1.data.ok, 'First call should succeed');
    assert(result1.data.purchase, 'Should include purchase object');
    assert(result1.data.is_duplicate === false, 'First call should not be duplicate');
    console.log(`  Created purchase: ${result1.data.purchase.provider_txn_id}`);

    // Second call - should return existing (idempotent)
    const result2 = await apiCall('POST', '/api/v2/credit-purchases', {
      provider: 'stripe',
      provider_txn_id: txnId,
      dollars_amount: 100.0,
      credits_amount: 10,
      status: 'completed',
      purchased_at: purchasedAt,
    });

    assert(result2.data.ok, 'Second call should succeed');
    assert(result2.data.purchase, 'Should include purchase object');
    assert(result2.data.is_duplicate === true, 'Second call should be duplicate');
    assert(result2.data.purchase.id === result1.data.purchase.id, 'Should return same purchase');
    console.log(`  Idempotent check passed: same purchase returned`);
  });

  // Test 16: List my credit purchases
  await test('List my credit purchases', async () => {
    const result = await apiCall('GET', '/api/v2/my-credit-purchases');

    assert(Array.isArray(result.data.purchases), 'Response should include purchases array');
    console.log(`  Found ${result.data.purchases.length} purchase(s)`);
  });

  // Test 17: Remove member from group (soft delete)
  await test('Remove group membership', async () => {
    const result = await apiCall('DELETE', `/api/v2/admin/group-memberships/${createdMembershipId}`);

    assert(result.data.ok, 'Response should have ok: true');
    console.log(`  Removed membership (set end_date)`);
  });

  // Test 18: Verify Phase 2 disabled returns 404
  await test('Phase 2 disabled check (skip if enabled)', async () => {
    // This test should be run manually with PHASE2_ENABLED=false
    // For now, just log that it should be tested
    console.log(`  Manual test: Set PHASE2_ENABLED=false and verify 404 response`);
  });

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Test Summary');
  console.log('='.repeat(60));
  console.log(`✓ Passed: ${testsPassed}`);
  console.log(`✗ Failed: ${testsFailed}`);
  console.log(`Total: ${testsPassed + testsFailed}`);

  if (testsFailed > 0) {
    console.log('\nSome tests failed. Please review the errors above.');
    process.exit(1);
  } else {
    console.log('\nAll tests passed! 🎉');
    process.exit(0);
  }
})();
