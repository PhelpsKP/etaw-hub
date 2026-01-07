-- Update the active waiver with the finalized waiver text from backend/assets/waiver.txt
UPDATE waivers
SET
  title = 'Release of Liability, Waiver of Claims, Assumption of Risk, and Indemnification Agreement',
  body = readfile('backend/assets/waiver.txt')
WHERE id = 'waiver_v1';
