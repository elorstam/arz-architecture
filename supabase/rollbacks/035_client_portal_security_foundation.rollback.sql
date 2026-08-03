begin;

drop policy if exists studio_projects_select_scoped on public.studio_projects;
create policy studio_projects_select_member on public.studio_projects for select to authenticated using(public.studio_is_organization_member(organization_id));

drop policy if exists studio_project_renders_select_staff on public.studio_project_renders;create policy studio_project_renders_select on public.studio_project_renders for select to authenticated using(public.studio_is_organization_member(organization_id));
drop policy if exists studio_render_categories_select_staff on public.studio_render_categories;create policy studio_render_categories_select on public.studio_render_categories for select to authenticated using(public.studio_is_organization_member(organization_id));
drop policy if exists studio_render_events_select_staff on public.studio_render_events;create policy studio_render_events_select on public.studio_render_events for select to authenticated using(public.studio_is_organization_member(organization_id));
drop policy if exists studio_project_stages_select_staff on public.studio_project_stages;create policy studio_project_stages_select on public.studio_project_stages for select to authenticated using(public.studio_is_organization_member(organization_id));
drop policy if exists studio_stage_events_select_staff on public.studio_project_stage_events;create policy studio_stage_events_select on public.studio_project_stage_events for select to authenticated using(public.studio_is_organization_member(organization_id));
drop policy if exists studio_stage_files_select_staff on public.studio_project_stage_files;create policy studio_stage_files_select on public.studio_project_stage_files for select to authenticated using(public.studio_is_organization_member(organization_id));
drop policy if exists studio_notifications_select_staff on public.studio_notifications;create policy studio_notifications_select on public.studio_notifications for select to authenticated using(public.studio_is_organization_member(organization_id));
drop policy if exists studio_notification_events_select_staff on public.studio_notification_events;create policy studio_notification_events_select on public.studio_notification_events for select to authenticated using(public.studio_is_organization_member(organization_id));
drop policy if exists studio_finance_entries_select_staff on public.studio_finance_entries;create policy studio_finance_entries_select on public.studio_finance_entries for select to authenticated using(public.studio_is_organization_member(organization_id));
drop policy if exists studio_finance_payments_select_staff on public.studio_finance_payments;create policy studio_finance_payments_select on public.studio_finance_payments for select to authenticated using(public.studio_is_organization_member(organization_id));
drop policy if exists studio_finance_events_select_staff on public.studio_finance_events;create policy studio_finance_events_select on public.studio_finance_events for select to authenticated using(public.studio_is_organization_member(organization_id));
drop policy if exists studio_obligations_select_staff on public.studio_project_obligations;create policy studio_obligations_select on public.studio_project_obligations for select to authenticated using(public.studio_is_organization_member(organization_id));
drop policy if exists studio_obligation_events_select_staff on public.studio_project_obligation_events;create policy studio_obligation_events_select on public.studio_project_obligation_events for select to authenticated using(public.studio_is_organization_member(organization_id));
drop policy if exists studio_files_select_staff on public.studio_project_files;create policy studio_files_select_member on public.studio_project_files for select to authenticated using(public.studio_is_organization_member(organization_id));
drop policy if exists studio_file_versions_select_staff on public.studio_project_file_versions;create policy studio_file_versions_select_member on public.studio_project_file_versions for select to authenticated using(public.studio_is_organization_member(organization_id) and exists(select 1 from public.studio_project_files f where f.id=file_id and f.organization_id=organization_id and f.project_id=project_id));
drop policy if exists studio_folders_select_staff on public.studio_project_folders;create policy studio_folders_select_member on public.studio_project_folders for select to authenticated using(public.studio_is_organization_member(organization_id));
drop policy if exists studio_files_storage_select on storage.objects;create policy studio_files_storage_select on storage.objects for select to authenticated using(bucket_id='studio-files' and (storage.foldername(name))[1]='organizations' and public.studio_is_organization_member(((storage.foldername(name))[2])::uuid) and exists(select 1 from public.studio_project_files f where f.storage_bucket=bucket_id and f.storage_path=name and f.status='ready'));

drop function if exists public.client_portal_list_official_processes(uuid);
drop function if exists public.client_portal_list_finance(uuid);
drop function if exists public.client_portal_list_notifications(uuid);
drop function if exists public.client_portal_list_files(uuid);
drop function if exists public.client_portal_list_stages(uuid);
drop function if exists public.client_portal_list_renders(uuid);
drop function if exists public.client_portal_list_projects();
drop function if exists public.studio_accept_client_invitation(text);
drop function if exists public.studio_revoke_client_project_access(uuid,uuid);
drop function if exists public.studio_grant_client_project_access(uuid,uuid);
drop policy if exists studio_client_invitations_owner_select on public.studio_client_invitations;
drop policy if exists studio_client_project_access_select on public.studio_client_project_access;
drop function if exists public.studio_client_can_access_project(uuid,uuid);
drop function if exists public.studio_is_non_client_member(uuid);
drop table if exists public.studio_client_invitations;
drop table if exists public.studio_client_project_access;

notify pgrst,'reload schema';
commit;
