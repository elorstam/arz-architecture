begin;

create table if not exists public.studio_project_deletion_audits(
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references public.organizations(id),
 project_id uuid not null,
 project_name text not null,
 deleted_by uuid not null references auth.users(id),
 reason text check(reason is null or reason in('Test projesi','Yanlış oluşturuldu','Mükerrer','Müşteri iptal etti','Diğer')),
 deleted_at timestamptz not null default now(),
 metadata jsonb not null default '{}'::jsonb,
 check(jsonb_typeof(metadata)='object')
);
create index if not exists studio_project_deletion_audits_org_idx on public.studio_project_deletion_audits(organization_id,deleted_at desc);
alter table public.studio_project_deletion_audits enable row level security;
drop policy if exists studio_project_deletion_audits_owner_select on public.studio_project_deletion_audits;
create policy studio_project_deletion_audits_owner_select on public.studio_project_deletion_audits for select to authenticated using(public.studio_has_organization_role(organization_id,array['owner']));
grant select on public.studio_project_deletion_audits to authenticated;
revoke insert,update,delete on public.studio_project_deletion_audits from anon,authenticated;

create table if not exists public.studio_project_deletion_confirmations(
 id uuid primary key default gen_random_uuid(), token_hash text not null unique,
 organization_id uuid not null references public.organizations(id) on delete cascade,
 project_id uuid not null references public.studio_projects(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 expires_at timestamptz not null,
 used_at timestamptz,
 created_at timestamptz not null default now()
);
create index if not exists studio_project_deletion_confirmations_lookup_idx on public.studio_project_deletion_confirmations(project_id,user_id,expires_at) where used_at is null;
alter table public.studio_project_deletion_confirmations enable row level security;
revoke all on public.studio_project_deletion_confirmations from anon,authenticated;

create or replace function public.studio_issue_project_deletion_confirmation(target_project uuid,target_name text)
returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare org_id uuid; token uuid:=gen_random_uuid(); p record;
begin
 select * into p from public.studio_projects sp where sp.id=target_project for update;
 org_id:=p.organization_id;
 if org_id is null then raise exception 'project_not_found' using errcode='P0002'; end if;
 if lower(btrim(p.name))<>lower(btrim(target_name)) then raise exception 'project_name_confirmation_mismatch' using errcode='22023'; end if;
 if not public.studio_has_organization_role(org_id,array['owner']) then raise exception 'project_delete_forbidden' using errcode='42501'; end if;
 insert into public.studio_project_deletion_confirmations(token_hash,organization_id,project_id,user_id,expires_at)
 values(encode(digest(token::text,'sha256'),'hex'),org_id,target_project,auth.uid(),now()+interval '10 minutes');
 return token;
end $$;

create or replace function public.studio_permanently_delete_project(target_project uuid,target_token uuid,target_reason text default null)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare c record; p record;
begin
 select * into p from public.studio_projects where id=target_project for update;
 if p is null then raise exception 'project_not_found' using errcode='P0002'; end if;
 if not public.studio_has_organization_role(p.organization_id,array['owner']) then raise exception 'project_delete_forbidden' using errcode='42501'; end if;
 select * into c from public.studio_project_deletion_confirmations where token_hash=encode(digest(target_token::text,'sha256'),'hex') and project_id=target_project and user_id=auth.uid() for update;
 if c is null or c.used_at is not null or c.expires_at<now() then raise exception 'project_delete_confirmation_invalid' using errcode='42501'; end if;
 insert into public.studio_project_deletion_audits(organization_id,project_id,project_name,deleted_by,reason,metadata)
 values(p.organization_id,p.id,p.name,auth.uid(),nullif(target_reason,''),'{}'::jsonb);

 delete from public.activity_events where organization_id=p.organization_id and entity_id=p.id;
 delete from public.studio_user_favorites where organization_id=p.organization_id and entity_type='project' and entity_id=p.id;
 delete from public.studio_user_recent_items where organization_id=p.organization_id and entity_type='project' and entity_id=p.id;
 delete from public.studio_tag_assignments where organization_id=p.organization_id and entity_type='project' and entity_id=p.id;
 delete from public.studio_notification_attachments where organization_id=p.organization_id and (file_id in(select id from public.studio_project_files where project_id=p.id) or notification_id in(select id from public.studio_notifications where project_id=p.id));
 delete from public.studio_project_stage_files where project_id=p.id;
 delete from public.studio_project_stage_events where project_id=p.id;
 delete from public.studio_render_events where project_id=p.id;
 delete from public.studio_project_renders where project_id=p.id;
 delete from public.studio_render_categories where project_id=p.id;
 delete from public.studio_project_obligation_events where project_id=p.id;
 delete from public.studio_project_obligation_notifications where project_id=p.id;
 delete from public.studio_project_obligations where project_id=p.id;
 delete from public.studio_notification_events where notification_id in(select id from public.studio_notifications where project_id=p.id);
 delete from public.studio_notifications where project_id=p.id;
 delete from public.studio_finance_events where project_id=p.id;
 delete from public.studio_finance_payments where income_id in(select id from public.studio_finance_entries where project_id=p.id);
 delete from public.studio_finance_entries where project_id=p.id;
 delete from public.studio_project_finance_profiles where project_id=p.id;
 delete from public.studio_visualization_revisions where project_id=p.id;
 delete from public.studio_visualization_time_entries where project_id=p.id;
 delete from public.studio_ai_usage_events where organization_id=p.organization_id and (metadata->>'project_id')=p.id::text;
 delete from public.studio_file_thumbnails where logical_file_id in(select id from public.studio_project_files where project_id=p.id) or file_version_id in(select id from public.studio_project_file_versions where project_id=p.id);
 update public.studio_project_folders set parent_folder_id=null where project_id=p.id;
 update public.studio_quotes set converted_project_id=null,status='Draft' where converted_project_id=p.id;
 update public.studio_project_files set folder_id=null where project_id=p.id;
 update public.studio_project_file_versions set source_version_id=null where project_id=p.id;
 delete from public.studio_project_file_versions where project_id=p.id;
 delete from public.studio_project_files where project_id=p.id;
 delete from public.studio_project_folders where project_id=p.id;
 update public.studio_project_deletion_confirmations set used_at=now() where id=c.id;
 delete from public.studio_projects where id=p.id;
end $$;

revoke all on function public.studio_issue_project_deletion_confirmation(uuid,text) from public;
revoke all on function public.studio_permanently_delete_project(uuid,uuid,text) from public;
grant execute on function public.studio_issue_project_deletion_confirmation(uuid,text) to authenticated;
grant execute on function public.studio_permanently_delete_project(uuid,uuid,text) to authenticated;
commit;
