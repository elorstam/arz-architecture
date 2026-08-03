begin;

grant select on table public.studio_project_files to service_role;
grant select on table public.studio_project_file_versions to service_role;

notify pgrst,'reload schema';
commit;
