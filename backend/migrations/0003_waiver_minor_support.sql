-- Add fields to support both adult and minor participant waivers
-- NOTE: This migration preserves existing waiver_signatures records

PRAGMA foreign_keys = ON;

-- Add new columns to waiver_signatures table
-- All nullable to preserve existing records
ALTER TABLE waiver_signatures ADD COLUMN participant_name TEXT;
ALTER TABLE waiver_signatures ADD COLUMN participant_dob TEXT;
ALTER TABLE waiver_signatures ADD COLUMN participant_signature TEXT;
ALTER TABLE waiver_signatures ADD COLUMN is_minor INTEGER NOT NULL DEFAULT 0;
ALTER TABLE waiver_signatures ADD COLUMN minor_name TEXT;
ALTER TABLE waiver_signatures ADD COLUMN minor_dob TEXT;
ALTER TABLE waiver_signatures ADD COLUMN guardian_name TEXT;
ALTER TABLE waiver_signatures ADD COLUMN guardian_relationship TEXT;
ALTER TABLE waiver_signatures ADD COLUMN guardian_signature TEXT;

-- Backfill existing records: copy signed_name to participant_signature for backwards compatibility
UPDATE waiver_signatures
SET participant_signature = signed_name,
    participant_name = signed_name
WHERE participant_signature IS NULL;
