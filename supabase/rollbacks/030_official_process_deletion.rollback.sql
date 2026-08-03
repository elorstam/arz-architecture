begin;
revoke all on function public.studio_issue_obligation_deletion_confirmation(uuid,text) from public;
revoke all on function public.studio_permanently_delete_obligation(uuid,uuid,text) from public;
drop function if exists public.studio_issue_obligation_deletion_confirmation(uuid,text);
drop function if exists public.studio_permanently_delete_obligation(uuid,uuid,text);
drop table if exists public.studio_obligation_deletion_confirmations;
drop policy if exists studio_obligation_deletion_audits_owner_select on public.studio_obligation_deletion_audits;
drop table if exists public.studio_obligation_deletion_audits;
commit;
