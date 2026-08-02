begin;

alter table public.studio_ai_usage_events drop constraint if exists studio_ai_usage_events_module_check;
alter table public.studio_ai_usage_events add constraint studio_ai_usage_events_module_check check(module in('official_processes','project_stages','crm','proposals','decision_log','renders'));
alter table public.studio_ai_usage_events drop constraint if exists studio_ai_usage_events_operation_check;
alter table public.studio_ai_usage_events add constraint studio_ai_usage_events_operation_check check(operation in('fee_ai_whatsapp_message','stage_ai_description','crm_ai_meeting_note','proposal_ai_description','decision_ai_summary','render_description','render_analysis'));

create table if not exists public.studio_render_categories(
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id), project_id uuid not null references public.studio_projects(id),
 name text not null check(char_length(name) between 2 and 80), normalized_name text not null check(char_length(normalized_name) between 2 and 100), sort_order integer not null default 0 check(sort_order>=0),
 is_system boolean not null default false, is_archived boolean not null default false, created_by uuid not null references auth.users(id), updated_by uuid not null references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(project_id,normalized_name)
);
create table if not exists public.studio_project_renders(
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id), project_id uuid not null references public.studio_projects(id), logical_file_id uuid not null references public.studio_project_files(id), category_id uuid references public.studio_render_categories(id),
 title text not null check(char_length(title) between 2 and 180), description text check(description is null or char_length(description)<=3000), width integer check(width is null or width between 1 and 30000), height integer check(height is null or height between 1 and 30000), aspect_ratio text check(aspect_ratio is null or char_length(aspect_ratio)<=30),
 is_hero boolean not null default false, is_client_visible boolean not null default false, presented_at timestamptz, archived_at timestamptz, archived_by uuid references auth.users(id), created_by uuid not null references auth.users(id), updated_by uuid not null references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(organization_id,logical_file_id)
);
create unique index if not exists studio_project_renders_one_hero_idx on public.studio_project_renders(project_id) where is_hero and archived_at is null;
create index if not exists studio_render_categories_project_idx on public.studio_render_categories(organization_id,project_id,is_archived,sort_order);
create index if not exists studio_project_renders_project_idx on public.studio_project_renders(organization_id,project_id,archived_at,created_at desc);
create index if not exists studio_project_renders_category_idx on public.studio_project_renders(category_id) where archived_at is null;
create index if not exists studio_project_renders_client_idx on public.studio_project_renders(project_id,is_client_visible) where archived_at is null;

create table if not exists public.studio_render_events(
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id), project_id uuid not null references public.studio_projects(id), render_id uuid not null references public.studio_project_renders(id), event_type text not null check(event_type in('created','updated','hero_selected','presented','client_visibility_changed','whatsapp_sent','archived','restored')), title text not null check(char_length(title) between 2 and 180), created_by uuid not null references auth.users(id), created_at timestamptz not null default now()
);
create index if not exists studio_render_events_render_idx on public.studio_render_events(organization_id,render_id,created_at desc);

create or replace function public.studio_normalize_render_name(value text) returns text language sql immutable as $$
 select translate(lower(trim(regexp_replace(normalize(value,NFC),'\s+',' ','g'))),'çğıöşü','cgiosu')
$$;

create or replace function public.studio_validate_render_category() returns trigger language plpgsql set search_path=public as $$
declare project_org uuid;
begin
 select organization_id into project_org from public.studio_projects where id=new.project_id;
 if project_org is null or project_org<>new.organization_id then raise exception 'render_category_scope_invalid' using errcode='23514'; end if;
 if tg_op='UPDATE' and (new.organization_id<>old.organization_id or new.project_id<>old.project_id or new.created_by<>old.created_by or new.created_at<>old.created_at or new.is_system<>old.is_system) then raise exception 'render_category_audit_immutable' using errcode='42501'; end if;
 new.normalized_name=public.studio_normalize_render_name(new.name); new.updated_at=now(); return new;
end $$;
drop trigger if exists studio_validate_render_category on public.studio_render_categories;
create trigger studio_validate_render_category before insert or update on public.studio_render_categories for each row execute function public.studio_validate_render_category();

create or replace function public.studio_initialize_render_categories(target_project uuid,target_user uuid) returns void language plpgsql security invoker set search_path=public as $$
declare target_org uuid;
begin
 select organization_id into target_org from public.studio_projects where id=target_project;
 if target_org is null then raise exception 'project_not_found' using errcode='P0002'; end if;
 if not public.studio_has_organization_role(target_org,array['owner']) then raise exception 'forbidden' using errcode='42501'; end if;
 insert into public.studio_render_categories(organization_id,project_id,name,normalized_name,sort_order,is_system,created_by,updated_by)
 select target_org,target_project,v.name,public.studio_normalize_render_name(v.name),v.ord,true,target_user,target_user from (values
 ('Dış Cephe',1),('İç Mekan',2),('Gece Renderı',3),('Gündüz Renderı',4),('Vaziyet Planı',5),('Kat Planı',6),('Kesit',7),('Cephe',8),('Detay',9),('Drone',10),('Animasyon Kareleri',11),('Diğer',12)) v(name,ord)
 on conflict(project_id,normalized_name) do nothing;
end $$;

create or replace function public.studio_seed_render_categories_for_project() returns trigger language plpgsql set search_path=public as $$
begin
 insert into public.studio_render_categories(organization_id,project_id,name,normalized_name,sort_order,is_system,created_by,updated_by)
 select new.organization_id,new.id,v.name,public.studio_normalize_render_name(v.name),v.ord,true,new.created_by,new.created_by from (values
 ('Dış Cephe',1),('İç Mekan',2),('Gece Renderı',3),('Gündüz Renderı',4),('Vaziyet Planı',5),('Kat Planı',6),('Kesit',7),('Cephe',8),('Detay',9),('Drone',10),('Animasyon Kareleri',11),('Diğer',12)) v(name,ord)
 on conflict(project_id,normalized_name) do nothing; return new;
end $$;
drop trigger if exists studio_seed_render_categories_for_project on public.studio_projects;
create trigger studio_seed_render_categories_for_project after insert on public.studio_projects for each row execute function public.studio_seed_render_categories_for_project();

insert into public.studio_render_categories(organization_id,project_id,name,normalized_name,sort_order,is_system,created_by,updated_by)
select p.organization_id,p.id,v.name,public.studio_normalize_render_name(v.name),v.ord,true,p.created_by,p.created_by from public.studio_projects p cross join (values
 ('Dış Cephe',1),('İç Mekan',2),('Gece Renderı',3),('Gündüz Renderı',4),('Vaziyet Planı',5),('Kat Planı',6),('Kesit',7),('Cephe',8),('Detay',9),('Drone',10),('Animasyon Kareleri',11),('Diğer',12)) v(name,ord)
on conflict(project_id,normalized_name) do nothing;

create or replace function public.studio_validate_render_record() returns trigger language plpgsql set search_path=public as $$
declare f record; c record;
begin
 select organization_id,project_id,status,category into f from public.studio_project_files where id=new.logical_file_id;
 if f.organization_id is null or f.organization_id<>new.organization_id or f.project_id<>new.project_id or f.status<>'ready' or f.category not in('render','image') then raise exception 'render_file_identity_invalid' using errcode='23514'; end if;
 if new.category_id is not null then select organization_id,project_id,is_archived into c from public.studio_render_categories where id=new.category_id; if c.organization_id is null or c.organization_id<>new.organization_id or c.project_id<>new.project_id or c.is_archived then raise exception 'render_category_invalid' using errcode='23514'; end if; end if;
 if tg_op='UPDATE' and (new.organization_id<>old.organization_id or new.project_id<>old.project_id or new.logical_file_id<>old.logical_file_id or new.created_by<>old.created_by or new.created_at<>old.created_at) then raise exception 'render_audit_immutable' using errcode='42501'; end if;
 new.updated_at=now(); return new;
end $$;
drop trigger if exists studio_validate_render_record on public.studio_project_renders;
create trigger studio_validate_render_record before insert or update on public.studio_project_renders for each row execute function public.studio_validate_render_record();
create or replace function public.studio_set_hero_render(target_project uuid,target_render uuid,target_user uuid) returns void language plpgsql security invoker set search_path=public as $$
declare target_org uuid;
begin select organization_id into target_org from public.studio_projects where id=target_project; if target_org is null or not public.studio_has_organization_role(target_org,array['owner']) then raise exception 'forbidden' using errcode='42501'; end if;
 if not exists(select 1 from public.studio_project_renders where id=target_render and project_id=target_project and organization_id=target_org and archived_at is null) then raise exception 'render_not_found' using errcode='P0002'; end if;
 update public.studio_project_renders set is_hero=false,updated_by=target_user where project_id=target_project and organization_id=target_org and is_hero;
 update public.studio_project_renders set is_hero=true,updated_by=target_user where id=target_render and project_id=target_project and organization_id=target_org;
end $$;
create or replace function public.studio_validate_render_event() returns trigger language plpgsql set search_path=public as $$
declare r record;
begin select organization_id,project_id into r from public.studio_project_renders where id=new.render_id; if r.organization_id is null or r.organization_id<>new.organization_id or r.project_id<>new.project_id then raise exception 'render_event_scope_invalid' using errcode='23514'; end if; return new; end $$;
drop trigger if exists studio_validate_render_event on public.studio_render_events;
create trigger studio_validate_render_event before insert on public.studio_render_events for each row execute function public.studio_validate_render_event();

alter table public.studio_render_categories enable row level security;
alter table public.studio_project_renders enable row level security;
alter table public.studio_render_events enable row level security;
create policy studio_render_categories_select on public.studio_render_categories for select to authenticated using(public.studio_is_organization_member(organization_id));
create policy studio_render_categories_owner_insert on public.studio_render_categories for insert to authenticated with check(public.studio_has_organization_role(organization_id,array['owner']) and created_by=auth.uid() and updated_by=auth.uid());
create policy studio_render_categories_owner_update on public.studio_render_categories for update to authenticated using(public.studio_has_organization_role(organization_id,array['owner'])) with check(public.studio_has_organization_role(organization_id,array['owner']) and updated_by=auth.uid());
create policy studio_project_renders_select on public.studio_project_renders for select to authenticated using(public.studio_is_organization_member(organization_id));
create policy studio_project_renders_owner_insert on public.studio_project_renders for insert to authenticated with check(public.studio_has_organization_role(organization_id,array['owner']) and created_by=auth.uid() and updated_by=auth.uid());
create policy studio_project_renders_owner_update on public.studio_project_renders for update to authenticated using(public.studio_has_organization_role(organization_id,array['owner'])) with check(public.studio_has_organization_role(organization_id,array['owner']) and updated_by=auth.uid());
create policy studio_render_events_select on public.studio_render_events for select to authenticated using(public.studio_is_organization_member(organization_id));
create policy studio_render_events_owner_insert on public.studio_render_events for insert to authenticated with check(public.studio_has_organization_role(organization_id,array['owner']) and created_by=auth.uid());
grant select,insert,update on public.studio_render_categories,public.studio_project_renders to authenticated;
grant select,insert on public.studio_render_events to authenticated;
grant execute on function public.studio_initialize_render_categories(uuid,uuid) to authenticated;
grant execute on function public.studio_set_hero_render(uuid,uuid,uuid) to authenticated;
revoke delete on public.studio_render_categories,public.studio_project_renders,public.studio_render_events from anon,authenticated;
commit;
