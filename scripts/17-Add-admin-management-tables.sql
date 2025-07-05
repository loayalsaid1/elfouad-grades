-- Users table for admin metadata
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  is_super_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User-school access mapping
CREATE TABLE IF NOT EXISTS user_school_access (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  UNIQUE(user_id, school_id)
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_user_school_access_user ON user_school_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_school_access_school ON user_school_access(school_id);
