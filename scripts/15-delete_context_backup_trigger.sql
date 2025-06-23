-- Trigger function to call the Edge Function on row deletion
create or replace function call_delete_context_backup_edge()
returns trigger as $$
declare
  response json;
  -- edge_url text := 'https://<project reference here>.supabase.co/functions/v1/delete-context-backup';
  school_slug text;
begin
  -- Lookup school slug from schools table
  select slug into school_slug from schools where id = old.school_id;

  -- Call the edge function with the deleted row's data
  select
    http_post(
      edge_url,
      json_build_object(
        'school-slug', school_slug,
        'year', old.year,
        'term', old.term,
        'grade', old.grade
      )::text,
      'application/json'
    ) into response;
  return old;
end;
$$ language plpgsql security definer;

-- Create the trigger on your table (replace 'context_backups' with your table name)
drop trigger if exists trg_delete_context_backup on academic_contexts;
create trigger trg_delete_context_backup
after delete on academic_contexts
for each row execute function call_delete_context_backup_edge();
