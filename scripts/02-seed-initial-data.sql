-- Insert El Fouad Schools
INSERT INTO schools (name) VALUES 
  ('El Fouad International School'),
  ('El Fouad Modern School')
ON CONFLICT (name) DO NOTHING;

-- Insert initial system settings
INSERT INTO system_settings (key, value) VALUES 
  ('system_status', '{"enabled": true}'),
  ('maintenance_mode', '{"enabled": false, "message": "System is under maintenance"}'),
  ('max_upload_size', '{"bytes": 10485760}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Insert some sample academic contexts for testing
INSERT INTO academic_contexts (school_id, year, term, grade, is_active) 
SELECT 
  s.id,
  2024,
  1,
  grade_num,
  CASE WHEN grade_num = 5 THEN true ELSE false END
FROM schools s
CROSS JOIN generate_series(1, 8) AS grade_num
ON CONFLICT (school_id, year, term, grade) DO NOTHING;
