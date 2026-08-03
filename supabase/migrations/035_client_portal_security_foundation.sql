begin;

create table if not exists public.studio_client_project_access(
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references public.organizations(id) on delete cascade,
 project_id uuid not null references public.studio_projects(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade,
 granted_by uuid not null references public.profiles(id) on delete restrict,
 granted_at timestamptz not null default now(),
 revoked_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create unique index if not exists studio_client_project_access_active_uq on public.studio_client_project_access(user_id,project_id) where revoked_at is null;
create index if not exists studio_client_project_access_org_user_idx on public.studio_client_project_access(organization_id,user_id,project_id) where revoked_at is null;
drop trigger if exists studio_client_project_access_set_updated_at on public.studio_client_project_access;
create trigger studio_client_project_access_set_updated_at before update on public.studio_client_project_access for each row execute function public.studio_set_updated_at();

create table if not exists public.studio_client_invitations(
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references public.organizations(id) on delete cascade,
 project_id uuid not null references public.studio_projects(id) on delete cascade,
 invited_email text not null check(char_length(btrim(invited_email)) between 3 and 320),
 invited_user_id uuid references public.profiles(id) on delete set null,
 role text not null default 'client' check(role='client'),
 token_hash text not null unique check(char_length(token_hash)=64),
 status text not null default 'pending' check(status in('pending','accepted','revoked','expired')),
 expires_at timestamptz not null,
 accepted_at timestamptz,
 invited_by uuid not null references public.profiles(id) on delete restrict,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check(expires_at>created_at)
);
create unique index if not exists studio_client_invitations_pending_uq on public.studio_client_invitations(project_id,lower(invited_email)) where status='pending';
drop trigger if exists studio_client_invitations_set_updated_at on public.studio_client_invitations;
create trigger studio_client_invitations_set_updated_at before update on public.studio_client_invitations for each row execute function public.studio_set_updated_at();

create or replace function public.studio_is_non_client_member(target_organization_id uuid)
returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.organization_members m where m.organization_id=target_organization_id and m.user_id=auth.uid() and m.status='active' and m.role in('owner','admin','team_member'))
$$;

create or replace function public.studio_client_can_access_project(p_user_id uuid,p_project_id uuid)
returns boolean language sql stable security definer set search_path=public as $$
 select exists(
  select 1 from public.studio_client_project_access a
  join public.studio_projects p on p.id=a.project_id and p.organization_id=a.organization_id
  join public.organization_members m on m.organization_id=a.organization_id and m.user_id=a.user_id
  where a.user_id=p_user_id and a.project_id=p_project_id and a.revoked_at is null and m.status='active' and m.role='client'
 )
$$;

create or replace function public.studio_grant_client_project_access(p_project_id uuid,p_user_id uuid)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_org uuid;v_id uuid;
begin
 select organization_id into v_org from public.studio_projects where id=p_project_id;
 if v_org is null or not public.studio_has_organization_role(v_org,array['owner']) then raise exception 'forbidden' using errcode='42501'; end if;
 if not exists(select 1 from public.organization_members where organization_id=v_org and user_id=p_user_id and status='active' and role='client') then raise exception 'active_client_membership_required' using errcode='23514'; end if;
 select id into v_id from public.studio_client_project_access where user_id=p_user_id and project_id=p_project_id and revoked_at is null;
 if v_id is null then
  insert into public.studio_client_project_access(organization_id,project_id,user_id,granted_by) values(v_org,p_project_id,p_user_id,auth.uid()) returning id into v_id;
  insert into public.activity_events(organization_id,actor_user_id,entity_type,entity_id,action,summary,metadata) values(v_org,auth.uid(),'client_project_access',v_id,'client_project_access_granted','Client project access granted.',jsonb_build_object('project_id',p_project_id,'user_id',p_user_id));
 end if;
 return v_id;
end $$;

create or replace function public.studio_revoke_client_project_access(p_project_id uuid,p_user_id uuid)
returns boolean language plpgsql security definer set search_path=public as $$
declare v_org uuid;v_id uuid;
begin
 select organization_id into v_org from public.studio_projects where id=p_project_id;
 if v_org is null or not public.studio_has_organization_role(v_org,array['owner']) then raise exception 'forbidden' using errcode='42501'; end if;
 update public.studio_client_project_access set revoked_at=now() where project_id=p_project_id and user_id=p_user_id and revoked_at is null returning id into v_id;
 if v_id is not null then insert into public.activity_events(organization_id,actor_user_id,entity_type,entity_id,action,summary,metadata) values(v_org,auth.uid(),'client_project_access',v_id,'client_project_access_revoked','Client project access revoked.',jsonb_build_object('project_id',p_project_id,'user_id',p_user_id)); end if;
 return v_id is not null;
end $$;

create or replace function public.studio_accept_client_invitation(p_token text)
returns uuid language plpgsql security definer set search_path=public,auth as $$
declare v_inv public.studio_client_invitations%rowtype;v_email text;v_access uuid;
begin
 if auth.uid() is null then raise exception 'authentication_required' using errcode='42501'; end if;
 select lower(email) into v_email from auth.users where id=auth.uid();
 select * into v_inv from public.studio_client_invitations where token_hash=encode(digest(p_token,'sha256'),'hex') and status='pending' and expires_at>now() for update;
 if v_inv.id is null or lower(v_inv.invited_email)<>v_email then raise exception 'invitation_invalid' using errcode='42501'; end if;
 insert into public.profiles(id,email,full_name) values(auth.uid(),v_email,'') on conflict(id) do nothing;
 if exists(select 1 from public.organization_members where organization_id=v_inv.organization_id and user_id=auth.uid() and role<>'client') then raise exception 'staff_membership_cannot_accept_client_invitation' using errcode='42501'; end if;
 insert into public.organization_members(organization_id,user_id,role,status,created_by) values(v_inv.organization_id,auth.uid(),'client','active',v_inv.invited_by)
 on conflict(organization_id,user_id) do update set status='active',updated_at=now() where organization_members.role='client';
 select id into v_access from public.studio_client_project_access where user_id=auth.uid() and project_id=v_inv.project_id and revoked_at is null;
 if v_access is null then insert into public.studio_client_project_access(organization_id,project_id,user_id,granted_by) values(v_inv.organization_id,v_inv.project_id,auth.uid(),v_inv.invited_by) returning id into v_access; end if;
 update public.studio_client_invitations set status='accepted',invited_user_id=auth.uid(),accepted_at=now() where id=v_inv.id;
 insert into public.activity_events(organization_id,actor_user_id,entity_type,entity_id,action,summary,metadata) values(v_inv.organization_id,auth.uid(),'client_invitation',v_inv.id,'client_invitation_accepted','Client invitation accepted.',jsonb_build_object('project_id',v_inv.project_id));
 return v_access;
end $$;

alter table public.studio_client_project_access enable row level security;
alter table public.studio_client_invitations enable row level security;
create policy studio_client_project_access_select on public.studio_client_project_access for select to authenticated using(public.studio_is_non_client_member(organization_id) or user_id=auth.uid());
create policy studio_client_invitations_owner_select on public.studio_client_invitations for select to authenticated using(public.studio_has_organization_role(organization_id,array['owner']));

drop policy if exists studio_projects_select_member on public.studio_projects;
create policy studio_projects_select_scoped on public.studio_projects for select to authenticated using(public.studio_is_non_client_member(organization_id) or public.studio_client_can_access_project(auth.uid(),id));

drop policy if exists studio_project_renders_select on public.studio_project_renders;
create policy studio_project_renders_select_staff on public.studio_project_renders for select to authenticated using(public.studio_is_non_client_member(organization_id));
drop policy if exists studio_render_categories_select on public.studio_render_categories;
create policy studio_render_categories_select_staff on public.studio_render_categories for select to authenticated using(public.studio_is_non_client_member(organization_id));
drop policy if exists studio_render_events_select on public.studio_render_events;
create policy studio_render_events_select_staff on public.studio_render_events for select to authenticated using(public.studio_is_non_client_member(organization_id));
drop policy if exists studio_project_stages_select on public.studio_project_stages;
create policy studio_project_stages_select_staff on public.studio_project_stages for select to authenticated using(public.studio_is_non_client_member(organization_id));
drop policy if exists studio_stage_events_select on public.studio_project_stage_events;
create policy studio_stage_events_select_staff on public.studio_project_stage_events for select to authenticated using(public.studio_is_non_client_member(organization_id));
drop policy if exists studio_stage_files_select on public.studio_project_stage_files;
create policy studio_stage_files_select_staff on public.studio_project_stage_files for select to authenticated using(public.studio_is_non_client_member(organization_id));
drop policy if exists studio_notifications_select on public.studio_notifications;
create policy studio_notifications_select_staff on public.studio_notifications for select to authenticated using(public.studio_is_non_client_member(organization_id));
drop policy if exists studio_notification_events_select on public.studio_notification_events;
create policy studio_notification_events_select_staff on public.studio_notification_events for select to authenticated using(public.studio_is_non_client_member(organization_id));
drop policy if exists studio_finance_entries_select on public.studio_finance_entries;
create policy studio_finance_entries_select_staff on public.studio_finance_entries for select to authenticated using(public.studio_is_non_client_member(organization_id));
drop policy if exists studio_finance_payments_select on public.studio_finance_payments;
create policy studio_finance_payments_select_staff on public.studio_finance_payments for select to authenticated using(public.studio_is_non_client_member(organization_id));
drop policy if exists studio_finance_events_select on public.studio_finance_events;
create policy studio_finance_events_select_staff on public.studio_finance_events for select to authenticated using(public.studio_is_non_client_member(organization_id));
drop policy if exists studio_obligations_select on public.studio_project_obligations;
create policy studio_obligations_select_staff on public.studio_project_obligations for select to authenticated using(public.studio_is_non_client_member(organization_id));
drop policy if exists studio_obligation_events_select on public.studio_project_obligation_events;
create policy studio_obligation_events_select_staff on public.studio_project_obligation_events for select to authenticated using(public.studio_is_non_client_member(organization_id));
drop policy if exists studio_files_select_member on public.studio_project_files;
create policy studio_files_select_staff on public.studio_project_files for select to authenticated using(public.studio_is_non_client_member(organization_id));
drop policy if exists studio_file_versions_select_member on public.studio_project_file_versions;
create policy studio_file_versions_select_staff on public.studio_project_file_versions for select to authenticated using(public.studio_is_non_client_member(organization_id));
drop policy if exists studio_folders_select_member on public.studio_project_folders;
create policy studio_folders_select_staff on public.studio_project_folders for select to authenticated using(public.studio_is_non_client_member(organization_id));
drop policy if exists studio_files_storage_select on storage.objects;
create policy studio_files_storage_select on storage.objects for select to authenticated using(bucket_id='studio-files' and exists(select 1 from public.studio_project_files f where f.storage_bucket=bucket_id and f.storage_path=name and f.status='ready' and public.studio_is_non_client_member(f.organization_id)));

create or replace function public.client_portal_list_projects()
returns table(id uuid,code text,name text,category text,location text,stage text,status text,progress integer,current_phase text,target_date date,next_milestone text,next_milestone_date date,updated_at timestamptz)
language sql stable security definer set search_path=public as $$ select p.id,p.code,p.name,p.category,p.location,p.stage,p.status,p.progress,p.current_phase,p.target_date,p.next_milestone,p.next_milestone_date,p.updated_at from public.studio_projects p where public.studio_client_can_access_project(auth.uid(),p.id) and not p.is_archived order by p.updated_at desc $$;

create or replace function public.client_portal_list_renders(p_project_id uuid)
returns table(id uuid,project_id uuid,title text,category text,description text,logical_file_id uuid,presented_at timestamptz,created_at timestamptz)
language sql stable security definer set search_path=public as $$ select r.id,r.project_id,r.title,c.name,r.description,r.logical_file_id,r.presented_at,r.created_at from public.studio_project_renders r left join public.studio_render_categories c on c.id=r.category_id where public.studio_client_can_access_project(auth.uid(),p_project_id) and r.project_id=p_project_id and r.is_client_visible and r.archived_at is null order by r.created_at desc $$;

create or replace function public.client_portal_list_stages(p_project_id uuid)
returns table(id uuid,project_id uuid,title text,description text,sort_order integer,status text,started_at timestamptz,completed_at timestamptz,municipality_status text,updated_at timestamptz)
language sql stable security definer set search_path=public as $$ select s.id,s.project_id,s.title,s.description,s.sort_order,s.status,s.started_at,s.completed_at,s.municipality_status,s.updated_at from public.studio_project_stages s where public.studio_client_can_access_project(auth.uid(),p_project_id) and s.project_id=p_project_id and s.is_client_visible and s.is_active and not s.is_archived order by s.sort_order $$;

create or replace function public.client_portal_list_files(p_project_id uuid)
returns table(id uuid,project_id uuid,display_name text,extension text,mime_type text,file_size bigint,category text,created_at timestamptz)
language sql stable security definer set search_path=public as $$ select distinct f.id,f.project_id,f.display_name,f.extension,f.mime_type,f.file_size,f.category,f.created_at from public.studio_project_stage_files sf join public.studio_project_files f on f.id=sf.file_id and f.project_id=sf.project_id and f.organization_id=sf.organization_id where public.studio_client_can_access_project(auth.uid(),p_project_id) and sf.project_id=p_project_id and sf.is_customer_visible and sf.archived_at is null and f.status='ready' and not f.is_archived order by f.created_at desc $$;

create or replace function public.client_portal_list_notifications(p_project_id uuid)
returns table(id uuid,project_id uuid,source_type text,source_id uuid,status text,template_name text,sent_at timestamptz,delivered_at timestamptz,read_at timestamptz,created_at timestamptz)
language sql stable security definer set search_path=public as $$ select n.id,n.project_id,n.source_type,n.source_id,n.status,n.template_name,n.sent_at,n.delivered_at,n.read_at,n.created_at from public.studio_notifications n where public.studio_client_can_access_project(auth.uid(),p_project_id) and n.project_id=p_project_id and n.channel='client_portal' order by n.created_at desc $$;

create or replace function public.client_portal_list_finance(p_project_id uuid)
returns table(id uuid,project_id uuid,entry_type text,title text,description text,amount numeric,currency text,due_date date,status text,document_file_id uuid,created_at timestamptz)
language sql stable security definer set search_path=public as $$ select e.id,e.project_id,e.entry_type,e.title,e.description,e.amount,e.currency,e.due_date,e.status,e.document_file_id,e.created_at from public.studio_finance_entries e where public.studio_client_can_access_project(auth.uid(),p_project_id) and e.project_id=p_project_id and e.is_client_visible and not e.is_archived and e.entry_type in('income','progress_payment','invoice') order by e.entry_date desc $$;

create or replace function public.client_portal_list_official_processes(p_project_id uuid)
returns table(id uuid,project_id uuid,entity_type text,title text,status text,amount numeric,due_date date,responsible_party text,updated_at timestamptz)
language sql stable security definer set search_path=public as $$ select o.id,o.project_id,o.entity_type,o.title,o.status,o.amount,o.due_date,o.responsible_party,o.updated_at from public.studio_project_obligations o where public.studio_client_can_access_project(auth.uid(),p_project_id) and o.project_id=p_project_id and o.is_client_visible and not o.is_archived order by o.updated_at desc $$;

revoke all on public.studio_client_project_access,public.studio_client_invitations from anon,authenticated;
grant select on public.studio_client_project_access to authenticated;
revoke all on function public.studio_is_non_client_member(uuid),public.studio_client_can_access_project(uuid,uuid),public.studio_grant_client_project_access(uuid,uuid),public.studio_revoke_client_project_access(uuid,uuid),public.studio_accept_client_invitation(text) from public,anon;
grant execute on function public.studio_is_non_client_member(uuid),public.studio_client_can_access_project(uuid,uuid),public.studio_grant_client_project_access(uuid,uuid),public.studio_revoke_client_project_access(uuid,uuid),public.studio_accept_client_invitation(text) to authenticated;
grant execute on function public.client_portal_list_projects(),public.client_portal_list_renders(uuid),public.client_portal_list_stages(uuid),public.client_portal_list_files(uuid),public.client_portal_list_notifications(uuid),public.client_portal_list_finance(uuid),public.client_portal_list_official_processes(uuid) to authenticated;

notify pgrst,'reload schema';
commit;
