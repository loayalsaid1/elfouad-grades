-- Enable Row Level Security on all tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logins ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (admins)
-- Schools policies
CREATE POLICY "Admins can view all schools" ON schools
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert schools" ON schools
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update schools" ON schools
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete schools" ON schools
  FOR DELETE USING (auth.role() = 'authenticated');

-- Academic contexts policies
CREATE POLICY "Admins can view all academic contexts" ON academic_contexts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert academic contexts" ON academic_contexts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update academic contexts" ON academic_contexts
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete academic contexts" ON academic_contexts
  FOR DELETE USING (auth.role() = 'authenticated');

-- Student results policies
CREATE POLICY "Admins can view all student results" ON student_results
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert student results" ON student_results
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update student results" ON student_results
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete student results" ON student_results
  FOR DELETE USING (auth.role() = 'authenticated');

-- System settings policies
CREATE POLICY "Admins can view all system settings" ON system_settings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert system settings" ON system_settings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update system settings" ON system_settings
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete system settings" ON system_settings
  FOR DELETE USING (auth.role() = 'authenticated');

-- Admin logins policies
CREATE POLICY "Admins can insert login events" ON admin_logins
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can view login events" ON admin_logins
  FOR SELECT USING (auth.role() = 'authenticated');

-- Public policies for student access (read-only for active contexts)
CREATE POLICY "Students can view active academic contexts" ON academic_contexts
  FOR SELECT USING (is_active = true);

CREATE POLICY "Students can view their results" ON student_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM academic_contexts ac 
      WHERE ac.id = student_results.context_id 
      AND ac.is_active = true
    )
  );
