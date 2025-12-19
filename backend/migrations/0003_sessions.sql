PRAGMA foreign_keys = ON;

-- Class types catalog
CREATE TABLE IF NOT EXISTS class_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  default_capacity INTEGER NOT NULL DEFAULT 10,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- Scheduled sessions
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  class_type_id TEXT NOT NULL,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  is_visible INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  FOREIGN KEY (class_type_id) REFERENCES class_types(id) ON DELETE RESTRICT
);

-- Trigger for sessions updated_at
CREATE TRIGGER IF NOT EXISTS sessions_updated_at
AFTER UPDATE ON sessions
FOR EACH ROW
BEGIN
  UPDATE sessions
  SET updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  WHERE id = OLD.id;
END;

-- Indexes for sessions
CREATE INDEX IF NOT EXISTS idx_sessions_starts_at ON sessions(starts_at);
CREATE INDEX IF NOT EXISTS idx_sessions_visible_starts_at ON sessions(is_visible, starts_at);
CREATE INDEX IF NOT EXISTS idx_sessions_class_type_id ON sessions(class_type_id);
