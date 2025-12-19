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

async function signup(email, password) {
  await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

async function request(method, path, token, body = null) {
  const opts = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, opts);
  return { status: res.status, data: await res.json().catch(() => null) };
}

async function main() {
  console.log("=== Testing Workouts + Assignment ===\n");

  // Setup: ensure admin user exists
  console.log("1. Setting up admin user...");
  try {
    await signup("admin@example.com", "admin123");
  } catch (err) {
    // Admin might already exist
  }
  const adminToken = await login("admin@example.com", "admin123");
  console.log("✓ Admin logged in\n");

  // Manually set admin role in database (for local testing)
  // In production, this would be done via a migration or admin panel
  // For now we'll proceed - the user might not have admin role

  // Setup: create client user
  const clientEmail = `client-${Date.now()}@test.com`;
  const clientPassword = "password123";
  console.log("2. Creating client user...");
  await signup(clientEmail, clientPassword);
  const clientToken = await login(clientEmail, clientPassword);

  // Get client user ID
  const meRes = await request("GET", "/api/me", clientToken);
  const clientUserId = meRes.data.id;
  console.log(`✓ Client user created: ${clientEmail} (ID: ${clientUserId})\n`);

  // Create exercises
  console.log("3. Creating test exercises...");
  const ex1Res = await request("POST", "/api/admin/exercises", adminToken, {
    name: "Bench Press",
    description: "Upper body push exercise",
    youtube_url: "https://www.youtube.com/watch?v=rT7DgCr-3pg",
    primary_muscles: ["chest", "triceps"],
    equipment: ["barbell", "bench"],
    difficulty: "intermediate",
  });
  const exercise1Id = ex1Res.data.id;
  console.log(`✓ Exercise 1 created: ${exercise1Id}`);

  const ex2Res = await request("POST", "/api/admin/exercises", adminToken, {
    name: "Squat",
    description: "Lower body exercise",
    youtube_url: "https://www.youtube.com/watch?v=ultWZbUMPL8",
    primary_muscles: ["quadriceps", "glutes"],
    equipment: ["barbell"],
    difficulty: "intermediate",
  });
  const exercise2Id = ex2Res.data.id;
  console.log(`✓ Exercise 2 created: ${exercise2Id}`);

  const ex3Res = await request("POST", "/api/admin/exercises", adminToken, {
    name: "Deadlift",
    description: "Full body pull exercise",
    youtube_url: "https://youtu.be/op9kVnSso6Q",
    primary_muscles: ["back", "hamstrings"],
    equipment: ["barbell"],
    difficulty: "advanced",
  });
  const exercise3Id = ex3Res.data.id;
  console.log(`✓ Exercise 3 created: ${exercise3Id}\n`);

  // Create workout
  console.log("4. Creating workout...");
  const workoutRes = await request("POST", "/api/admin/workouts", adminToken, {
    name: "Full Body Strength",
    description: "Complete strength training workout",
  });
  const workoutId = workoutRes.data.id;
  console.log(`Status: ${workoutRes.status}`);
  console.log(`✓ Workout created: ${workoutId}\n`);

  // List workouts
  console.log("5. Listing workouts...");
  const listRes = await request("GET", "/api/admin/workouts", adminToken);
  console.log(`Status: ${listRes.status}`);
  console.log(`✓ Workouts found: ${listRes.data.workouts.length}`);
  const foundWorkout = listRes.data.workouts.find(w => w.id === workoutId);
  console.log(`✓ Our workout in list: ${foundWorkout?.name}\n`);

  // Search workouts
  console.log("6. Searching for 'Strength'...");
  const searchRes = await request("GET", "/api/admin/workouts?q=Strength", adminToken);
  console.log(`Status: ${searchRes.status}`);
  console.log(`✓ Search results: ${searchRes.data.workouts.length}\n`);

  // Add exercises to workout (should auto-assign sort_order: 0, 1, 2)
  console.log("7. Adding exercises to workout...");
  const add1 = await request("POST", `/api/admin/workouts/${workoutId}/exercises`, adminToken, {
    exercise_id: exercise1Id,
  });
  console.log(`Add exercise 1 status: ${add1.status}, sort_order: ${add1.data.sort_order}`);

  const add2 = await request("POST", `/api/admin/workouts/${workoutId}/exercises`, adminToken, {
    exercise_id: exercise2Id,
  });
  console.log(`Add exercise 2 status: ${add2.status}, sort_order: ${add2.data.sort_order}`);

  const add3 = await request("POST", `/api/admin/workouts/${workoutId}/exercises`, adminToken, {
    exercise_id: exercise3Id,
  });
  console.log(`Add exercise 3 status: ${add3.status}, sort_order: ${add3.data.sort_order}`);

  // Test duplicate add (should return 409)
  const addDupe = await request("POST", `/api/admin/workouts/${workoutId}/exercises`, adminToken, {
    exercise_id: exercise1Id,
  });
  console.log(`✓ Duplicate add status: ${addDupe.status} (expected 409)`);

  // Regression test: ensure subroutes aren't swallowed by base GET handler
  console.log("\n7b. Testing route matching (regression test)...");
  const baseGet = await request("GET", `/api/admin/workouts/${workoutId}`, adminToken);
  const subroutePost = await request("POST", `/api/admin/workouts/${workoutId}/exercises`, adminToken, {
    exercise_id: exercise1Id,
  });
  console.log(`Base GET /api/admin/workouts/:id status: ${baseGet.status} (expected 200)`);
  console.log(`Subroute POST /api/admin/workouts/:id/exercises status: ${subroutePost.status} (expected 409, already added)`);
  console.log(`✓ Route matching correct: base and subroutes handled separately\n`);

  // Get workout with exercises
  console.log("8. Fetching workout with exercises...");
  const getWorkoutRes = await request("GET", `/api/admin/workouts/${workoutId}`, adminToken);
  console.log(`Status: ${getWorkoutRes.status}`);
  console.log(`Workout: ${getWorkoutRes.data.workout.name}`);
  console.log(`Exercises count: ${getWorkoutRes.data.exercises.length}`);
  console.log("Exercise order:");
  getWorkoutRes.data.exercises.forEach((ex, i) => {
    console.log(`  ${i + 1}. [${ex.sort_order}] ${ex.name} - embed_url: ${ex.embed_url ? "✓" : "✗"}`);
  });
  console.log();

  // Reorder exercises: swap first and last
  console.log("9. Reordering exercises (swap first and last)...");
  const reorderRes = await request(
    "PUT",
    `/api/admin/workouts/${workoutId}/exercises/reorder`,
    adminToken,
    {
      items: [
        { exercise_id: exercise1Id, sort_order: 2 },
        { exercise_id: exercise2Id, sort_order: 1 },
        { exercise_id: exercise3Id, sort_order: 0 },
      ],
    }
  );
  console.log(`Reorder status: ${reorderRes.status}`);

  // Verify new order
  const getAfterReorder = await request("GET", `/api/admin/workouts/${workoutId}`, adminToken);
  console.log("New exercise order:");
  getAfterReorder.data.exercises.forEach((ex, i) => {
    console.log(`  ${i + 1}. [${ex.sort_order}] ${ex.name}`);
  });
  console.log();

  // Assign workout to client
  console.log("10. Assigning workout to client...");
  const assignRes = await request(
    "POST",
    `/api/admin/workouts/${workoutId}/assign`,
    adminToken,
    { user_id: clientUserId }
  );
  console.log(`Assign status: ${assignRes.status}`);

  // Test duplicate assign (should return 409)
  const assignDupe = await request(
    "POST",
    `/api/admin/workouts/${workoutId}/assign`,
    adminToken,
    { user_id: clientUserId }
  );
  console.log(`✓ Duplicate assign status: ${assignDupe.status} (expected 409)\n`);

  // Client fetches assigned workouts
  console.log("11. Client fetching assigned workouts...");
  const clientWorkoutsRes = await request("GET", "/api/workouts", clientToken);
  console.log(`Status: ${clientWorkoutsRes.status}`);
  console.log(`Workouts assigned to client: ${clientWorkoutsRes.data.workouts.length}`);

  if (clientWorkoutsRes.data.workouts.length > 0) {
    const workout = clientWorkoutsRes.data.workouts[0];
    console.log(`\nWorkout: ${workout.name}`);
    console.log(`Description: ${workout.description}`);
    console.log(`Exercises (${workout.exercises.length}):`);
    workout.exercises.forEach((ex, i) => {
      console.log(`  ${i + 1}. [sort_order: ${ex.sort_order}] ${ex.name}`);
      console.log(`     Embed URL: ${ex.embed_url}`);
      console.log(`     Primary muscles: ${ex.primary_muscles?.join(", ")}`);
      console.log(`     Equipment: ${ex.equipment?.join(", ")}`);
    });
  }
  console.log();

  // Test removal
  console.log("12. Removing one exercise from workout...");
  const removeRes = await request(
    "DELETE",
    `/api/admin/workouts/${workoutId}/exercises/${exercise2Id}`,
    adminToken
  );
  console.log(`Remove status: ${removeRes.status}`);

  const afterRemove = await request("GET", `/api/admin/workouts/${workoutId}`, adminToken);
  console.log(`Exercises remaining: ${afterRemove.data.exercises.length}\n`);

  // Test unassign
  console.log("13. Unassigning workout from client...");
  const unassignRes = await request(
    "DELETE",
    `/api/admin/workouts/${workoutId}/assign/${clientUserId}`,
    adminToken
  );
  console.log(`Unassign status: ${unassignRes.status}`);

  const clientAfterUnassign = await request("GET", "/api/workouts", clientToken);
  console.log(`✓ Workouts assigned after unassign: ${clientAfterUnassign.data.workouts.length}\n`);

  // Cleanup
  console.log("14. Cleaning up...");
  await request("DELETE", `/api/admin/exercises/${exercise1Id}`, adminToken);
  await request("DELETE", `/api/admin/exercises/${exercise2Id}`, adminToken);
  await request("DELETE", `/api/admin/exercises/${exercise3Id}`, adminToken);
  console.log("✓ Test exercises deleted\n");

  // Verification
  console.log("=== VERIFICATION RESULTS ===");
  const results = {
    "Create workout": workoutRes.status === 200 && workoutRes.data.ok,
    "List workouts": listRes.status === 200 && listRes.data.workouts.length > 0,
    "Search workouts": searchRes.status === 200,
    "Add exercise to workout": add1.status === 200 && add1.data.ok,
    "Duplicate add prevented": addDupe.status === 409,
    "Route matching (base GET)": baseGet.status === 200,
    "Route matching (subroute POST)": subroutePost.status === 409,
    "Get workout with exercises": getWorkoutRes.status === 200 && getWorkoutRes.data.exercises.length === 3,
    "Exercises have embed_url": getWorkoutRes.data.exercises.every(ex => ex.embed_url !== undefined),
    "Reorder exercises": reorderRes.status === 200,
    "Order preserved": getAfterReorder.data.exercises[0].sort_order === 0 && getAfterReorder.data.exercises[0].name === "Deadlift",
    "Assign to client": assignRes.status === 200,
    "Duplicate assign prevented": assignDupe.status === 409,
    "Client fetch workouts": clientWorkoutsRes.status === 200 && clientWorkoutsRes.data.workouts.length === 1,
    "Client workout has exercises": clientWorkoutsRes.data.workouts[0].exercises.length === 3,
    "Client exercises have embed_url": clientWorkoutsRes.data.workouts[0].exercises.every(ex => ex.embed_url),
    "Remove exercise": removeRes.status === 200 && afterRemove.data.exercises.length === 2,
    "Unassign workout": unassignRes.status === 200 && clientAfterUnassign.data.workouts.length === 0,
  };

  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${test}: ${passed} (expected: true)`);
  });

  const allPassed = Object.values(results).every(r => r === true);
  console.log(`\n${allPassed ? "✓ TEST PASSED" : "✗ TEST FAILED"}`);
}

main().catch(console.error);
