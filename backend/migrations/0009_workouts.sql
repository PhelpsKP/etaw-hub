-- Migration 0009: Workouts and Workout Assignment
-- Creates tables for workout management and client assignment

-- 1. Workouts table
CREATE TABLE workouts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. Workout exercises join table (many-to-many: workouts ↔ exercises)
CREATE TABLE workout_exercises (
  id TEXT PRIMARY KEY,
  workout_id TEXT NOT NULL,
  exercise_id TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE RESTRICT,
  UNIQUE(workout_id, exercise_id)
);

-- Index for efficient lookups by workout
CREATE INDEX idx_workout_exercises_workout_id ON workout_exercises(workout_id);

-- Index for sort order queries
CREATE INDEX idx_workout_exercises_sort_order ON workout_exercises(workout_id, sort_order);

-- 3. Client workouts assignment table (many-to-many: users ↔ workouts)
CREATE TABLE client_workouts (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  workout_id TEXT NOT NULL,
  assigned_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
  UNIQUE(user_id, workout_id)
);

-- Index for efficient lookups by user
CREATE INDEX idx_client_workouts_user_id ON client_workouts(user_id);

-- Index for efficient lookups by workout
CREATE INDEX idx_client_workouts_workout_id ON client_workouts(workout_id);
