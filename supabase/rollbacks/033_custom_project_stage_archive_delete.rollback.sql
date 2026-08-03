begin;
revoke execute on function public.studio_archive_custom_project_stage(uuid,boolean) from authenticated;
revoke execute on function public.studio_delete_custom_project_stage(uuid,text) from authenticated;
drop function if exists public.studio_archive_custom_project_stage(uuid,boolean);
drop function if exists public.studio_delete_custom_project_stage(uuid,text);
drop policy if exists studio_project_stage_audits_owner_select on public.studio_project_stage_audits;
drop table if exists public.studio_project_stage_audits;
notify pgrst,'reload schema';
commit;
