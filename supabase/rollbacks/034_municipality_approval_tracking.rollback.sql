begin;
revoke execute on function public.studio_update_stage_municipality_status(uuid,text) from authenticated;
drop function if exists public.studio_update_stage_municipality_status(uuid,text);
drop policy if exists studio_stage_municipality_audits_select on public.studio_project_stage_municipality_audits;
drop table if exists public.studio_project_stage_municipality_audits;
alter table public.studio_project_stages drop constraint if exists studio_project_stages_municipality_status_check;
alter table public.studio_project_stages drop column if exists municipality_approved_by,drop column if exists municipality_approved_at,drop column if exists municipality_status;
notify pgrst,'reload schema';
commit;
