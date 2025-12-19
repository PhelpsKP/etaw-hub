PRAGMA foreign_keys = ON;

-- Exercise library
CREATE TABLE IF NOT EXISTS exercises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  youtube_url TEXT DEFAULT NULL,
  youtube_video_id TEXT DEFAULT NULL,
  primary_muscles TEXT DEFAULT '[]',
  secondary_muscles TEXT DEFAULT '[]',
  equipment TEXT DEFAULT '[]',
  difficulty TEXT DEFAULT NULL CHECK(difficulty IS NULL OR difficulty IN ('beginner', 'intermediate', 'advanced')),
  cues TEXT DEFAULT '[]',
  tags TEXT DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- Trigger for exercises updated_at
CREATE TRIGGER IF NOT EXISTS exercises_updated_at
AFTER UPDATE ON exercises
FOR EACH ROW
BEGIN
  UPDATE exercises
  SET updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  WHERE id = OLD.id;
END;

-- Index for exercise name searches
CREATE INDEX IF NOT EXISTS idx_exercises_name ON exercises(name);
