-- Add logo column to schools table if it doesn't exist
ALTER TABLE schools ADD COLUMN IF NOT EXISTS logo TEXT;

-- Update existing schools with default logo paths if missing
UPDATE schools
SET logo = CONCAT(slug, '/elfouad-', slug, '-logo')
WHERE logo IS NULL AND slug IS NOT NULL;

-- Ensure the logo column is indexed for faster lookups
CREATE INDEX IF NOT EXISTS idx_schools_logo ON schools(logo);


-- Add a comment to document the logo column
COMMENT ON COLUMN schools.logo IS 'Path to the school logo in the storage system.';
