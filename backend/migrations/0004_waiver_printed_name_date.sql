-- Add printed name and date fields to waiver_signatures
-- These fields are required in the finalized waiver form

PRAGMA foreign_keys = ON;

-- Add fields for printed names and dates from the waiver form
ALTER TABLE waiver_signatures ADD COLUMN participant_printed_name TEXT;
ALTER TABLE waiver_signatures ADD COLUMN participant_signed_date TEXT;
ALTER TABLE waiver_signatures ADD COLUMN guardian_printed_name TEXT;
ALTER TABLE waiver_signatures ADD COLUMN guardian_signed_date TEXT;

-- Backfill existing records: use participant_signature as printed_name for backwards compatibility
UPDATE waiver_signatures
SET participant_printed_name = participant_signature
WHERE participant_printed_name IS NULL AND participant_signature IS NOT NULL;

-- Backfill existing records: use signed_at as signed_date for backwards compatibility
UPDATE waiver_signatures
SET participant_signed_date = DATE(signed_at)
WHERE participant_signed_date IS NULL AND signed_at IS NOT NULL;

-- Backfill existing minor records: use guardian_signature as printed_name
UPDATE waiver_signatures
SET guardian_printed_name = guardian_signature
WHERE guardian_printed_name IS NULL AND guardian_signature IS NOT NULL AND is_minor = 1;

-- Backfill existing minor records: use signed_at as guardian_signed_date
UPDATE waiver_signatures
SET guardian_signed_date = DATE(signed_at)
WHERE guardian_signed_date IS NULL AND signed_at IS NOT NULL AND is_minor = 1;
