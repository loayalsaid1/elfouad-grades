ALTER TABLE admin_logins ENABLE ROW LEVEL SECURITY;


-- Admin logins policies
CREATE POLICY "Admins can insert login events" ON admin_logins
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can view login events" ON admin_logins
  FOR SELECT USING (auth.role() = 'authenticated');
