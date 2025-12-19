PRAGMA foreign_keys = ON;

-- Credit types catalog
CREATE TABLE IF NOT EXISTS credit_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- Client credit balances (one row per user per credit type)
CREATE TABLE IF NOT EXISTS client_credit_balances (
  user_id INTEGER NOT NULL,
  credit_type_id TEXT NOT NULL,
  balance INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY (user_id, credit_type_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (credit_type_id) REFERENCES credit_types(id) ON DELETE RESTRICT
);

-- Trigger for client_credit_balances updated_at
CREATE TRIGGER IF NOT EXISTS client_credit_balances_updated_at
AFTER UPDATE ON client_credit_balances
FOR EACH ROW
BEGIN
  UPDATE client_credit_balances
  SET updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  WHERE user_id = OLD.user_id AND credit_type_id = OLD.credit_type_id;
END;

-- Credit ledger (audit log of all credit changes)
CREATE TABLE IF NOT EXISTS credit_ledger (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  credit_type_id TEXT NOT NULL,
  delta INTEGER NOT NULL,
  reason TEXT,
  created_by_user_id INTEGER,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (credit_type_id) REFERENCES credit_types(id) ON DELETE RESTRICT,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Index for credit ledger queries
CREATE INDEX IF NOT EXISTS idx_credit_ledger_user_type_created ON credit_ledger(user_id, credit_type_id, created_at);

-- Memberships
CREATE TABLE IF NOT EXISTS memberships (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  plan TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  unlimited INTEGER NOT NULL DEFAULT 0,
  starts_at TEXT,
  ends_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Trigger for memberships updated_at
CREATE TRIGGER IF NOT EXISTS memberships_updated_at
AFTER UPDATE ON memberships
FOR EACH ROW
BEGIN
  UPDATE memberships
  SET updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  WHERE id = OLD.id;
END;

-- Index for membership queries
CREATE INDEX IF NOT EXISTS idx_memberships_user_plan_active ON memberships(user_id, plan, is_active);
