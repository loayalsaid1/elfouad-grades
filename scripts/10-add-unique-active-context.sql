CREATE UNIQUE INDEX IF NOT EXISTS one_active_context_per_school_grade
  ON academic_contexts(school_id, grade)
  WHERE is_active = true;
