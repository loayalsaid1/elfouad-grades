create or replace function get_student_result(
  school_slug text,
  input_grade int,
  input_student_id varchar,
  input_parent_password text default null
)
returns table (
  student_name text,
  scores jsonb
) as $$
declare
  v_school_id int;
  v_context_id int;
  v_password text;
begin
  -- Step 1: School lookup
  select id into v_school_id
  from schools
  where slug = school_slug;

  if not found then
    raise exception 'School with slug "%" not found', school_slug
      using errcode = 'S40401';
  end if;

  -- Step 2: Context lookup
  select id into v_context_id
  from academic_contexts
  where school_id = v_school_id
    and grade = input_grade
    and is_active = true;

  if not found then
    raise exception 'No active academic context for this grade'
      using errcode = 'C40401';
  end if;

  -- Step 3: Fetch student result & password
  select parent_password into v_password
  from student_results
  where context_id = v_context_id and student_id = input_student_id;

  if not found then
    raise exception 'Student not found in this context'
      using errcode = 'ST40401';
  end if;

  -- Step 4: Check password if required
  if v_password is not null and trim(v_password) <> '' then
    if input_parent_password is null or trim(input_parent_password) = '' then
      raise exception 'Parent password required'
        using errcode = 'P40101';
    end if;

    if input_parent_password <> v_password then
      raise exception 'Incorrect parent password'
        using errcode = 'P40102';
    end if;
  end if;

  -- Step 5: Return result with explicit aliases
  return query
  select sr.student_name, sr.scores
  from student_results sr
  where sr.context_id = v_context_id and sr.student_id = input_student_id;
end;
$$ language plpgsql;
