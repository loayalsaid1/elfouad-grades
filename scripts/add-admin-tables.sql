-- Check if admin tables exist, if not create them
-- This will only add what's missing to your existing database

-- Add schools table if it doesn't exist
CREATE TABLE IF NOT EXISTS schools (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add academic_contexts table if it doesn't exist
CREATE TABLE IF NOT EXISTS academic_contexts (
  id SERIAL PRIMARY KEY,
  school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  term INTEGER NOT NULL CHECK (term IN (1, 2)),
  grade INTEGER NOT NULL CHECK (grade >= 1 AND grade <= 12),
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(school_id, year, term, grade)
);

-- Add system_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS system_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert El Fouad Schools if they don't exist
INSERT INTO schools (name) VALUES 
  ('El Fouad International School'),
  ('El Fouad Modern School')
ON CONFLICT (name) DO NOTHING;

-- Insert initial system settings
INSERT INTO system_settings (key, value) VALUES 
  ('system_status', '{"enabled": true}'),
  ('current_round', '{"school_id": 1, "year": 2024, "term": 1, "grade": 5}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
