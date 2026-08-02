begin;

alter table public.studio_ai_usage_events drop constraint if exists studio_ai_usage_events_operation_check;
alter table public.studio_ai_usage_events
  add constraint studio_ai_usage_events_operation_check
  check (operation in (
    'fee_ai_whatsapp_message','stage_ai_description','crm_ai_meeting_note',
    'proposal_ai_description','decision_ai_summary','render_description',
    'render_analysis','finance_summary','payment_reminder','invoice_description',
    'progress_payment','cashflow_summary','project_expense_description',
    'visualization_finance_summary','visualization_expense_description',
    'visualization_profitability_insight'
  ));
alter table public.studio_finance_entries drop constraint if exists studio_finance_entries_category_check;
alter table public.studio_finance_entries add constraint studio_finance_entries_category_check check(category in('project_fee','municipal_fee','building_inspection','personnel','office','software','advertising','tax','social_security','electricity','water','internet','vehicle','fuel','other','progress_payment','invoice','statik','mekanik','elektrik','zemin_etud','yapi_denetim','ozalit','belediye','harc','noter','ulasim','render_farm','freelance_modelleme','freelance_render','asset_model','texture_material','stock_visual','ai_credits','software_license','plugin','animation','video_editing','sound_license','hardware_rental','outsourced_service'));

-- Visualization finance uses the existing finance, payment, render and file
-- records. These tables contain only the profile-specific time/revision data.
alter table public.studio_project_finance_profiles
  add column if not exists included_revision_count integer not null default 0,
  add column if not exists extra_revision_unit_price numeric(16,2) not null default 0;

do $$ begin
  if not exists(select 1 from pg_constraint where conname='studio_project_finance_profiles_revision_count_check') then
    alter table public.studio_project_finance_profiles add constraint studio_project_finance_profiles_revision_count_check check(included_revision_count>=0) not valid;
  end if;
  if not exists(select 1 from pg_constraint where conname='studio_project_finance_profiles_revision_price_check') then
    alter table public.studio_project_finance_profiles add constraint studio_project_finance_profiles_revision_price_check check(extra_revision_unit_price>=0) not valid;
  end if;
end $$;

create table if not exists public.studio_visualization_time_entries(
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  project_id uuid not null references public.studio_projects(id),
  user_id uuid not null references auth.users(id),
  work_type text not null check(char_length(btrim(work_type)) between 2 and 80),
  duration_minutes integer not null check(duration_minutes>0 and duration_minutes<=1440),
  work_date date not null default current_date,
  description text check(description is null or char_length(description)<=2000),
  render_id uuid references public.studio_project_renders(id),
  created_at timestamptz not null default now(),
  archived_at timestamptz
);

create table if not exists public.studio_visualization_revisions(
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  project_id uuid not null references public.studio_projects(id),
  revision_number integer not null check(revision_number>0),
  requested_at date not null default current_date,
  description text not null check(char_length(btrim(description)) between 2 and 3000),
  is_included boolean not null default true,
  amount numeric(16,2) not null default 0 check(amount>=0),
  status text not null default 'requested' check(status in('requested','completed','cancelled')),
  render_id uuid references public.studio_project_renders(id),
  file_version_id uuid references public.studio_project_file_versions(id),
  finance_entry_id uuid references public.studio_finance_entries(id),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  archived_at timestamptz
);

create unique index if not exists studio_visualization_time_entries_id_project_unique on public.studio_visualization_time_entries(id,project_id);
create index if not exists studio_visualization_time_entries_project_idx on public.studio_visualization_time_entries(organization_id,project_id,work_date desc) where archived_at is null;
create unique index if not exists studio_visualization_revisions_project_number_unique on public.studio_visualization_revisions(organization_id,project_id,revision_number) where archived_at is null;
create index if not exists studio_visualization_revisions_project_idx on public.studio_visualization_revisions(organization_id,project_id,requested_at desc) where archived_at is null;

create or replace function public.studio_validate_visualization_time_entry() returns trigger language plpgsql set search_path=public as $$
begin
  if not exists(select 1 from public.studio_projects p where p.id=new.project_id and p.organization_id=new.organization_id) then raise exception 'Visualization project scope mismatch' using errcode='23514'; end if;
  if new.render_id is not null and not exists(select 1 from public.studio_project_renders r where r.id=new.render_id and r.project_id=new.project_id and r.organization_id=new.organization_id and r.archived_at is null) then raise exception 'Visualization render scope mismatch' using errcode='23514'; end if;
  return new;
end $$;
drop trigger if exists studio_validate_visualization_time_entry_trigger on public.studio_visualization_time_entries;
create trigger studio_validate_visualization_time_entry_trigger before insert or update on public.studio_visualization_time_entries for each row execute function public.studio_validate_visualization_time_entry();

create or replace function public.studio_validate_visualization_revision() returns trigger language plpgsql set search_path=public as $$
begin
  if not exists(select 1 from public.studio_projects p where p.id=new.project_id and p.organization_id=new.organization_id) then raise exception 'Visualization project scope mismatch' using errcode='23514'; end if;
  if new.render_id is not null and not exists(select 1 from public.studio_project_renders r where r.id=new.render_id and r.project_id=new.project_id and r.organization_id=new.organization_id and r.archived_at is null) then raise exception 'Visualization render scope mismatch' using errcode='23514'; end if;
  return new;
end $$;
drop trigger if exists studio_validate_visualization_revision_trigger on public.studio_visualization_revisions;
create trigger studio_validate_visualization_revision_trigger before insert or update on public.studio_visualization_revisions for each row execute function public.studio_validate_visualization_revision();

alter table public.studio_visualization_time_entries enable row level security;
alter table public.studio_visualization_revisions enable row level security;
do $$ begin
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='studio_visualization_time_entries' and policyname='studio_visualization_time_entries_select') then
    create policy studio_visualization_time_entries_select on public.studio_visualization_time_entries for select to authenticated using(public.studio_is_organization_member(organization_id));
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='studio_visualization_time_entries' and policyname='studio_visualization_time_entries_owner_insert') then
    create policy studio_visualization_time_entries_owner_insert on public.studio_visualization_time_entries for insert to authenticated with check(public.studio_has_organization_role(organization_id,array['owner']) and user_id=auth.uid());
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='studio_visualization_time_entries' and policyname='studio_visualization_time_entries_owner_update') then
    create policy studio_visualization_time_entries_owner_update on public.studio_visualization_time_entries for update to authenticated using(public.studio_has_organization_role(organization_id,array['owner'])) with check(public.studio_has_organization_role(organization_id,array['owner']));
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='studio_visualization_revisions' and policyname='studio_visualization_revisions_select') then
    create policy studio_visualization_revisions_select on public.studio_visualization_revisions for select to authenticated using(public.studio_is_organization_member(organization_id));
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='studio_visualization_revisions' and policyname='studio_visualization_revisions_owner_insert') then
    create policy studio_visualization_revisions_owner_insert on public.studio_visualization_revisions for insert to authenticated with check(public.studio_has_organization_role(organization_id,array['owner']) and created_by=auth.uid());
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='studio_visualization_revisions' and policyname='studio_visualization_revisions_owner_update') then
    create policy studio_visualization_revisions_owner_update on public.studio_visualization_revisions for update to authenticated using(public.studio_has_organization_role(organization_id,array['owner'])) with check(public.studio_has_organization_role(organization_id,array['owner']));
  end if;
end $$;
grant select,insert,update on public.studio_visualization_time_entries,public.studio_visualization_revisions to authenticated;
revoke delete on public.studio_visualization_time_entries,public.studio_visualization_revisions from anon,authenticated;
notify pgrst,'reload schema';
commit;
