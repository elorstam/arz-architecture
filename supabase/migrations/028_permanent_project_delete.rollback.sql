begin;
revoke all on function public.studio_issue_project_deletion_confirmation(uuid,text) from public;
revoke all on function public.studio_permanently_delete_project(uuid,uuid,text) from public;
drop function if exists public.studio_issue_project_deletion_confirmation(uuid,text);
drop function if exists public.studio_permanently_delete_project(uuid,uuid,text);
drop table if exists public.studio_project_deletion_confirmations;
drop table if exists public.studio_project_deletion_audits;
commit;
