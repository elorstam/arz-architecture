begin;

alter table public.studio_ai_usage_events drop constraint if exists studio_ai_usage_events_operation_check;
alter table public.studio_ai_usage_events add constraint studio_ai_usage_events_operation_check check(operation in('fee_ai_whatsapp_message','stage_ai_description','crm_ai_meeting_note','proposal_ai_description','decision_ai_summary','render_description','render_analysis','finance_summary','payment_reminder','invoice_description','progress_payment','cashflow_summary','project_expense_description'));

alter table public.studio_finance_entries drop constraint if exists studio_finance_entries_category_check;
alter table public.studio_finance_entries add constraint studio_finance_entries_category_check check(category in('project_fee','municipal_fee','building_inspection','personnel','office','software','advertising','tax','social_security','electricity','water','internet','vehicle','fuel','other','progress_payment','invoice','statik','mekanik','elektrik','zemin_etud','yapi_denetim','ozalit','belediye','harc','noter','ulasim'));
alter table public.studio_finance_entries add column if not exists receipt_file_id uuid references public.studio_project_files(id);
alter table public.studio_finance_entries add column if not exists invoice_file_id uuid references public.studio_project_files(id);

create table if not exists public.studio_project_finance_profiles(
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id), project_id uuid not null references public.studio_projects(id),
 agreed_amount numeric(16,2) not null default 0 check(agreed_amount>=0), currency text not null default 'TRY' check(currency in('TRY','USD','EUR','GBP')), contract_date date, description text check(description is null or char_length(description)<=4000), contract_file_id uuid references public.studio_project_files(id),
 created_by uuid not null references auth.users(id), updated_by uuid not null references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index if not exists studio_project_finance_profiles_project_unique on public.studio_project_finance_profiles(organization_id,project_id);
create index if not exists studio_project_finance_profiles_org_idx on public.studio_project_finance_profiles(organization_id,project_id);
create index if not exists studio_finance_entries_project_expense_history_idx on public.studio_finance_entries(organization_id,project_id,entry_date desc) where entry_type='expense' and is_archived=false;

create or replace function public.studio_validate_project_finance_documents() returns trigger language plpgsql set search_path=public as $$
declare file_project uuid;
begin
 foreach file_project in array array[new.receipt_file_id,new.invoice_file_id] loop
  if file_project is not null and not exists(select 1 from public.studio_project_files f where f.id=file_project and f.organization_id=new.organization_id and f.project_id=new.project_id and f.status='ready' and f.is_archived=false) then raise exception 'Project finance document scope mismatch' using errcode='23514'; end if;
 end loop;
 return new;
end $$;
drop trigger if exists studio_validate_project_finance_documents_trigger on public.studio_finance_entries;
create trigger studio_validate_project_finance_documents_trigger before insert or update on public.studio_finance_entries for each row when(new.entry_type='expense') execute function public.studio_validate_project_finance_documents();

create or replace function public.studio_validate_project_finance_profile() returns trigger language plpgsql set search_path=public as $$
begin
 if not exists(select 1 from public.studio_projects p where p.id=new.project_id and p.organization_id=new.organization_id) then raise exception 'Project finance scope mismatch' using errcode='23514'; end if;
 if new.contract_file_id is not null and not exists(select 1 from public.studio_project_files f where f.id=new.contract_file_id and f.organization_id=new.organization_id and f.project_id=new.project_id and f.status='ready' and f.is_archived=false) then raise exception 'Project contract scope mismatch' using errcode='23514'; end if;
 if tg_op='UPDATE' and (new.organization_id<>old.organization_id or new.project_id<>old.project_id or new.created_by<>old.created_by or new.created_at<>old.created_at) then raise exception 'Protected project finance fields cannot change' using errcode='42501'; end if;
 return new;
end $$;
drop trigger if exists studio_validate_project_finance_profile_trigger on public.studio_project_finance_profiles;
create trigger studio_validate_project_finance_profile_trigger before insert or update on public.studio_project_finance_profiles for each row execute function public.studio_validate_project_finance_profile();

alter table public.studio_project_finance_profiles enable row level security;
drop policy if exists studio_project_finance_profiles_select on public.studio_project_finance_profiles;
create policy studio_project_finance_profiles_select on public.studio_project_finance_profiles for select to authenticated using(public.studio_is_organization_member(organization_id));
drop policy if exists studio_project_finance_profiles_owner_insert on public.studio_project_finance_profiles;
create policy studio_project_finance_profiles_owner_insert on public.studio_project_finance_profiles for insert to authenticated with check(created_by=auth.uid() and updated_by=auth.uid() and public.studio_has_organization_role(organization_id,array['owner']));
drop policy if exists studio_project_finance_profiles_owner_update on public.studio_project_finance_profiles;
create policy studio_project_finance_profiles_owner_update on public.studio_project_finance_profiles for update to authenticated using(public.studio_has_organization_role(organization_id,array['owner'])) with check(updated_by=auth.uid() and public.studio_has_organization_role(organization_id,array['owner']));
grant select,insert,update on public.studio_project_finance_profiles to authenticated;
revoke delete on public.studio_project_finance_profiles from anon,authenticated;

commit;
