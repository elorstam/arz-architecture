begin;

create table if not exists public.studio_leads(
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references public.organizations(id) on delete cascade,
 first_name text not null check(length(btrim(first_name)) between 1 and 120),
 last_name text not null default '' check(length(last_name)<=120),
 company_name text not null default '' check(length(company_name)<=200),
 phone text not null check(length(btrim(phone)) between 1 and 50),
 email text null check(email is null or length(email)<=254),
 city text not null default '' check(length(city)<=120),
 district text not null default '' check(length(district)<=120),
 service_type text not null check(service_type in('Villa','Konut','Apartman','İç Mimari','Ofis','Ticari','Kentsel Dönüşüm','Render','Danışmanlık','Diğer')),
 budget_amount numeric(14,2) null check(budget_amount is null or budget_amount>=0),
 budget_currency text not null default 'TRY' check(budget_currency in('TRY','USD','EUR')),
 source text not null check(source in('Instagram','Google','Web Sitesi','Referans','Armut','Sahibinden','Telefon','Eski Müşteri','Diğer')),
 stage text not null default 'Yeni Lead' check(stage in('Yeni Lead','İlk Görüşme','İhtiyaç Analizi','Teklif Hazırlanıyor','Teklif Gönderildi','Kazanıldı','Kaybedildi')),
 status text not null default 'Aktif' check(status in('Aktif','Beklemede','Kapandı')),
 notes text not null default '' check(length(notes)<=10000),
 assigned_user_id uuid null references public.profiles(id) on delete set null,
 last_contact_at timestamptz null,
 next_follow_up_at timestamptz null,
 is_archived boolean not null default false,
 created_by uuid null references public.profiles(id) on delete set null,
 updated_by uuid null references public.profiles(id) on delete set null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check(
  (stage in('Kazanıldı','Kaybedildi') and status='Kapandı')
  or (stage not in('Kazanıldı','Kaybedildi') and status<>'Kapandı')
 )
);

create index if not exists studio_leads_org_archived_updated_idx
on public.studio_leads(organization_id,is_archived,updated_at desc);
create index if not exists studio_leads_org_stage_status_idx
on public.studio_leads(organization_id,stage,status) where is_archived=false;
create index if not exists studio_leads_assigned_idx
on public.studio_leads(assigned_user_id) where assigned_user_id is not null;
create index if not exists studio_leads_follow_up_idx
on public.studio_leads(organization_id,next_follow_up_at) where is_archived=false and next_follow_up_at is not null;

drop trigger if exists studio_leads_set_updated_at on public.studio_leads;
create trigger studio_leads_set_updated_at
before update on public.studio_leads
for each row execute function public.studio_set_updated_at();

create or replace function public.studio_protect_lead_fields()
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
   raise exception 'Controlled lead fields cannot be changed.';
  end if;
  new.updated_by=auth.uid();
 end if;
 if new.assigned_user_id is not null and not exists(
  select 1 from public.organization_members m
  where m.organization_id=new.organization_id
   and m.user_id=new.assigned_user_id
   and m.status='active'
   and m.role in('owner','admin','team_member')
 ) then
  raise exception 'Assigned user must be an active organization team member.';
 end if;
 return new;
end $$;

drop trigger if exists studio_leads_protect_fields on public.studio_leads;
create trigger studio_leads_protect_fields
before insert or update on public.studio_leads
for each row execute function public.studio_protect_lead_fields();

alter table public.studio_leads enable row level security;

drop policy if exists studio_leads_select_member on public.studio_leads;
create policy studio_leads_select_member
on public.studio_leads for select to authenticated
using(public.studio_is_organization_member(organization_id));

drop policy if exists studio_leads_insert_owner on public.studio_leads;
create policy studio_leads_insert_owner
on public.studio_leads for insert to authenticated
with check(
 public.studio_has_organization_role(organization_id,array['owner'])
 and(
  assigned_user_id is null
  or exists(
   select 1 from public.organization_members m
   where m.organization_id=studio_leads.organization_id
    and m.user_id=studio_leads.assigned_user_id
    and m.status='active'
    and m.role in('owner','admin','team_member')
  )
 )
);

drop policy if exists studio_leads_update_owner on public.studio_leads;
create policy studio_leads_update_owner
on public.studio_leads for update to authenticated
using(public.studio_has_organization_role(organization_id,array['owner']))
with check(
 public.studio_has_organization_role(organization_id,array['owner'])
 and(
  assigned_user_id is null
  or exists(
   select 1 from public.organization_members m
   where m.organization_id=studio_leads.organization_id
    and m.user_id=studio_leads.assigned_user_id
    and m.status='active'
    and m.role in('owner','admin','team_member')
  )
 )
);

grant select,insert,update on public.studio_leads to authenticated;
revoke delete on public.studio_leads from anon,authenticated;
notify pgrst,'reload schema';
commit;
