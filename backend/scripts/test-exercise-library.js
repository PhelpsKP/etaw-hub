// Test script to validate exercise library CRUD operations
// Tests creation, listing, fetching, updating, and deletion

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

async function createExercise(adminToken, exerciseData) {
  const res = await fetch(`${BASE_URL}/api/admin/exercises`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${adminToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(exerciseData),
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function listExercises(adminToken, search = null) {
  const url = search
    ? `${BASE_URL}/api/admin/exercises?q=${encodeURIComponent(search)}`
    : `${BASE_URL}/api/admin/exercises`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function getExercise(adminToken, exerciseId) {
  const res = await fetch(`${BASE_URL}/api/admin/exercises/${exerciseId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function updateExercise(adminToken, exerciseId, updates) {
  const res = await fetch(`${BASE_URL}/api/admin/exercises/${exerciseId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${adminToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function deleteExercise(adminToken, exerciseId) {
  const res = await fetch(`${BASE_URL}/api/admin/exercises/${exerciseId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function main() {
  console.log("=== Testing Exercise Library ===\n");

  // Login
  console.log("1. Logging in as admin...");
  const adminToken = await login("admin@test.com", "Password123!");
  console.log("✓ Logged in\n");

  // Create exercise with YouTube URL
  console.log("2. Creating exercise with YouTube URL...");
  const exerciseData = {
    name: "Barbell Squat",
    description: "Compound lower body exercise",
    youtube_url: "https://www.youtube.com/watch?v=ultWZbUMPL8",
    primary_muscles: ["quadriceps", "glutes"],
    secondary_muscles: ["hamstrings", "calves"],
    equipment: ["barbell", "squat rack"],
    difficulty: "intermediate",
    cues: ["Keep chest up", "Drive through heels", "Knees out"],
    tags: ["compound", "lower-body"],
  };
  const createResult = await createExercise(adminToken, exerciseData);
  console.log(`Status: ${createResult.status}`);
  console.log("Response:", JSON.stringify(createResult.data, null, 2));

  if (createResult.status !== 200) {
    console.error("Failed to create exercise. Exiting.");
    return;
  }

  const exerciseId = createResult.data.id;
  const embedUrl = createResult.data.embed_url;
  console.log(`✓ Exercise created: ${exerciseId}`);
  console.log(`✓ Embed URL: ${embedUrl}\n`);

  // List all exercises
  console.log("3. Listing all exercises...");
  const listResult = await listExercises(adminToken);
  console.log(`Status: ${listResult.status}`);
  console.log(`Exercise count: ${listResult.data.exercises.length}`);
  const foundInList = listResult.data.exercises.find((ex) => ex.id === exerciseId);
  console.log(`✓ Exercise found in list: ${!!foundInList}`);
  console.log(`✓ Name: ${foundInList?.name}`);
  console.log(`✓ Embed URL in list: ${foundInList?.embed_url}\n`);

  // Search for exercise
  console.log("4. Searching for 'Squat'...");
  const searchResult = await listExercises(adminToken, "Squat");
  console.log(`Status: ${searchResult.status}`);
  console.log(`Search results count: ${searchResult.data.exercises.length}`);
  const foundInSearch = searchResult.data.exercises.find(
    (ex) => ex.id === exerciseId
  );
  console.log(`✓ Exercise found in search: ${!!foundInSearch}\n`);

  // Get single exercise
  console.log("5. Fetching single exercise...");
  const getResult = await getExercise(adminToken, exerciseId);
  console.log(`Status: ${getResult.status}`);
  console.log("Exercise:", JSON.stringify(getResult.data.exercise, null, 2));
  console.log(`✓ Embed URL present: ${!!getResult.data.exercise.embed_url}`);
  console.log(`✓ Primary muscles: ${getResult.data.exercise.primary_muscles.join(", ")}`);
  console.log(`✓ Equipment: ${getResult.data.exercise.equipment.join(", ")}`);
  console.log(`✓ Cues count: ${getResult.data.exercise.cues.length}\n`);

  // Update exercise
  console.log("6. Updating exercise name and cues...");
  const updateResult = await updateExercise(adminToken, exerciseId, {
    name: "Back Squat",
    cues: ["Chest up", "Heels down", "Knees out", "Hips back"],
  });
  console.log(`Status: ${updateResult.status}`);
  console.log("Response:", JSON.stringify(updateResult.data, null, 2));

  const afterUpdate = await getExercise(adminToken, exerciseId);
  console.log(`✓ Updated name: ${afterUpdate.data.exercise.name}`);
  console.log(`✓ Updated cues count: ${afterUpdate.data.exercise.cues.length}`);
  console.log(`✓ Cues: ${afterUpdate.data.exercise.cues.join(", ")}\n`);

  // Test with different YouTube URL formats
  console.log("7. Testing different YouTube URL formats...");

  // youtu.be format
  const shortUrlExercise = await createExercise(adminToken, {
    name: "Push-up",
    youtube_url: "https://youtu.be/IODxDxX7oi4",
    primary_muscles: ["chest"],
    equipment: ["bodyweight"],
  });
  console.log(`Short URL (youtu.be): ${shortUrlExercise.data.embed_url}`);

  // Raw video ID
  const rawIdExercise = await createExercise(adminToken, {
    name: "Pull-up",
    youtube_url: "dQw4w9WgXcQ",
    primary_muscles: ["back"],
    equipment: ["pull-up bar"],
  });
  console.log(`Raw video ID: ${rawIdExercise.data.embed_url}`);

  // Embed URL format
  const embedFormatExercise = await createExercise(adminToken, {
    name: "Deadlift",
    youtube_url: "https://www.youtube.com/embed/op9kVnSso6Q",
    primary_muscles: ["back", "glutes"],
    equipment: ["barbell"],
  });
  console.log(`Embed format: ${embedFormatExercise.data.embed_url}\n`);

  // Delete exercises
  console.log("8. Deleting test exercises...");
  const deleteMain = await deleteExercise(adminToken, exerciseId);
  console.log(`Delete main exercise status: ${deleteMain.status}`);

  await deleteExercise(adminToken, shortUrlExercise.data.id);
  await deleteExercise(adminToken, rawIdExercise.data.id);
  await deleteExercise(adminToken, embedFormatExercise.data.id);
  console.log("✓ All test exercises deleted\n");

  // Confirm deletion
  console.log("9. Confirming exercise was deleted...");
  const afterDelete = await getExercise(adminToken, exerciseId);
  console.log(`Status after delete: ${afterDelete.status}`);
  console.log(`✓ Exercise not found: ${afterDelete.status === 404}\n`);

  // Final verification
  console.log("=== VERIFICATION RESULTS ===");
  console.log(`Create exercise: ${createResult.status === 200} (expected: true)`);
  console.log(`Embed URL generated: ${!!embedUrl} (expected: true)`);
  console.log(`List exercises: ${listResult.status === 200} (expected: true)`);
  console.log(`Found in list: ${!!foundInList} (expected: true)`);
  console.log(`Search works: ${searchResult.status === 200 && !!foundInSearch} (expected: true)`);
  console.log(`Get single exercise: ${getResult.status === 200} (expected: true)`);
  console.log(`Update exercise: ${updateResult.status === 200} (expected: true)`);
  console.log(`Name updated: ${afterUpdate.data.exercise.name === "Back Squat"} (expected: true)`);
  console.log(`Cues updated: ${afterUpdate.data.exercise.cues.length === 4} (expected: true)`);
  console.log(`Short URL parsed: ${!!shortUrlExercise.data.embed_url} (expected: true)`);
  console.log(`Raw ID parsed: ${!!rawIdExercise.data.embed_url} (expected: true)`);
  console.log(`Embed format parsed: ${!!embedFormatExercise.data.embed_url} (expected: true)`);
  console.log(`Delete exercise: ${deleteMain.status === 200} (expected: true)`);
  console.log(`Exercise deleted: ${afterDelete.status === 404} (expected: true)`);

  const success =
    createResult.status === 200 &&
    !!embedUrl &&
    listResult.status === 200 &&
    !!foundInList &&
    searchResult.status === 200 &&
    !!foundInSearch &&
    getResult.status === 200 &&
    updateResult.status === 200 &&
    afterUpdate.data.exercise.name === "Back Squat" &&
    afterUpdate.data.exercise.cues.length === 4 &&
    !!shortUrlExercise.data.embed_url &&
    !!rawIdExercise.data.embed_url &&
    !!embedFormatExercise.data.embed_url &&
    deleteMain.status === 200 &&
    afterDelete.status === 404;

  console.log(`\n✓ TEST ${success ? "PASSED" : "FAILED"}`);
}

main().catch(console.error);
