-- Creates a view with unique student IDs
create or replace view distinct_students as
select distinct student_id
from student_results;
