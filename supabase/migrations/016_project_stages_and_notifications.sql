begin;

alter table public.studio_leads add column if not exists whatsapp_opt_in boolean not null default false;
alter table public.studio_leads add column if not exists whatsapp_phone text;
alter table public.studio_leads add column if not exists email_notification_opt_in boolean not null default false;
alter table public.studio_leads add column if not exists portal_notification_opt_in boolean not null default false;
alter table public.studio_leads add column if not exists preferred_communication_channel text check(preferred_communication_channel is null or preferred_communication_channel in('whatsapp','email','client_portal'));
alter table public.studio_leads add column if not exists communication_consent_at timestamptz;
alter table public.studio_leads add column if not exists communication_consent_source text check(communication_consent_source is null or length(communication_consent_source)<=120);

create table if not exists public.studio_project_stages(
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id), project_id uuid not null references public.studio_projects(id),
 title text not null check(length(title) between 2 and 180), description text check(description is null or length(description)<=2000), sort_order integer not null check(sort_order between 1 and 10000),
 status text not null default 'waiting' check(status in('waiting','in_progress','completed','cancelled')), started_at timestamptz, completed_at timestamptz,
 responsible_user_id uuid references auth.users(id), is_client_visible boolean not null default false, client_notified_at timestamptz,
 related_file_ids uuid[] not null default '{}', note text check(note is null or length(note)<=4000), is_active boolean not null default true, is_system boolean not null default false,
 created_by uuid not null references auth.users(id), updated_by uuid not null references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(project_id,sort_order), check((status='completed' and completed_at is not null) or status<>'completed')
);
create unique index if not exists studio_project_stage_system_title_uq on public.studio_project_stages(project_id,title) where is_system;
create index if not exists studio_project_stages_org_project_idx on public.studio_project_stages(organization_id,project_id,sort_order);

create table if not exists public.studio_notification_templates(
 id uuid primary key default gen_random_uuid(), organization_id uuid references public.organizations(id), name text not null, version integer not null default 1 check(version>0), channel text not null check(channel in('whatsapp','email','client_portal')),
 body text not null check(length(body) between 1 and 4000), variables text[] not null default '{}', is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(organization_id,name,version,channel)
);
create table if not exists public.studio_notifications(
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id), project_id uuid not null references public.studio_projects(id), crm_lead_id uuid references public.studio_leads(id),
 source_type text not null check(source_type in('project_stage','official_process','fee','document_ready','payment_reminder','custom')), source_id uuid,
 channel text not null check(channel in('whatsapp','email','client_portal')), status text not null default 'draft' check(status in('draft','queued','sent','delivered','read','failed','cancelled')),
 template_name text not null, template_version integer not null default 1, variables_snapshot jsonb not null default '{}'::jsonb, recipient_snapshot jsonb not null default '{}'::jsonb,
 provider_message_id text, sent_at timestamptz, delivered_at timestamptz, read_at timestamptz, failed_at timestamptz, safe_error_code text,
 created_by uuid not null references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index if not exists studio_notifications_provider_message_uq on public.studio_notifications(provider_message_id) where provider_message_id is not null;
create index if not exists studio_notifications_org_project_idx on public.studio_notifications(organization_id,project_id,created_at desc);
create index if not exists studio_notifications_source_idx on public.studio_notifications(source_type,source_id);

create table if not exists public.studio_notification_events(
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id), notification_id uuid not null references public.studio_notifications(id),
 provider_event_id text not null, status text not null check(status in('sent','delivered','read','failed')), occurred_at timestamptz not null, safe_error_code text, created_at timestamptz not null default now(), unique(provider_event_id,status)
);
create table if not exists public.studio_notification_automations(
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id), event_type text not null check(event_type in('stage_completed','assessment_uploaded','due_7_days','due_3_days','due_1_day','payment_overdue','document_ready')),
 channel text not null check(channel in('whatsapp','email','client_portal')), template_name text not null, is_enabled boolean not null default false, created_by uuid not null references auth.users(id), updated_by uuid not null references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(organization_id,event_type,channel)
);

create or replace function public.studio_initialize_project_stages(target_project uuid,target_user uuid) returns void language plpgsql security invoker set search_path=public as $$
declare target_org uuid; titles text[]:=array['Avan Proje Hazırlandı','Avan Proje Müşteri Onayı','Mimari Proje Hazırlandı','Mimari Proje Onaylandı','Statik Proje Onaylandı','Mekanik Proje Onaylandı','Elektrik Projesi Onaylandı','Zemin Etüdü Tamamlandı','İSKİ Onayı Alındı','İtfaiye Onayı Alındı','Belediye Proje Onayı Alındı','Yapı Ruhsatı Alındı','Aplikasyon Tamamlandı','Temiz Aplikasyon Alındı','Proje Tamamlandı']; label text; n integer:=0;
begin select organization_id into target_org from public.studio_projects where id=target_project; if target_org is null or not public.studio_has_organization_role(target_org,array['owner']) then raise exception 'project_stage_forbidden' using errcode='42501'; end if;
 foreach label in array titles loop n:=n+1; insert into public.studio_project_stages(organization_id,project_id,title,sort_order,is_system,created_by,updated_by) values(target_org,target_project,label,n,true,target_user,target_user) on conflict do nothing; end loop;
end $$;

create or replace function public.studio_validate_stage_scope() returns trigger language plpgsql set search_path=public as $$ declare project_org uuid; begin select organization_id into project_org from public.studio_projects where id=new.project_id; if project_org is null or project_org<>new.organization_id then raise exception 'stage_scope_mismatch' using errcode='23514'; end if; new.updated_at=now(); return new; end $$;
drop trigger if exists studio_validate_stage_scope_trigger on public.studio_project_stages;
create trigger studio_validate_stage_scope_trigger before insert or update on public.studio_project_stages for each row execute function public.studio_validate_stage_scope();

alter table public.studio_project_stages enable row level security; alter table public.studio_notification_templates enable row level security; alter table public.studio_notifications enable row level security; alter table public.studio_notification_events enable row level security; alter table public.studio_notification_automations enable row level security;
create policy studio_project_stages_select on public.studio_project_stages for select to authenticated using(public.studio_is_organization_member(organization_id));
create policy studio_project_stages_owner_insert on public.studio_project_stages for insert to authenticated with check(created_by=auth.uid() and updated_by=auth.uid() and public.studio_has_organization_role(organization_id,array['owner']));
create policy studio_project_stages_owner_update on public.studio_project_stages for update to authenticated using(public.studio_has_organization_role(organization_id,array['owner'])) with check(updated_by=auth.uid() and public.studio_has_organization_role(organization_id,array['owner']));
create policy studio_notification_templates_select on public.studio_notification_templates for select to authenticated using(organization_id is null or public.studio_is_organization_member(organization_id));
create policy studio_notifications_select on public.studio_notifications for select to authenticated using(public.studio_is_organization_member(organization_id));
create policy studio_notifications_owner_insert on public.studio_notifications for insert to authenticated with check(created_by=auth.uid() and public.studio_has_organization_role(organization_id,array['owner']));
create policy studio_notifications_owner_update on public.studio_notifications for update to authenticated using(public.studio_has_organization_role(organization_id,array['owner'])) with check(public.studio_has_organization_role(organization_id,array['owner']));
create policy studio_notification_events_select on public.studio_notification_events for select to authenticated using(public.studio_is_organization_member(organization_id));
create policy studio_notification_automations_select on public.studio_notification_automations for select to authenticated using(public.studio_is_organization_member(organization_id));
create policy studio_notification_automations_owner_insert on public.studio_notification_automations for insert to authenticated with check(created_by=auth.uid() and updated_by=auth.uid() and public.studio_has_organization_role(organization_id,array['owner']));
create policy studio_notification_automations_owner_update on public.studio_notification_automations for update to authenticated using(public.studio_has_organization_role(organization_id,array['owner'])) with check(updated_by=auth.uid() and public.studio_has_organization_role(organization_id,array['owner']));
grant select,insert,update on public.studio_project_stages,public.studio_notifications,public.studio_notification_automations to authenticated; grant select on public.studio_notification_templates,public.studio_notification_events to authenticated;
revoke delete on public.studio_project_stages,public.studio_notification_templates,public.studio_notifications,public.studio_notification_events,public.studio_notification_automations from anon,authenticated;
grant execute on function public.studio_initialize_project_stages(uuid,uuid) to authenticated;
notify pgrst,'reload schema';
commit;
