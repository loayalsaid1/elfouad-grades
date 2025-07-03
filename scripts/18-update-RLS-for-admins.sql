ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_school_access ENABLE ROW LEVEL SECURITY;


-- Create policies for authenticated users (admins)
-- SCHOOLS
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON schools;
DROP POLICY IF EXISTS "Admins can insert schools" ON schools;
DROP POLICY IF EXISTS "Admins can update schools" ON schools;
DROP POLICY IF EXISTS "Admins can delete schools" ON schools;

CREATE POLICY "Super admins can do anything on schools"
  ON schools FOR ALL
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin));

CREATE POLICY "Admins can select schools they have access to"
  ON schools FOR SELECT
  USING (is_school_admin_for_school(id));

CREATE POLICY "Admins can update schools they have access to"
  ON schools FOR UPDATE
  USING (is_school_admin_for_school(id));

-- ACADEMIC CONTEXTS
DROP POLICY IF EXISTS "Admins can view all academic contexts" ON academic_contexts;
DROP POLICY IF EXISTS "Admins can insert academic contexts" ON academic_contexts;
DROP POLICY IF EXISTS "Admins can update academic contexts" ON academic_contexts;
DROP POLICY IF EXISTS "Admins can delete academic contexts" ON academic_contexts;

CREATE POLICY "Super admins can do anything on academic_contexts"
  ON academic_contexts FOR ALL
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin));

CREATE POLICY "Admins can select academic_contexts for their schools"
  ON academic_contexts FOR SELECT
  USING (is_school_admin_for_context(school_id));

CREATE POLICY "Admins can update academic_contexts for their schools"
  ON academic_contexts FOR UPDATE
  USING (is_school_admin_for_context(school_id));

CREATE POLICY "Admins can delete academic_contexts for their schools"
  ON academic_contexts FOR DELETE
  USING (is_school_admin_for_context(school_id));

CREATE POLICY "Admins can insert academic_contexts for their schools"
  ON academic_contexts FOR INSERT
  WITH CHECK (is_school_admin_for_context(school_id));

-- STUDENT RESULTS
DROP POLICY IF EXISTS "Admins can view all student results" ON student_results;
DROP POLICY IF EXISTS "Admins can insert student results" ON student_results;
DROP POLICY IF EXISTS "Admins can update student results" ON student_results;
DROP POLICY IF EXISTS "Admins can delete student results" ON student_results;

CREATE POLICY "Super admins can do anything on student_results"
  ON student_results FOR ALL
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin));

CREATE POLICY "Admins can select student_results for their schools"
  ON student_results FOR SELECT
  USING (is_school_admin_for_result(context_id));

CREATE POLICY "Admins can insert student_results for their schools"
  ON student_results FOR INSERT
  WITH CHECK (is_school_admin_for_result(context_id));

CREATE POLICY "Admins can update student_results for their schools"
  ON student_results FOR UPDATE
  USING (is_school_admin_for_result(context_id))
  WITH CHECK (is_school_admin_for_result(context_id));

CREATE POLICY "Admins can delete student_results for their schools"
  ON student_results FOR DELETE
  USING (is_school_admin_for_result(context_id));

-- SYSTEM SETTINGS
DROP POLICY IF EXISTS "Admins can view all system settings" ON system_settings;
DROP POLICY IF EXISTS "Admins can insert system settings" ON system_settings;
DROP POLICY IF EXISTS "Admins can update system settings" ON system_settings;
DROP POLICY IF EXISTS "Admins can delete system settings" ON system_settings;

CREATE POLICY "Super admins can do anything on system_settings"
  ON system_settings FOR ALL
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin));

-- ADMIN LOGINS
DROP POLICY IF EXISTS "Admins can insert login events" ON admin_logins;
DROP POLICY IF EXISTS "Admins can view login events" ON admin_logins;

CREATE POLICY "Admins can insert their own login events"
  ON admin_logins FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view their own login events"
  ON admin_logins FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all login events"
  ON admin_logins FOR SELECT
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin));

-- USERS
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Super admins can update any user"
  ON users FOR UPDATE
  USING (id = auth.uid() and is_super_admin);

CREATE POLICY "Super admins can insert users"
  ON users FOR INSERT
  WITH CHECK (id = auth.uid() and is_super_admin);

CREATE POLICY "Super admins can view all users"
  ON users FOR SELECT
  USING (id = auth.uid() and is_super_admin);

-- USER_SCHOOL_ACCESS
CREATE POLICY "Users can view their own school access"
  ON user_school_access FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all school access"
  ON user_school_access FOR SELECT
  USING (exists (select 1 from users u where u.id = auth.uid() and u.is_super_admin));

CREATE POLICY "Super admins can manage school access"
  ON user_school_access FOR ALL
  USING (exists (select 1 from users u where u.id = auth.uid() and u.is_super_admin))
  WITH CHECK (exists (select 1 from users u where u.id = auth.uid() and u.is_super_admin));


-- First, drop the existing policies for the schools-logos bucket
DROP POLICY IF EXISTS "Allow Admins to edit and delete images N the bucke 1fpb0ii_0" ON storage.objects;
DROP POLICY IF EXISTS "Allow Admins to edit and delete images N the bucke 1fpb0ii_1" ON storage.objects;
DROP POLICY IF EXISTS "Allow Admins to edit and delete images N the bucke 1fpb0ii_2" ON storage.objects;
DROP POLICY IF EXISTS "Every users can see the logo image 1fpb0ii_0" ON storage.objects;

-- Create new policies that restrict access based on school
-- Policy for uploading school logos - only school admins can upload
CREATE POLICY "School admins can upload their school logo"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'schools-logos' AND
  (
    -- Extract school slug from the path
    -- Assuming path format is: 'school-slug/filename.ext'
    public.has_school_access(SPLIT_PART(name, '/', 1))
  )
);

-- Policy for updating school logos - only school admins can update
CREATE POLICY "School admins can update their school logo"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'schools-logos' AND
  public.has_school_access(SPLIT_PART(name, '/', 1))
);

-- Policy for deleting school logos - only school admins can delete
CREATE POLICY "School admins can delete their school logo"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'schools-logos' AND
  public.has_school_access(SPLIT_PART(name, '/', 1))
);

-- Policy for viewing school logos - anyone can view
CREATE POLICY "Anyone can view school logos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'schools-logos');


-- There is still one for super admin., but I forgot it honestly and for some reason, I'm not gonna put it her, 
-- why, it's my codebase, do you have any opinion on that???