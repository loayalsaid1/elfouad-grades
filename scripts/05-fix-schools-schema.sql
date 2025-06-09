-- Add slug column to schools if it doesn't exist
ALTER TABLE schools ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Update existing schools with proper slugs
UPDATE schools SET slug = 'international' WHERE name ILIKE '%international%';
UPDATE schools SET slug = 'modern' WHERE name ILIKE '%modern%';

-- Ensure we have the schools
INSERT INTO schools (name, slug) VALUES 
  ('El-Fouad International School', 'international'),
  ('El-Fouad Modern Schools', 'modern')
ON CONFLICT (slug) DO NOTHING;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_schools_slug ON schools(slug);
CREATE INDEX IF NOT EXISTS idx_academic_contexts_active ON academic_contexts(school_id, grade, is_active);
CREATE INDEX IF NOT EXISTS idx_student_results_lookup ON student_results(context_id, student_id);
