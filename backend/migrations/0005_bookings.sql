PRAGMA foreign_keys = ON;

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'booked',
  booked_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  cancelled_at TEXT,
  credit_type_id TEXT,
  UNIQUE(session_id, user_id),
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (credit_type_id) REFERENCES credit_types(id) ON DELETE SET NULL
);

-- Index for booking queries
CREATE INDEX IF NOT EXISTS idx_bookings_session ON bookings(session_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
