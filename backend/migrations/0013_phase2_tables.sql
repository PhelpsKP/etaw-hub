-- Migration 0013: Phase 2 Tables and Schema Extensions
-- Creates tables for groups, workout tracking, session types, and credit purchases
-- Also adds nullable recurrence columns to sessions table

PRAGMA foreign_keys = ON;

-- 1. Groups table
CREATE TABLE IF NOT EXISTS groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- 2. Group memberships (clients belong to groups)
CREATE TABLE IF NOT EXISTS group_memberships (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL,
  client_id INTEGER NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  created_by INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_group_memberships_group_id ON group_memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_client_id ON group_memberships(client_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_dates ON group_memberships(start_date, end_date);

-- 3. Workout assignments (to groups or individual clients)
CREATE TABLE IF NOT EXISTS workout_assignments (
  id TEXT PRIMARY KEY,
  workout_id TEXT NOT NULL,
  assignee_type TEXT NOT NULL CHECK(assignee_type IN ('group', 'client')),
  assignee_id TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  created_by INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_workout_assignments_workout_id ON workout_assignments(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_assignments_assignee ON workout_assignments(assignee_type, assignee_id);
CREATE INDEX IF NOT EXISTS idx_workout_assignments_dates ON workout_assignments(start_date, end_date);

-- 4. Workout sessions (when a client performs a workout)
CREATE TABLE IF NOT EXISTS workout_sessions (
  id TEXT PRIMARY KEY,
  client_id INTEGER NOT NULL,
  workout_id TEXT NOT NULL,
  assignment_id TEXT,
  performed_at TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE RESTRICT,
  FOREIGN KEY (assignment_id) REFERENCES workout_assignments(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_workout_sessions_client_id ON workout_sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_workout_id ON workout_sessions(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_performed_at ON workout_sessions(performed_at);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_assignment_id ON workout_sessions(assignment_id);

-- 5. Workout set logs (detailed exercise tracking within sessions)
CREATE TABLE IF NOT EXISTS workout_set_logs (
  id TEXT PRIMARY KEY,
  workout_session_id TEXT NOT NULL,
  exercise_id TEXT NOT NULL,
  set_index INTEGER NOT NULL,
  reps INTEGER,
  weight REAL,
  rest_seconds INTEGER,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  FOREIGN KEY (workout_session_id) REFERENCES workout_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_workout_set_logs_session_id ON workout_set_logs(workout_session_id);
CREATE INDEX IF NOT EXISTS idx_workout_set_logs_exercise_id ON workout_set_logs(exercise_id);

-- 6. Session types (for credit-based booking system)
CREATE TABLE IF NOT EXISTS session_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  credits_cost INTEGER NOT NULL DEFAULT 1,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- 7. Credit purchases (transaction records for purchased credits)
CREATE TABLE IF NOT EXISTS credit_purchases (
  id TEXT PRIMARY KEY,
  client_id INTEGER NOT NULL,
  provider TEXT NOT NULL,
  provider_txn_id TEXT NOT NULL UNIQUE,
  dollars_amount REAL NOT NULL,
  credits_amount INTEGER NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending', 'completed', 'failed', 'refunded')),
  purchased_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_credit_purchases_client_id ON credit_purchases(client_id);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_provider_txn_id ON credit_purchases(provider_txn_id);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_status ON credit_purchases(status);

-- 8. Add nullable recurrence columns to sessions table
-- These support Phase 2 recurring session functionality
ALTER TABLE sessions ADD COLUMN series_id TEXT;
ALTER TABLE sessions ADD COLUMN recurrence_rule TEXT;
ALTER TABLE sessions ADD COLUMN is_exception INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_sessions_series_id ON sessions(series_id);
