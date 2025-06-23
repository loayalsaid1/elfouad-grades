create or replace function get_context_students_and_subjects(input_context_id integer)
returns jsonb
language plpgsql
as $$
declare
  students jsonb;
  subjects jsonb;
begin
  -- Get all students and their full scores
  select jsonb_agg(jsonb_build_object(
    'student_id', student_id,
    'student_name', student_name,
    'parent_password', parent_password,
    'scores', scores
  ))
  into students
  from student_results
  where context_id = input_context_id;

  -- Aggregate all subjects with first-seen order preserved
  select jsonb_agg(jsonb_build_object(
    'subject', subject,
    'full_mark', full_mark::int
  ) order by min_position)
  into subjects
  from (
    select
      s.s->>'subject' as subject,
      s.s->>'full_mark' as full_mark,
      min(sr.id * 1000 + s.idx) as min_position  -- crude but stable across multiple students
    from student_results sr,
         lateral jsonb_array_elements(sr.scores) with ordinality as s(s, idx)
    where sr.context_id = input_context_id
      and s.s->>'subject' is not null
      and s.s->>'full_mark' is not null
    group by s.s->>'subject', s.s->>'full_mark'
  ) ranked_subjects;

  return jsonb_build_object(
    'students', coalesce(students, '[]'::jsonb),
    'subjects', coalesce(subjects, '[]'::jsonb)
  );
end;
$$;
