-- Migration 0010: Reminder Sends Tracking

CREATE TABLE reminder_sends (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  reminder_type TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  ok INTEGER NOT NULL,
  error TEXT,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(booking_id, reminder_type)
);

CREATE INDEX idx_reminder_sends_booking_type ON reminder_sends(booking_id, reminder_type);
CREATE INDEX idx_reminder_sends_created ON reminder_sends(created_at);
