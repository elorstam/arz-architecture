begin;

create table if not exists public.studio_project_stage_audits(
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  project_id uuid not null references public.studio_projects(id),
  stage_id uuid,
  stage_title text not null,
  action text not null check(action in ('archived','restored','deleted')),
  actor_user_id uuid not null references auth.users(id),
  reason text,
  created_at timestamptz not null default now()
);
create index if not exists studio_project_stage_audits_scope_idx on public.studio_project_stage_audits(organization_id,project_id,created_at desc);
alter table public.studio_project_stage_audits enable row level security;
drop policy if exists studio_project_stage_audits_owner_select on public.studio_project_stage_audits;
create policy studio_project_stage_audits_owner_select on public.studio_project_stage_audits for select to authenticated using(public.studio_has_organization_role(organization_id,array['owner']));
grant select on public.studio_project_stage_audits to authenticated;
revoke insert,update,delete on public.studio_project_stage_audits from anon,authenticated;

create or replace function public.studio_archive_custom_project_stage(target_stage uuid, restore_stage boolean default false)
returns void language plpgsql security definer set search_path=public as $$
declare s record; next_order integer;
begin
  select * into s from public.studio_project_stages where id=target_stage for update;
  if s is null or not public.studio_has_organization_role(s.organization_id,array['owner']) then raise exception 'stage_forbidden' using errcode='42501'; end if;
  if s.is_system then raise exception 'system_stage_immutable' using errcode='42501'; end if;
  if restore_stage then
    select coalesce(max(sort_order),0)+1 into next_order from public.studio_project_stages where project_id=s.project_id and not is_archived;
    update public.studio_project_stages set is_archived=false,archived_at=null,archived_by=null,is_active=true,sort_order=next_order,updated_by=auth.uid() where id=s.id;
    insert into public.studio_project_stage_audits(organization_id,project_id,stage_id,stage_title,action,actor_user_id) values(s.organization_id,s.project_id,s.id,s.title,'restored',auth.uid());
  else
    if s.is_archived then return; end if;
    update public.studio_project_stages set is_archived=true,archived_at=now(),archived_by=auth.uid(),is_active=false,updated_by=auth.uid() where id=s.id;
    insert into public.studio_project_stage_audits(organization_id,project_id,stage_id,stage_title,action,actor_user_id) values(s.organization_id,s.project_id,s.id,s.title,'archived',auth.uid());
  end if;
end $$;

create or replace function public.studio_delete_custom_project_stage(target_stage uuid,target_title text)
returns void language plpgsql security definer set search_path=public as $$
declare s record;
begin
  select * into s from public.studio_project_stages where id=target_stage for update;
  if s is null or not public.studio_has_organization_role(s.organization_id,array['owner']) then raise exception 'stage_forbidden' using errcode='42501'; end if;
  if s.is_system then raise exception 'system_stage_delete_forbidden' using errcode='42501'; end if;
  if btrim(target_title) is distinct from btrim(s.title) then raise exception 'stage_title_confirmation_failed' using errcode='22023'; end if;
  insert into public.studio_project_stage_audits(organization_id,project_id,stage_id,stage_title,action,actor_user_id) values(s.organization_id,s.project_id,s.id,s.title,'deleted',auth.uid());
  delete from public.studio_notification_attachments where stage_file_id in(select id from public.studio_project_stage_files where stage_id=s.id);
  delete from public.studio_notifications where organization_id=s.organization_id and source_type='project_stage' and source_id=s.id;
  delete from public.studio_project_stage_events where organization_id=s.organization_id and stage_id=s.id;
  delete from public.studio_project_stage_files where organization_id=s.organization_id and stage_id=s.id;
  delete from public.studio_project_stages where id=s.id and organization_id=s.organization_id and not is_system;
end $$;

revoke execute on function public.studio_archive_custom_project_stage(uuid,boolean) from public,anon;
revoke execute on function public.studio_delete_custom_project_stage(uuid,text) from public,anon;
grant execute on function public.studio_archive_custom_project_stage(uuid,boolean) to authenticated;
grant execute on function public.studio_delete_custom_project_stage(uuid,text) to authenticated;
notify pgrst,'reload schema';
commit;
