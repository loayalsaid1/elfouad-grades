-- Add support for absent students
-- Update the scores JSON structure to include absent status

-- Example of new scores structure:
-- {
--   "Math": {"score": 85, "full_mark": 100, "absent": false},
--   "Science": {"score": null, "full_mark": 100, "absent": true}
-- }

-- No schema changes needed, just updating the JSON structure
-- The existing scores JSON column can handle the new structure

-- Add a comment to document the new structure
COMMENT ON COLUMN student_results.scores IS 'JSON object with subject scores. Format: {"subject": {"score": number|null, "full_mark": number, "absent": boolean}}';
