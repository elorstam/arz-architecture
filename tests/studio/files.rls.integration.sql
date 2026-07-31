begin;
-- Run only against an isolated Supabase test project after 005_studio_files.sql.
select plan(12);
select has_table('public','studio_project_folders','folders table exists');
select has_table('public','studio_project_files','files table exists');
select row_security_active('public','studio_project_folders','folder RLS active');
select row_security_active('public','studio_project_files','file RLS active');
select policies_are('public','studio_project_folders',array['studio_folders_select_member','studio_folders_insert_owner','studio_folders_update_owner'],'folder policy matrix');
select policies_are('public','studio_project_files',array['studio_files_select_member','studio_files_insert_owner','studio_files_update_owner'],'file policy matrix');
select policies_are('storage','objects',array['studio_files_storage_cleanup','studio_files_storage_insert','studio_files_storage_select'],'storage policy matrix');
select has_function('public','studio_initialize_project_folders',array['uuid'],'initializer exists');
select has_index('public','studio_project_folders','studio_folders_sibling_name_unique','folder duplicate guard');
select has_index('public','studio_project_files','studio_files_folder_name_unique','file duplicate guard');
select hasnt_privilege('authenticated','public.studio_project_folders','DELETE','no folder hard delete');
select hasnt_privilege('authenticated','public.studio_project_files','DELETE','no file hard delete');
select * from finish();
rollback;
