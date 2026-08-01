begin;

create or replace function public.studio_normalize_tag_name(value text) returns text language sql immutable strict as $$
 select regexp_replace(translate(lower(normalize(trim(value),nfd)),'çğıöşü','cgiosu'),'[^a-z0-9]+',' ','g')::text;
$$;

create table if not exists public.studio_tags(
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id), name text not null check(char_length(trim(name)) between 1 and 60), normalized_name text not null check(char_length(normalized_name) between 1 and 60), color text not null check(color in('gray','blue','green','amber','orange','red','purple','pink','cyan','teal')), description text check(description is null or char_length(description)<=500), is_archived boolean not null default false, created_by uuid not null references auth.users(id), updated_by uuid not null references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(organization_id,normalized_name)
);
create table if not exists public.studio_tag_assignments(
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id), tag_id uuid not null references public.studio_tags(id), entity_type text not null check(entity_type in('project','crm_lead','quote','file','file_version','folder')), entity_id uuid not null, is_active boolean not null default true, created_by uuid not null references auth.users(id), removed_by uuid references auth.users(id), created_at timestamptz not null default now(), removed_at timestamptz, unique(organization_id,tag_id,entity_type,entity_id), check((is_active and removed_at is null and removed_by is null) or (not is_active and removed_at is not null and removed_by is not null))
);

create index if not exists studio_tags_org_idx on public.studio_tags(organization_id);
create index if not exists studio_tags_normalized_idx on public.studio_tags(organization_id,normalized_name);
create index if not exists studio_tags_archived_idx on public.studio_tags(organization_id,is_archived);
create index if not exists studio_tags_created_idx on public.studio_tags(organization_id,created_at desc);
create index if not exists studio_tag_assignments_entity_idx on public.studio_tag_assignments(organization_id,entity_type,entity_id) where is_active;
create index if not exists studio_tag_assignments_tag_idx on public.studio_tag_assignments(organization_id,tag_id) where is_active;
create index if not exists studio_tag_assignments_created_idx on public.studio_tag_assignments(organization_id,created_at desc);

create or replace function public.studio_prepare_tag() returns trigger language plpgsql set search_path=public as $$ begin
 new.name:=trim(new.name); new.normalized_name:=public.studio_normalize_tag_name(new.name); new.updated_at:=now();
 if tg_op='UPDATE' and (new.organization_id<>old.organization_id or new.created_by<>old.created_by or new.created_at<>old.created_at) then raise exception 'Protected tag fields cannot be changed' using errcode='42501'; end if;
 return new;
end $$;
drop trigger if exists studio_prepare_tag on public.studio_tags;
create trigger studio_prepare_tag before insert or update on public.studio_tags for each row execute function public.studio_prepare_tag();

create or replace function public.studio_validate_tag_assignment() returns trigger language plpgsql set search_path=public as $$ declare entity_org uuid; tag_archived boolean; begin
 select organization_id,is_archived into entity_org,tag_archived from public.studio_tags where id=new.tag_id;
 if entity_org is null or entity_org<>new.organization_id then raise exception 'Tag organization mismatch' using errcode='23514'; end if;
 if new.is_active and tag_archived then raise exception 'Archived tag cannot be assigned' using errcode='23514'; end if;
 case new.entity_type
  when 'project' then select organization_id into entity_org from public.studio_projects where id=new.entity_id;
  when 'crm_lead' then select organization_id into entity_org from public.studio_leads where id=new.entity_id;
  when 'quote' then select organization_id into entity_org from public.studio_quotes where id=new.entity_id;
  when 'file' then select organization_id into entity_org from public.studio_project_files where id=new.entity_id;
  when 'file_version' then select organization_id into entity_org from public.studio_project_file_versions where id=new.entity_id;
  when 'folder' then select organization_id into entity_org from public.studio_project_folders where id=new.entity_id;
  else raise exception 'Invalid entity type' using errcode='23514';
 end case;
 if entity_org is null or entity_org<>new.organization_id then raise exception 'Tag entity organization mismatch' using errcode='23514'; end if;
 if tg_op='UPDATE' and (new.organization_id<>old.organization_id or new.tag_id<>old.tag_id or new.entity_type<>old.entity_type or new.entity_id<>old.entity_id or new.created_by<>old.created_by or new.created_at<>old.created_at) then raise exception 'Protected assignment fields cannot be changed' using errcode='42501'; end if;
 return new;
end $$;
drop trigger if exists studio_validate_tag_assignment on public.studio_tag_assignments;
create trigger studio_validate_tag_assignment before insert or update on public.studio_tag_assignments for each row execute function public.studio_validate_tag_assignment();

alter table public.studio_tags enable row level security; alter table public.studio_tag_assignments enable row level security;
create or replace function public.studio_can_access_tag_entity(kind text,target uuid,org uuid) returns boolean language plpgsql stable security invoker set search_path=public as $$ begin return case kind when 'project' then exists(select 1 from public.studio_projects where id=target and organization_id=org) when 'crm_lead' then exists(select 1 from public.studio_leads where id=target and organization_id=org) when 'quote' then exists(select 1 from public.studio_quotes where id=target and organization_id=org) when 'file' then exists(select 1 from public.studio_project_files where id=target and organization_id=org) when 'file_version' then exists(select 1 from public.studio_project_file_versions where id=target and organization_id=org) when 'folder' then exists(select 1 from public.studio_project_folders where id=target and organization_id=org) else false end; end $$;
drop policy if exists studio_tags_select on public.studio_tags; create policy studio_tags_select on public.studio_tags for select to authenticated using(exists(select 1 from public.organization_members m where m.organization_id=studio_tags.organization_id and m.user_id=auth.uid() and m.status='active'));
drop policy if exists studio_tags_owner_insert on public.studio_tags; create policy studio_tags_owner_insert on public.studio_tags for insert to authenticated with check(created_by=auth.uid() and updated_by=auth.uid() and exists(select 1 from public.organization_members m where m.organization_id=studio_tags.organization_id and m.user_id=auth.uid() and m.status='active' and m.role='owner'));
drop policy if exists studio_tags_owner_update on public.studio_tags; create policy studio_tags_owner_update on public.studio_tags for update to authenticated using(exists(select 1 from public.organization_members m where m.organization_id=studio_tags.organization_id and m.user_id=auth.uid() and m.status='active' and m.role='owner')) with check(updated_by=auth.uid() and exists(select 1 from public.organization_members m where m.organization_id=studio_tags.organization_id and m.user_id=auth.uid() and m.status='active' and m.role='owner'));
drop policy if exists studio_tag_assignments_select on public.studio_tag_assignments; create policy studio_tag_assignments_select on public.studio_tag_assignments for select to authenticated using(exists(select 1 from public.organization_members m where m.organization_id=studio_tag_assignments.organization_id and m.user_id=auth.uid() and m.status='active') and public.studio_can_access_tag_entity(entity_type,entity_id,organization_id));
drop policy if exists studio_tag_assignments_owner_insert on public.studio_tag_assignments; create policy studio_tag_assignments_owner_insert on public.studio_tag_assignments for insert to authenticated with check(created_by=auth.uid() and exists(select 1 from public.organization_members m where m.organization_id=studio_tag_assignments.organization_id and m.user_id=auth.uid() and m.status='active' and m.role='owner'));
drop policy if exists studio_tag_assignments_owner_update on public.studio_tag_assignments; create policy studio_tag_assignments_owner_update on public.studio_tag_assignments for update to authenticated using(exists(select 1 from public.organization_members m where m.organization_id=studio_tag_assignments.organization_id and m.user_id=auth.uid() and m.status='active' and m.role='owner')) with check(exists(select 1 from public.organization_members m where m.organization_id=studio_tag_assignments.organization_id and m.user_id=auth.uid() and m.status='active' and m.role='owner'));
grant select,insert,update on public.studio_tags,public.studio_tag_assignments to authenticated; revoke delete on public.studio_tags,public.studio_tag_assignments from authenticated;
commit;
