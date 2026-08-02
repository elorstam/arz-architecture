begin;

-- 026 is intentionally additive: it repairs installations where 025 was only
-- partially applied. Existing rows are never deleted or rewritten.
alter table public.studio_finance_entries
  add column if not exists paid_amount numeric(16,2) not null default 0,
  add column if not exists receipt_file_id uuid,
  add column if not exists invoice_file_id uuid;

alter table public.studio_finance_entries
  drop constraint if exists studio_finance_entries_category_check;
alter table public.studio_finance_entries
  add constraint studio_finance_entries_category_check check(category in(
    'project_fee','municipal_fee','building_inspection','personnel','office',
    'software','advertising','tax','social_security','electricity','water',
    'internet','vehicle','fuel','other','progress_payment','invoice',
    'statik','mekanik','elektrik','zemin_etud','yapi_denetim','ozalit',
    'belediye','harc','noter','ulasim'
  ));

do $$ begin
  if not exists (select 1 from pg_constraint where conname='studio_finance_entries_paid_amount_check') then
    alter table public.studio_finance_entries
      add constraint studio_finance_entries_paid_amount_check
      check(paid_amount>=0 and paid_amount<=amount) not valid;
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_constraint where conname='studio_finance_entries_receipt_file_fk') then
    alter table public.studio_finance_entries
      add constraint studio_finance_entries_receipt_file_fk
      foreign key(receipt_file_id) references public.studio_project_files(id) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname='studio_finance_entries_invoice_file_fk') then
    alter table public.studio_finance_entries
      add constraint studio_finance_entries_invoice_file_fk
      foreign key(invoice_file_id) references public.studio_project_files(id) not valid;
  end if;
end $$;

create index if not exists studio_finance_entries_receipt_file_idx
  on public.studio_finance_entries(organization_id,receipt_file_id)
  where receipt_file_id is not null and is_archived=false;
create index if not exists studio_finance_entries_invoice_file_idx
  on public.studio_finance_entries(organization_id,invoice_file_id)
  where invoice_file_id is not null and is_archived=false;

create table if not exists public.studio_project_finance_profiles(
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  project_id uuid not null references public.studio_projects(id),
  agreed_amount numeric(16,2) not null default 0 check(agreed_amount>=0),
  currency text not null default 'TRY' check(currency in('TRY','USD','EUR','GBP')),
  contract_date date,
  description text check(description is null or char_length(description)<=4000),
  contract_file_id uuid references public.studio_project_files(id),
  created_by uuid not null references auth.users(id),
  updated_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.studio_project_finance_profiles
  add column if not exists organization_id uuid,
  add column if not exists project_id uuid,
  add column if not exists agreed_amount numeric(16,2) not null default 0,
  add column if not exists currency text not null default 'TRY',
  add column if not exists contract_date date,
  add column if not exists description text,
  add column if not exists contract_file_id uuid,
  add column if not exists created_by uuid,
  add column if not exists updated_by uuid,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists studio_project_finance_profiles_project_unique
  on public.studio_project_finance_profiles(organization_id,project_id);
create index if not exists studio_project_finance_profiles_org_idx
  on public.studio_project_finance_profiles(organization_id,project_id);

do $$ begin
  if not exists (select 1 from pg_constraint where conname='studio_project_finance_profiles_org_fk') then
    alter table public.studio_project_finance_profiles add constraint studio_project_finance_profiles_org_fk
      foreign key(organization_id) references public.organizations(id) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname='studio_project_finance_profiles_project_fk') then
    alter table public.studio_project_finance_profiles add constraint studio_project_finance_profiles_project_fk
      foreign key(project_id) references public.studio_projects(id) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname='studio_project_finance_profiles_contract_file_fk') then
    alter table public.studio_project_finance_profiles add constraint studio_project_finance_profiles_contract_file_fk
      foreign key(contract_file_id) references public.studio_project_files(id) not valid;
  end if;
end $$;

create or replace function public.studio_validate_project_finance_documents() returns trigger
language plpgsql set search_path=public as $$
declare file_project uuid;
begin
  foreach file_project in array array[new.receipt_file_id,new.invoice_file_id] loop
    if file_project is not null and not exists(
      select 1 from public.studio_project_files f
      where f.id=file_project and f.organization_id=new.organization_id
        and f.project_id=new.project_id and f.status='ready' and f.is_archived=false
    ) then raise exception 'Project finance document scope mismatch' using errcode='23514'; end if;
  end loop;
  return new;
end $$;
drop trigger if exists studio_validate_project_finance_documents_trigger on public.studio_finance_entries;
create trigger studio_validate_project_finance_documents_trigger
before insert or update on public.studio_finance_entries for each row
when(new.entry_type='expense') execute function public.studio_validate_project_finance_documents();

create or replace function public.studio_validate_project_finance_profile() returns trigger
language plpgsql set search_path=public as $$
begin
  if not exists(select 1 from public.studio_projects p where p.id=new.project_id and p.organization_id=new.organization_id) then
    raise exception 'Project finance scope mismatch' using errcode='23514';
  end if;
  if new.contract_file_id is not null and not exists(
    select 1 from public.studio_project_files f where f.id=new.contract_file_id
      and f.organization_id=new.organization_id and f.project_id=new.project_id
      and f.status='ready' and f.is_archived=false
  ) then raise exception 'Project contract scope mismatch' using errcode='23514'; end if;
  if tg_op='UPDATE' and (new.organization_id<>old.organization_id or new.project_id<>old.project_id
    or new.created_by<>old.created_by or new.created_at<>old.created_at) then
    raise exception 'Protected project finance fields cannot change' using errcode='42501';
  end if;
  new.updated_at:=now(); return new;
end $$;
drop trigger if exists studio_validate_project_finance_profile_trigger on public.studio_project_finance_profiles;
create trigger studio_validate_project_finance_profile_trigger
before insert or update on public.studio_project_finance_profiles for each row
execute function public.studio_validate_project_finance_profile();

alter table public.studio_project_finance_profiles enable row level security;
do $$ begin
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='studio_project_finance_profiles' and policyname='studio_project_finance_profiles_select') then
    create policy studio_project_finance_profiles_select on public.studio_project_finance_profiles for select to authenticated using(public.studio_is_organization_member(organization_id));
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='studio_project_finance_profiles' and policyname='studio_project_finance_profiles_owner_insert') then
    create policy studio_project_finance_profiles_owner_insert on public.studio_project_finance_profiles for insert to authenticated with check(created_by=auth.uid() and updated_by=auth.uid() and public.studio_has_organization_role(organization_id,array['owner']));
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='studio_project_finance_profiles' and policyname='studio_project_finance_profiles_owner_update') then
    create policy studio_project_finance_profiles_owner_update on public.studio_project_finance_profiles for update to authenticated using(public.studio_has_organization_role(organization_id,array['owner'])) with check(updated_by=auth.uid() and public.studio_has_organization_role(organization_id,array['owner']));
  end if;
end $$;
grant select,insert,update on public.studio_project_finance_profiles to authenticated;
revoke delete on public.studio_project_finance_profiles from anon,authenticated;
notify pgrst,'reload schema';
commit;
