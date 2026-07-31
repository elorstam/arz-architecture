begin;
drop trigger if exists studio_projects_protect_fields on public.studio_projects;
drop trigger if exists studio_projects_set_updated_at on public.studio_projects;
drop function if exists public.studio_protect_project_fields();
drop table if exists public.studio_projects;
notify pgrst,'reload schema';
commit;
