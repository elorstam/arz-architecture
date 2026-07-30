begin;
create extension if not exists pgcrypto;

create or replace function public.studio_set_updated_at()
returns trigger language plpgsql set search_path=public as $$
begin new.updated_at=now(); return new; end $$;

create table if not exists public.profiles(
 id uuid primary key references auth.users(id) on delete cascade,
 email text null,
 full_name text not null default '',
 phone text null,
 avatar_url text null,
 locale text not null default 'tr' check(locale in('tr','en','de','fr','es','nl','ja','zh','ko','ar')),
 is_active boolean not null default true,
 last_seen_at timestamptz null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
comment on column public.profiles.email is 'Controlled server-side copy. auth.users.email is the source of truth.';

create table if not exists public.organizations(
 id uuid primary key default gen_random_uuid(),
 name text not null,
 slug text not null unique check(slug~'^[a-z0-9]+(?:-[a-z0-9]+)*$'),
 legal_name text null,
 email text null,
 phone text null,
 is_active boolean not null default true,
 created_by uuid not null references public.profiles(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.organization_members(
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references public.organizations(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade,
 role text not null check(role in('owner','admin','team_member','client')),
 status text not null default 'active' check(status in('active','suspended')),
 joined_at timestamptz not null default now(),
 created_by uuid null references public.profiles(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(organization_id,user_id)
);

create table if not exists public.activity_events(
 id uuid primary key default gen_random_uuid(),
 organization_id uuid null references public.organizations(id) on delete cascade,
 actor_user_id uuid null references public.profiles(id) on delete set null,
 entity_type text not null,
 entity_id uuid null,
 action text not null,
 summary text not null,
 metadata jsonb not null default '{}'::jsonb check(jsonb_typeof(metadata)='object'),
 created_at timestamptz not null default now()
);

create index if not exists organization_members_user_status_idx on public.organization_members(user_id,status);
create index if not exists organization_members_org_role_status_idx on public.organization_members(organization_id,role,status);
create index if not exists activity_events_org_created_idx on public.activity_events(organization_id,created_at desc);
create index if not exists activity_events_actor_created_idx on public.activity_events(actor_user_id,created_at desc);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.studio_set_updated_at();
create or replace function public.studio_protect_profile_controlled_fields()
returns trigger language plpgsql set search_path=public as $$
begin
 if auth.role()<>'service_role' and(new.email is distinct from old.email or new.is_active is distinct from old.is_active) then
  raise exception 'Profile email and active status are server-controlled.';
 end if;
 return new;
end $$;
drop trigger if exists profiles_protect_controlled_fields on public.profiles;
create trigger profiles_protect_controlled_fields before update on public.profiles for each row execute function public.studio_protect_profile_controlled_fields();
drop trigger if exists organizations_set_updated_at on public.organizations;
create trigger organizations_set_updated_at before update on public.organizations for each row execute function public.studio_set_updated_at();
drop trigger if exists organization_members_set_updated_at on public.organization_members;
create trigger organization_members_set_updated_at before update on public.organization_members for each row execute function public.studio_set_updated_at();

create or replace function public.studio_is_organization_member(target_organization_id uuid)
returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.organization_members m where m.organization_id=target_organization_id and m.user_id=auth.uid() and m.status='active')
$$;

create or replace function public.studio_has_organization_role(target_organization_id uuid,allowed_roles text[])
returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.organization_members m where m.organization_id=target_organization_id and m.user_id=auth.uid() and m.status='active' and m.role=any(allowed_roles))
$$;

create or replace function public.studio_protect_last_owner()
returns trigger language plpgsql security definer set search_path=public as $$
declare remaining integer; removes_owner boolean;
begin
 if tg_op='DELETE' then
  removes_owner:=old.role='owner' and old.status='active';
 else
  removes_owner:=old.role='owner' and old.status='active'
   and(new.role<>'owner' or new.status<>'active' or new.organization_id<>old.organization_id);
 end if;
 if not removes_owner then return case when tg_op='DELETE' then old else new end; end if;
 perform pg_advisory_xact_lock(hashtextextended(old.organization_id::text,0));
 select count(*) into remaining from public.organization_members m where m.organization_id=old.organization_id and m.role='owner' and m.status='active' and m.id<>old.id;
 if remaining=0 then raise exception using errcode='check_violation',message='An organization must retain at least one active owner.'; end if;
 return case when tg_op='DELETE' then old else new end;
end $$;
drop trigger if exists organization_members_protect_last_owner on public.organization_members;
create trigger organization_members_protect_last_owner before update or delete on public.organization_members for each row execute function public.studio_protect_last_owner();

create or replace function public.studio_record_activity(target_organization_id uuid,event_entity_type text,event_entity_id uuid,event_action text,event_summary text,event_metadata jsonb default '{}'::jsonb)
returns uuid language plpgsql security definer set search_path=public as $$
declare event_id uuid;
begin
 if auth.uid() is null then raise exception 'Authentication required.'; end if;
 if target_organization_id is not null and not public.studio_is_organization_member(target_organization_id) then raise exception 'Organization access denied.'; end if;
 if event_action not in('auth.login','auth.logout','auth.access_denied') then raise exception 'Unsupported client activity action.'; end if;
 insert into public.activity_events(organization_id,actor_user_id,entity_type,entity_id,action,summary,metadata)
 values(target_organization_id,auth.uid(),event_entity_type,event_entity_id,event_action,event_summary,coalesce(event_metadata,'{}'::jsonb)) returning id into event_id;
 return event_id;
end $$;

create or replace function public.studio_bootstrap_owner(owner_user_id uuid,owner_email text,owner_full_name text,organization_name text,organization_slug text)
returns uuid language plpgsql security definer set search_path=public,auth as $$
declare organization_id uuid;
begin
 if auth.role()<>'service_role' then raise exception 'Service role required.'; end if;
 if exists(select 1 from public.organization_members where role='owner' and status='active') then raise exception 'Studio owner already exists; bootstrap refused.'; end if;
 if not exists(select 1 from auth.users where id=owner_user_id) then raise exception 'Auth user does not exist.'; end if;
 insert into public.profiles(id,email,full_name) values(owner_user_id,nullif(owner_email,''),owner_full_name)
 on conflict(id) do update set email=excluded.email,full_name=excluded.full_name,is_active=true;
 insert into public.organizations(name,slug,created_by) values(organization_name,organization_slug,owner_user_id) returning id into organization_id;
 insert into public.organization_members(organization_id,user_id,role,status,created_by) values(organization_id,owner_user_id,'owner','active',owner_user_id);
 insert into public.activity_events(organization_id,actor_user_id,entity_type,entity_id,action,summary,metadata)
 values(organization_id,owner_user_id,'organization',organization_id,'studio.bootstrap','Initial Studio owner and organization created.',jsonb_build_object('bootstrap',true));
 return organization_id;
end $$;
revoke all on function public.studio_bootstrap_owner(uuid,text,text,text,text) from public,anon,authenticated;
grant execute on function public.studio_bootstrap_owner(uuid,text,text,text,text) to service_role;
revoke all on function public.studio_is_organization_member(uuid) from public,anon;
revoke all on function public.studio_has_organization_role(uuid,text[]) from public,anon;
revoke all on function public.studio_record_activity(uuid,text,uuid,text,text,jsonb) from public,anon;
grant execute on function public.studio_is_organization_member(uuid) to authenticated;
grant execute on function public.studio_has_organization_role(uuid,text[]) to authenticated;
grant execute on function public.studio_record_activity(uuid,text,uuid,text,text,jsonb) to authenticated;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.activity_events enable row level security;

drop policy if exists studio_profiles_select on public.profiles;
create policy studio_profiles_select on public.profiles for select to authenticated using(
 id=auth.uid() or exists(select 1 from public.organization_members mine join public.organization_members theirs on theirs.organization_id=mine.organization_id where mine.user_id=auth.uid() and mine.status='active' and theirs.user_id=profiles.id and theirs.status='active')
);
drop policy if exists studio_profiles_update_self on public.profiles;
create policy studio_profiles_update_self on public.profiles for update to authenticated using(id=auth.uid()) with check(
 id=auth.uid()
);
drop policy if exists studio_organizations_select on public.organizations;
create policy studio_organizations_select on public.organizations for select to authenticated using(public.studio_is_organization_member(id));
drop policy if exists studio_organizations_update_owner on public.organizations;
create policy studio_organizations_update_owner on public.organizations for update to authenticated using(public.studio_has_organization_role(id,array['owner'])) with check(public.studio_has_organization_role(id,array['owner']));
drop policy if exists studio_members_select on public.organization_members;
create policy studio_members_select on public.organization_members for select to authenticated using(public.studio_is_organization_member(organization_id));
drop policy if exists studio_members_insert_admin on public.organization_members;
create policy studio_members_insert_admin on public.organization_members for insert to authenticated with check(public.studio_has_organization_role(organization_id,array['owner']) or(public.studio_has_organization_role(organization_id,array['admin']) and role in('team_member','client')));
drop policy if exists studio_members_update_admin on public.organization_members;
create policy studio_members_update_admin on public.organization_members for update to authenticated using(public.studio_has_organization_role(organization_id,array['owner','admin'])) with check(public.studio_has_organization_role(organization_id,array['owner']) or(public.studio_has_organization_role(organization_id,array['admin']) and role in('team_member','client')));
drop policy if exists studio_members_delete_admin on public.organization_members;
create policy studio_members_delete_admin on public.organization_members for delete to authenticated using(public.studio_has_organization_role(organization_id,array['owner']) or(public.studio_has_organization_role(organization_id,array['admin']) and role in('team_member','client')));
drop policy if exists studio_activity_select on public.activity_events;
create policy studio_activity_select on public.activity_events for select to authenticated using(organization_id is not null and public.studio_is_organization_member(organization_id));

revoke insert,update,delete on public.activity_events from anon,authenticated;
grant select on public.profiles,public.organizations,public.organization_members,public.activity_events to authenticated;
grant update on public.profiles,public.organizations,public.organization_members to authenticated;
grant insert,delete on public.organization_members to authenticated;
notify pgrst,'reload schema';
commit;
