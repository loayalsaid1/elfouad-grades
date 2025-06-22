create or replace function get_context_students_and_subjects(input_context_id integer)
returns jsonb
language plpgsql
as $$
declare
  students jsonb;
  subjects jsonb;
begin
  -- Fetch students
  select jsonb_agg(jsonb_build_object(
    'student_id', student_id,
    'student_name', student_name,
    'parent_password', parent_password,
    'scores', scores
  ))
  into students
  from student_results
  where context_id = input_context_id;

  -- Fetch unique subjects with a sample full_mark (first non-null, highest)
  select jsonb_agg(
    jsonb_build_object(
      'subject', subject,
      'full_mark', full_mark::int
    )
    order by subject
  )
  into subjects
  from (
    select distinct on (s->>'subject')
      s->>'subject' as subject,
      s->>'full_mark' as full_mark
    from student_results,
         jsonb_array_elements(scores) as s
    where context_id = input_context_id
      and s->>'full_mark' is not null
    order by s->>'subject', s->>'full_mark' desc nulls last
  ) as unique_subjects;

  return jsonb_build_object(
    'students', coalesce(students, '[]'::jsonb),
    'subjects', coalesce(subjects, '[]'::jsonb)
  );
end;
$$;
