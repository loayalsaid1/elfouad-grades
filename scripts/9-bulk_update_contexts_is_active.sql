create or replace function bulk_update_contexts_is_active(
  updates jsonb
)
returns void as $$
declare
  update_row record;  -- Declare update_row as a record type
begin
  -- Loop through each update and apply in a transaction
  for update_row in select * from jsonb_to_recordset(updates) as (id int, is_active boolean)
  loop
    update academic_contexts
    set is_active = update_row.is_active
    where id = update_row.id;
  end loop;
end;
$$ language plpgsql;
