PRAGMA foreign_keys = ON;

-- Intake form submissions
CREATE TABLE IF NOT EXISTS intake_submissions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  form_type TEXT NOT NULL CHECK(form_type IN ('basic', 'pt')),
  submitted_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  data_json TEXT NOT NULL,
  UNIQUE(user_id, form_type),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for intake queries
CREATE INDEX IF NOT EXISTS idx_intake_submissions_user ON intake_submissions(user_id);

-- Admin settings storage
CREATE TABLE IF NOT EXISTS admin_settings (
  key TEXT PRIMARY KEY,
  value_text TEXT NOT NULL
);

-- Initialize PT intake requirement setting (default: false)
INSERT INTO admin_settings (key, value_text)
VALUES ('pt_intake_required', 'false')
ON CONFLICT(key) DO NOTHING;
