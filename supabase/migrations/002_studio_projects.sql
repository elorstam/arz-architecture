begin;

create table if not exists public.studio_projects(
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references public.organizations(id) on delete cascade,
 code text not null check(length(btrim(code)) between 1 and 40),
 name text not null check(length(btrim(name)) between 1 and 200),
 client_name text not null default '',
 client_contact_name text not null default '',
 client_email text null,
 client_phone text not null default '',
 category text not null default '',
 location text not null default '',
 project_year text not null default '',
 stage text not null check(stage in('Teklif','Ön Tasarım','Tasarım','Ruhsat','Uygulama','Görselleştirme','Teslim')),
 status text not null check(status in('Aktif','Beklemede','Revizyon','Gecikmiş','Tamamlandı','Arşivlendi')),
 progress integer not null default 0 check(progress between 0 and 100),
 summary text not null default '',
 current_phase text not null default '',
 start_date date null,
 target_date date null,
 next_milestone text not null default '',
 next_milestone_date date null,
 responsible_user_id uuid null references public.profiles(id) on delete set null,
 thumbnail_url text null,
 is_archived boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 created_by uuid null references public.profiles(id) on delete set null,
 updated_by uuid null references public.profiles(id) on delete set null,
 check(target_date is null or start_date is null or target_date>=start_date),
 check((is_archived=false) or status='Arşivlendi')
);

create unique index if not exists studio_projects_org_code_unique
on public.studio_projects(organization_id,lower(btrim(code)));
create index if not exists studio_projects_org_archived_updated_idx
on public.studio_projects(organization_id,is_archived,updated_at desc);
create index if not exists studio_projects_responsible_idx
on public.studio_projects(responsible_user_id) where responsible_user_id is not null;

drop trigger if exists studio_projects_set_updated_at on public.studio_projects;
create trigger studio_projects_set_updated_at
before update on public.studio_projects
for each row execute function public.studio_set_updated_at();

create or replace function public.studio_protect_project_fields()
returns trigger language plpgsql set search_path=public as $$
begin
 if auth.uid() is null then raise exception 'Authentication required.'; end if;
 if tg_op='INSERT' then
  new.created_by=auth.uid();
  new.updated_by=auth.uid();
 else
  if new.organization_id is distinct from old.organization_id
   or new.created_by is distinct from old.created_by
   or new.created_at is distinct from old.created_at then
   raise exception 'Controlled project fields cannot be changed.';
  end if;
  new.updated_by=auth.uid();
 end if;
 if new.responsible_user_id is not null and not exists(
  select 1 from public.organization_members m
  where m.organization_id=new.organization_id
   and m.user_id=new.responsible_user_id
   and m.status='active'
   and m.role in('owner','admin','team_member')
 ) then
  raise exception 'Responsible user must be an active organization team member.';
 end if;
 return new;
end $$;

drop trigger if exists studio_projects_protect_fields on public.studio_projects;
create trigger studio_projects_protect_fields
before insert or update on public.studio_projects
for each row execute function public.studio_protect_project_fields();

alter table public.studio_projects enable row level security;

drop policy if exists studio_projects_select_member on public.studio_projects;
create policy studio_projects_select_member
on public.studio_projects for select to authenticated
using(public.studio_is_organization_member(organization_id));

drop policy if exists studio_projects_insert_owner on public.studio_projects;
create policy studio_projects_insert_owner
on public.studio_projects for insert to authenticated
with check(
 public.studio_has_organization_role(organization_id,array['owner'])
 and(
  responsible_user_id is null
  or exists(
   select 1 from public.organization_members m
   where m.organization_id=studio_projects.organization_id
    and m.user_id=studio_projects.responsible_user_id
    and m.status='active'
    and m.role in('owner','admin','team_member')
  )
 )
);

drop policy if exists studio_projects_update_owner on public.studio_projects;
create policy studio_projects_update_owner
on public.studio_projects for update to authenticated
using(public.studio_has_organization_role(organization_id,array['owner']))
with check(
 public.studio_has_organization_role(organization_id,array['owner'])
 and(
  responsible_user_id is null
  or exists(
   select 1 from public.organization_members m
   where m.organization_id=studio_projects.organization_id
    and m.user_id=studio_projects.responsible_user_id
    and m.status='active'
    and m.role in('owner','admin','team_member')
  )
 )
);

grant select,insert,update on public.studio_projects to authenticated;
revoke delete on public.studio_projects from anon,authenticated;
notify pgrst,'reload schema';
commit;
