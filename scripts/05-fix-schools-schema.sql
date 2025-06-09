-- Add slug column to schools table for URL mapping
ALTER TABLE schools ADD COLUMN IF NOT EXISTS slug VARCHAR(50) UNIQUE;

-- Update existing schools with slugs
UPDATE schools SET slug = 'international' WHERE name ILIKE '%international%';
UPDATE schools SET slug = 'modern' WHERE name ILIKE '%modern%';

-- Insert schools if they don't exist
INSERT INTO schools (name, slug) VALUES 
  ('El-Fouad International School', 'international'),
  ('El-Fouad Modern Schools', 'modern')
ON CONFLICT (slug) DO NOTHING;

-- Make slug required for new entries
ALTER TABLE schools ALTER COLUMN slug SET NOT NULL;
