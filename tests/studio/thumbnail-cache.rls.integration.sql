begin;

-- Run manually against a disposable database after migration 021.
select relrowsecurity
from pg_class
where oid = 'public.studio_file_thumbnails'::regclass;

select policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename = 'studio_file_thumbnails'
order by policyname;

select has_table_privilege('authenticated', 'public.studio_file_thumbnails', 'SELECT');
select has_table_privilege('authenticated', 'public.studio_file_thumbnails', 'INSERT');
select has_table_privilege('authenticated', 'public.studio_file_thumbnails', 'UPDATE');
select has_table_privilege('authenticated', 'public.studio_file_thumbnails', 'DELETE');

rollback;
