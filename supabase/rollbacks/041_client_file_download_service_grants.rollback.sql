begin;

revoke select on table public.studio_project_file_versions from service_role;
revoke select on table public.studio_project_files from service_role;

notify pgrst,'reload schema';
commit;
