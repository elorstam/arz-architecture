begin;
select relname,relrowsecurity from pg_class where oid in('public.studio_render_categories'::regclass,'public.studio_project_renders'::regclass,'public.studio_render_events'::regclass);
select tablename,policyname,cmd from pg_policies where schemaname='public' and tablename in('studio_render_categories','studio_project_renders','studio_render_events') order by tablename,policyname;
select has_table_privilege('authenticated','public.studio_project_renders','SELECT'),has_table_privilege('authenticated','public.studio_project_renders','INSERT'),has_table_privilege('authenticated','public.studio_project_renders','UPDATE'),has_table_privilege('authenticated','public.studio_project_renders','DELETE');
rollback;
