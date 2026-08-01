begin;

create table if not exists public.studio_project_obligations(
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references public.organizations(id),
 project_id uuid not null references public.studio_projects(id),
 entity_type text not null check(entity_type in('fee','application','clean_application')),
 fee_type text check(fee_type is null or fee_type in('microzoning','zoning_status','building_line_level_section','project','soil_survey','parking','custom')),
 title text not null check(char_length(btrim(title)) between 1 and 160),
 status text not null default 'waiting' check(status in('waiting','assessment_uploaded','client_notified','payment_waiting','receipt_uploaded','paid','document_received','cancelled')),
 amount numeric(14,2) check(amount is null or amount>=0), due_date date,
 responsible_party text not null default 'arz_architecture' check(responsible_party in('arz_architecture','client','municipality','survey_engineer','soil_company','other')),
 description text check(description is null or char_length(description)<=3000),
 is_client_visible boolean not null default false, client_notified_at timestamptz,
 assessment_file_id uuid references public.studio_project_files(id),
 receipt_file_id uuid references public.studio_project_files(id),
 received_document_file_id uuid references public.studio_project_files(id),
 is_archived boolean not null default false,
 created_by uuid not null references auth.users(id), updated_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check((entity_type='fee' and fee_type is not null) or (entity_type<>'fee' and fee_type is null)),
 check(status<>'document_received' or received_document_file_id is not null)
);
create unique index if not exists studio_obligations_default_unique on public.studio_project_obligations(project_id,entity_type,coalesce(fee_type,'none')) where is_archived=false and (fee_type<>'custom' or fee_type is null);
create index if not exists studio_obligations_org_project_idx on public.studio_project_obligations(organization_id,project_id,is_archived);
create index if not exists studio_obligations_due_idx on public.studio_project_obligations(organization_id,due_date) where is_archived=false;
create index if not exists studio_obligations_status_idx on public.studio_project_obligations(organization_id,status);

create table if not exists public.studio_project_obligation_events(
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id), project_id uuid not null references public.studio_projects(id), obligation_id uuid not null references public.studio_project_obligations(id), event_type text not null check(event_type in('created','assessment_uploaded','client_notified','receipt_uploaded','paid','document_received','status_changed','document_updated')), title text not null, metadata jsonb not null default '{}'::jsonb, created_by uuid not null references auth.users(id), created_at timestamptz not null default now()
);
create index if not exists studio_obligation_events_timeline_idx on public.studio_project_obligation_events(obligation_id,created_at desc);

create table if not exists public.studio_project_obligation_notifications(
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id), project_id uuid not null references public.studio_projects(id), obligation_id uuid not null references public.studio_project_obligations(id), channel text not null default 'record_only' check(channel='record_only'), template_key text not null default 'assessment_ready', message_snapshot text not null check(char_length(message_snapshot)<=4000), created_by uuid not null references auth.users(id), created_at timestamptz not null default now()
);
create index if not exists studio_obligation_notifications_idx on public.studio_project_obligation_notifications(obligation_id,created_at desc);

create or replace function public.studio_validate_obligation_child() returns trigger language plpgsql set search_path=public as $$ begin
 if not exists(select 1 from public.studio_project_obligations o where o.id=new.obligation_id and o.organization_id=new.organization_id and o.project_id=new.project_id) then raise exception 'Obligation audit scope mismatch' using errcode='23514'; end if;
 return new;
end $$;
drop trigger if exists studio_validate_obligation_event on public.studio_project_obligation_events;
create trigger studio_validate_obligation_event before insert or update on public.studio_project_obligation_events for each row execute function public.studio_validate_obligation_child();
drop trigger if exists studio_validate_obligation_notification on public.studio_project_obligation_notifications;
create trigger studio_validate_obligation_notification before insert or update on public.studio_project_obligation_notifications for each row execute function public.studio_validate_obligation_child();

create or replace function public.studio_validate_obligation() returns trigger language plpgsql set search_path=public as $$
declare linked uuid; begin
 if not exists(select 1 from public.studio_projects p where p.id=new.project_id and p.organization_id=new.organization_id) then raise exception 'Obligation project mismatch' using errcode='23514'; end if;
 foreach linked in array array[new.assessment_file_id,new.receipt_file_id,new.received_document_file_id] loop
  if linked is not null and not exists(select 1 from public.studio_project_files f where f.id=linked and f.project_id=new.project_id and f.organization_id=new.organization_id and f.status='ready') then raise exception 'Obligation document mismatch' using errcode='23514'; end if;
 end loop;
 if tg_op='UPDATE' and (new.organization_id<>old.organization_id or new.project_id<>old.project_id or new.entity_type<>old.entity_type or new.fee_type is distinct from old.fee_type or new.created_by<>old.created_by or new.created_at<>old.created_at) then raise exception 'Protected obligation fields cannot change' using errcode='42501'; end if;
 new.title:=btrim(new.title); new.updated_at:=now(); return new;
end $$;
drop trigger if exists studio_validate_obligation on public.studio_project_obligations;
create trigger studio_validate_obligation before insert or update on public.studio_project_obligations for each row execute function public.studio_validate_obligation();

create or replace function public.studio_initialize_project_obligations(target_project_id uuid,target_user_id uuid default auth.uid()) returns void language plpgsql security invoker set search_path=public as $$
declare org_id uuid; begin
 select organization_id into org_id from public.studio_projects where id=target_project_id;
 if org_id is null or target_user_id is null then raise exception 'Project or creator unavailable'; end if;
 insert into public.studio_project_obligations(organization_id,project_id,entity_type,fee_type,title,created_by,updated_by)
 select org_id,target_project_id,v.entity_type,v.fee_type,v.title,target_user_id,target_user_id from(values
 ('fee','microzoning','Mikrobölgeleme Harcı'),('fee','zoning_status','İmar Durum Harcı'),('fee','building_line_level_section','İnşaat İstikamet ve Kot Kesit Harcı'),('fee','project','Proje Harcı'),('fee','soil_survey','Zemin Etüd Harcı'),('fee','parking','Otopark Harcı'),('application',null,'Aplikasyon'),('clean_application',null,'Temiz Aplikasyon'))v(entity_type,fee_type,title)
 on conflict do nothing;
end $$;
create or replace function public.studio_initialize_project_obligations_trigger() returns trigger language plpgsql security definer set search_path=public as $$ begin perform public.studio_initialize_project_obligations(new.id,auth.uid()); return new; end $$;
drop trigger if exists studio_initialize_project_obligations_after_insert on public.studio_projects;
create trigger studio_initialize_project_obligations_after_insert after insert on public.studio_projects for each row execute function public.studio_initialize_project_obligations_trigger();

insert into public.studio_project_obligations(organization_id,project_id,entity_type,fee_type,title,created_by,updated_by)
select p.organization_id,p.id,v.entity_type,v.fee_type,v.title,coalesce(p.created_by,m.user_id),coalesce(p.created_by,m.user_id)
from public.studio_projects p
cross join(values ('fee','microzoning','Mikrobölgeleme Harcı'),('fee','zoning_status','İmar Durum Harcı'),('fee','building_line_level_section','İnşaat İstikamet ve Kot Kesit Harcı'),('fee','project','Proje Harcı'),('fee','soil_survey','Zemin Etüd Harcı'),('fee','parking','Otopark Harcı'),('application',null,'Aplikasyon'),('clean_application',null,'Temiz Aplikasyon'))v(entity_type,fee_type,title)
left join lateral(select user_id from public.organization_members where organization_id=p.organization_id and status='active' and role='owner' limit 1)m on true
where coalesce(p.created_by,m.user_id) is not null on conflict do nothing;

create or replace function public.studio_obligation_audit() returns trigger language plpgsql security definer set search_path=public as $$
declare kind text; label text; begin
 if tg_op='INSERT' then kind:='created';label:='Oluşturuldu';
 elsif new.status is distinct from old.status then kind:=case new.status when 'assessment_uploaded' then 'assessment_uploaded' when 'client_notified' then 'client_notified' when 'receipt_uploaded' then 'receipt_uploaded' when 'paid' then 'paid' when 'document_received' then 'document_received' else 'status_changed' end; label:=case new.status when 'assessment_uploaded' then 'Tahakkuk yüklendi' when 'client_notified' then 'Müşteriye bildirildi' when 'receipt_uploaded' then 'Dekont yüklendi' when 'paid' then 'Ödendi' when 'document_received' then 'Evrak alındı' else 'Durum değiştirildi' end;
 elsif new.assessment_file_id is distinct from old.assessment_file_id or new.receipt_file_id is distinct from old.receipt_file_id or new.received_document_file_id is distinct from old.received_document_file_id then kind:='document_updated';label:='Belge güncellendi'; else return new; end if;
 insert into public.studio_project_obligation_events(organization_id,project_id,obligation_id,event_type,title,created_by) values(new.organization_id,new.project_id,new.id,kind,label,new.updated_by); return new;
end $$;
drop trigger if exists studio_obligation_audit_trigger on public.studio_project_obligations;
create trigger studio_obligation_audit_trigger after insert or update on public.studio_project_obligations for each row execute function public.studio_obligation_audit();

alter table public.studio_project_obligations enable row level security; alter table public.studio_project_obligation_events enable row level security; alter table public.studio_project_obligation_notifications enable row level security;
create policy studio_obligations_select on public.studio_project_obligations for select to authenticated using(public.studio_is_organization_member(organization_id));
create policy studio_obligations_owner_insert on public.studio_project_obligations for insert to authenticated with check(created_by=auth.uid() and updated_by=auth.uid() and public.studio_has_organization_role(organization_id,array['owner']));
create policy studio_obligations_owner_update on public.studio_project_obligations for update to authenticated using(public.studio_has_organization_role(organization_id,array['owner'])) with check(updated_by=auth.uid() and public.studio_has_organization_role(organization_id,array['owner']));
create policy studio_obligation_events_select on public.studio_project_obligation_events for select to authenticated using(public.studio_is_organization_member(organization_id));
create policy studio_obligation_notifications_select on public.studio_project_obligation_notifications for select to authenticated using(public.studio_is_organization_member(organization_id));
create policy studio_obligation_notifications_owner_insert on public.studio_project_obligation_notifications for insert to authenticated with check(created_by=auth.uid() and public.studio_has_organization_role(organization_id,array['owner']));
grant select,insert,update on public.studio_project_obligations to authenticated; grant select on public.studio_project_obligation_events to authenticated; grant select,insert on public.studio_project_obligation_notifications to authenticated;
revoke delete on public.studio_project_obligations,public.studio_project_obligation_events,public.studio_project_obligation_notifications from anon,authenticated;
grant execute on function public.studio_initialize_project_obligations(uuid,uuid) to authenticated;
notify pgrst,'reload schema';
commit;
