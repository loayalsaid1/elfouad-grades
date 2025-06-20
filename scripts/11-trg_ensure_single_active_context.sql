-- Trigger function to ensure only one active context per (school_id, grade)
CREATE OR REPLACE FUNCTION ensure_single_active_context()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active THEN
    UPDATE academic_contexts
    SET is_active = FALSE
    WHERE school_id = NEW.school_id
      AND grade = NEW.grade
      AND id <> NEW.id
      AND is_active = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for INSERT and UPDATE
DROP TRIGGER IF EXISTS trg_ensure_single_active_context ON academic_contexts;
CREATE TRIGGER trg_ensure_single_active_context
BEFORE INSERT OR UPDATE ON academic_contexts
FOR EACH ROW
EXECUTE FUNCTION ensure_single_active_context();
