PRAGMA foreign_keys = ON;

-- 1) Client profile (1:1 with users)
CREATE TABLE IF NOT EXISTS client_profiles (
  user_id INTEGER PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  dob TEXT,
  emergency_name TEXT,
  emergency_phone TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TRIGGER IF NOT EXISTS client_profiles_updated_at
AFTER UPDATE ON client_profiles
FOR EACH ROW
BEGIN
  UPDATE client_profiles
  SET updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  WHERE user_id = OLD.user_id;
END;

-- 2) Waiver versions (so you can change text later without breaking history)
CREATE TABLE IF NOT EXISTS waivers (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- Seed an initial active waiver (placeholder text is fine for now)
INSERT INTO waivers (id, title, body, is_active)
VALUES (
  'waiver_v1',
  'Client Waiver',
  'Placeholder waiver text. Replace with official waiver copy when available.',
  1
)
ON CONFLICT(id) DO NOTHING;

-- 3) Signatures (who signed which waiver, when)
CREATE TABLE IF NOT EXISTS waiver_signatures (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  waiver_id TEXT NOT NULL,
  signed_name TEXT NOT NULL,
  signed_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  user_agent TEXT,
  ip_address TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (waiver_id) REFERENCES waivers(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_waiver_signatures_user ON waiver_signatures(user_id);
CREATE INDEX IF NOT EXISTS idx_waiver_signatures_waiver ON waiver_signatures(waiver_id);
