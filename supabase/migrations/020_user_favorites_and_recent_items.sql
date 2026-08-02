begin;

create table if not exists public.studio_user_favorites(
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references public.organizations(id),
 user_id uuid not null references auth.users(id),
 entity_type text not null check(entity_type in('project','crm_lead','quote','file','folder','file_version','project_stage','official_process','decision','render','client')),
 entity_id uuid not null,
 created_at timestamptz not null default now(),
 archived_at timestamptz,
 unique(organization_id,user_id,entity_type,entity_id)
);

create table if not exists public.studio_user_recent_items(
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references public.organizations(id),
 user_id uuid not null references auth.users(id),
 entity_type text not null check(entity_type in('project','crm_lead','quote','file','folder')),
 entity_id uuid not null,
 last_opened_at timestamptz not null default now(),
 unique(organization_id,user_id,entity_type,entity_id)
);

create index if not exists studio_user_favorites_user_active_idx on public.studio_user_favorites(organization_id,user_id,created_at desc) where archived_at is null;
create index if not exists studio_user_favorites_entity_idx on public.studio_user_favorites(organization_id,entity_type,entity_id) where archived_at is null;
create index if not exists studio_user_recent_items_user_opened_idx on public.studio_user_recent_items(organization_id,user_id,last_opened_at desc);

create or replace function public.studio_quick_access_entity_organization(kind text,target uuid) returns uuid language plpgsql stable security invoker set search_path=public as $$
declare result uuid;
begin
 case kind
  when 'project' then select organization_id into result from public.studio_projects where id=target;
  when 'crm_lead' then select organization_id into result from public.studio_leads where id=target;
  when 'quote' then select organization_id into result from public.studio_quotes where id=target;
  when 'file' then select organization_id into result from public.studio_project_files where id=target;
  when 'folder' then select organization_id into result from public.studio_project_folders where id=target;
  when 'file_version' then select organization_id into result from public.studio_project_file_versions where id=target;
  else raise exception 'Favorite entity type is not active' using errcode='23514';
 end case;
 return result;
end $$;

create or replace function public.studio_validate_quick_access_entity() returns trigger language plpgsql set search_path=public as $$
declare entity_org uuid;
begin
 entity_org:=public.studio_quick_access_entity_organization(new.entity_type,new.entity_id);
 if entity_org is null or entity_org<>new.organization_id then raise exception 'Quick access entity organization mismatch' using errcode='23514'; end if;
 if tg_op='UPDATE' and (new.organization_id<>old.organization_id or new.user_id<>old.user_id or new.entity_type<>old.entity_type or new.entity_id<>old.entity_id) then raise exception 'Protected quick access fields cannot be changed' using errcode='42501'; end if;
 return new;
end $$;

drop trigger if exists studio_validate_user_favorite on public.studio_user_favorites;
create trigger studio_validate_user_favorite before insert or update on public.studio_user_favorites for each row execute function public.studio_validate_quick_access_entity();
drop trigger if exists studio_validate_user_recent_item on public.studio_user_recent_items;
create trigger studio_validate_user_recent_item before insert or update on public.studio_user_recent_items for each row execute function public.studio_validate_quick_access_entity();

alter table public.studio_user_favorites enable row level security;
alter table public.studio_user_recent_items enable row level security;

create policy studio_user_favorites_select on public.studio_user_favorites for select to authenticated using(user_id=auth.uid() and exists(select 1 from public.organization_members m where m.organization_id=studio_user_favorites.organization_id and m.user_id=auth.uid() and m.status='active'));
create policy studio_user_favorites_insert on public.studio_user_favorites for insert to authenticated with check(user_id=auth.uid() and archived_at is null and exists(select 1 from public.organization_members m where m.organization_id=studio_user_favorites.organization_id and m.user_id=auth.uid() and m.status='active'));
create policy studio_user_favorites_update on public.studio_user_favorites for update to authenticated using(user_id=auth.uid() and exists(select 1 from public.organization_members m where m.organization_id=studio_user_favorites.organization_id and m.user_id=auth.uid() and m.status='active')) with check(user_id=auth.uid() and exists(select 1 from public.organization_members m where m.organization_id=studio_user_favorites.organization_id and m.user_id=auth.uid() and m.status='active'));
create policy studio_user_recent_items_select on public.studio_user_recent_items for select to authenticated using(user_id=auth.uid() and exists(select 1 from public.organization_members m where m.organization_id=studio_user_recent_items.organization_id and m.user_id=auth.uid() and m.status='active'));
create policy studio_user_recent_items_insert on public.studio_user_recent_items for insert to authenticated with check(user_id=auth.uid() and exists(select 1 from public.organization_members m where m.organization_id=studio_user_recent_items.organization_id and m.user_id=auth.uid() and m.status='active'));
create policy studio_user_recent_items_update on public.studio_user_recent_items for update to authenticated using(user_id=auth.uid() and exists(select 1 from public.organization_members m where m.organization_id=studio_user_recent_items.organization_id and m.user_id=auth.uid() and m.status='active')) with check(user_id=auth.uid() and exists(select 1 from public.organization_members m where m.organization_id=studio_user_recent_items.organization_id and m.user_id=auth.uid() and m.status='active'));

grant select,insert,update on public.studio_user_favorites,public.studio_user_recent_items to authenticated;
revoke delete on public.studio_user_favorites,public.studio_user_recent_items from anon,authenticated;

commit;
