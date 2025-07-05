CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid() AND is_super_admin = true
  );
$$;




CREATE POLICY "Admins can insert academic_contexts for their schools"
  ON academic_contexts FOR INSERT
  WITH CHECK (is_school_admin_for_context(school_id));




-- Create a function to check if a user has access to a specific school
CREATE OR REPLACE FUNCTION public.has_school_access(school_slug text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    JOIN public.user_school_access usa ON u.id = usa.user_id
    JOIN public.schools s ON usa.school_id = s.id
    WHERE u.id = auth.uid() AND s.slug = school_slug
  );
$$;




-- Helper function for school admin access to a school
CREATE OR REPLACE FUNCTION is_school_admin_for_school(school_id_input int)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_school_access
    WHERE user_id = auth.uid() AND school_id = school_id_input
  );
$$ LANGUAGE sql STABLE;

-- Helper function for school admin access to academic_contexts
CREATE OR REPLACE FUNCTION is_school_admin_for_context(context_school_id int)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_school_access
    WHERE user_id = auth.uid() AND school_id = context_school_id
  );
$$ LANGUAGE sql STABLE;

-- Helper function for school admin access to student_results
CREATE OR REPLACE FUNCTION is_school_admin_for_result(context_id_input int)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM academic_contexts ac
    JOIN user_school_access usa ON usa.school_id = ac.school_id
    WHERE ac.id = context_id_input AND usa.user_id = auth.uid()
  );
$$ LANGUAGE sql STABLE;
