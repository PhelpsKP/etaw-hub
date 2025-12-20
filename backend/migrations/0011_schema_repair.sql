-- Repair migration to fix schema inconsistencies from manual D1 operations
-- This migration uses SQLite-safe rebuild pattern to fix auth_sessions.user_id type

PRAGMA foreign_keys = OFF;

-- Step 1: Create new auth_sessions table with correct schema
CREATE TABLE auth_sessions_new (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  jti TEXT NOT NULL UNIQUE,
  issued_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Step 2: Copy existing data (if any)
INSERT INTO auth_sessions_new (id, user_id, jti, issued_at, expires_at, revoked_at)
SELECT
  id,
  CAST(user_id AS INTEGER) as user_id,
  jti,
  issued_at,
  expires_at,
  revoked_at
FROM auth_sessions;

-- Step 3: Drop old table
DROP TABLE auth_sessions;

-- Step 4: Rename new table
ALTER TABLE auth_sessions_new RENAME TO auth_sessions;

-- Step 5: Recreate indexes
CREATE INDEX idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX idx_auth_sessions_expires_at ON auth_sessions(expires_at);

PRAGMA foreign_keys = ON;
