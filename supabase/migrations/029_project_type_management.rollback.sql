begin;
revoke delete on public.studio_project_types from anon,authenticated;
drop trigger if exists studio_validate_project_type on public.studio_project_types;
drop function if exists public.studio_validate_project_type();
drop table if exists public.studio_project_types;
commit;
