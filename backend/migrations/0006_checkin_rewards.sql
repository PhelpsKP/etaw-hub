PRAGMA foreign_keys = ON;

-- Booking check-ins (one-to-one with bookings)
CREATE TABLE IF NOT EXISTS booking_checkins (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL UNIQUE,
  checked_in_by INTEGER NOT NULL,
  checked_in_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  notes TEXT,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (checked_in_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Index for check-in queries
CREATE INDEX IF NOT EXISTS idx_booking_checkins_booking ON booking_checkins(booking_id);

-- Rewards ledger (tracks points earned)
CREATE TABLE IF NOT EXISTS rewards_ledger (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  booking_id TEXT,
  delta_points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE(booking_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
);

-- Indexes for rewards queries
CREATE INDEX IF NOT EXISTS idx_rewards_ledger_user ON rewards_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_rewards_ledger_booking ON rewards_ledger(booking_id);
