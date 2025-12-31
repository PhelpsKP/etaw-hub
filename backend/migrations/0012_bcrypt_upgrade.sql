-- Migration 0012: Add password hashing metadata for sha256->bcrypt upgrade
PRAGMA foreign_keys = ON;

ALTER TABLE users ADD COLUMN password_algo TEXT NOT NULL DEFAULT 'sha256';
ALTER TABLE users ADD COLUMN password_salt TEXT NULL;

UPDATE users
SET password_algo = 'bcrypt'
WHERE password_hash LIKE '$2%$%';
