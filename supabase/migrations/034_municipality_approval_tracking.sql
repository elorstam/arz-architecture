begin;

alter table public.studio_project_stages
  add column if not exists municipality_status text not null default 'waiting',
  add column if not exists municipality_approved_at timestamptz,
  add column if not exists municipality_approved_by uuid references auth.users(id);
do $$ begin
  if not exists(select 1 from pg_constraint where conrelid='public.studio_project_stages'::regclass and conname='studio_project_stages_municipality_status_check') then
    alter table public.studio_project_stages add constraint studio_project_stages_municipality_status_check check(municipality_status in('waiting','reviewing','approved','revision_requested','rejected'));
  end if;
end $$;

create table if not exists public.studio_project_stage_municipality_audits(
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id), project_id uuid not null references public.studio_projects(id), stage_id uuid not null references public.studio_project_stages(id), previous_status text, new_status text not null, changed_by uuid not null references auth.users(id), changed_at timestamptz not null default now()
);
create index if not exists studio_stage_municipality_audit_idx on public.studio_project_stage_municipality_audits(organization_id,project_id,stage_id,changed_at desc);
alter table public.studio_project_stage_municipality_audits enable row level security;
drop policy if exists studio_stage_municipality_audits_select on public.studio_project_stage_municipality_audits;
create policy studio_stage_municipality_audits_select on public.studio_project_stage_municipality_audits for select to authenticated using(public.studio_is_organization_member(organization_id));
grant select on public.studio_project_stage_municipality_audits to authenticated;
revoke insert,update,delete on public.studio_project_stage_municipality_audits from anon,authenticated;

create or replace function public.studio_update_stage_municipality_status(target_stage uuid,target_status text)
returns void language plpgsql security definer set search_path=public as $$
declare s record; label text;
begin
 if target_status not in('waiting','reviewing','approved','revision_requested','rejected') then raise exception 'invalid_municipality_status' using errcode='22023'; end if;
 select * into s from public.studio_project_stages where id=target_stage for update;
 if s is null or not public.studio_has_organization_role(s.organization_id,array['owner']) then raise exception 'stage_forbidden' using errcode='42501'; end if;
 update public.studio_project_stages set municipality_status=target_status,municipality_approved_at=case when target_status='approved' then now() else null end,municipality_approved_by=case when target_status='approved' then auth.uid() else null end,updated_by=auth.uid() where id=s.id;
 insert into public.studio_project_stage_municipality_audits(organization_id,project_id,stage_id,previous_status,new_status,changed_by) values(s.organization_id,s.project_id,s.id,s.municipality_status,target_status,auth.uid());
 label:=case target_status when 'approved' then 'ONAYLANDI' when 'revision_requested' then 'REVİZE İSTENDİ' when 'reviewing' then 'İNCELENİYOR' when 'rejected' then 'REDDEDİLDİ' else 'BEKLENİYOR' end;
 insert into public.studio_project_stage_events(organization_id,project_id,stage_id,event_type,title,created_by) values(s.organization_id,s.project_id,s.id,'municipality_status_changed',s.title||' belediye sonucu: '||label,auth.uid());
 insert into public.studio_notifications(organization_id,project_id,source_type,source_id,channel,status,template_name,template_version,variables_snapshot,recipient_snapshot,created_by) values(s.organization_id,s.project_id,'project_stage',s.id,'client_portal','draft','municipality_result_changed',1,jsonb_build_object('stage_name',s.title,'municipality_status',target_status), '{}'::jsonb,auth.uid());
end $$;
revoke execute on function public.studio_update_stage_municipality_status(uuid,text) from public,anon;
grant execute on function public.studio_update_stage_municipality_status(uuid,text) to authenticated;
notify pgrst,'reload schema';
commit;
