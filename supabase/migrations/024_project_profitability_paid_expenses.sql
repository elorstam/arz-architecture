begin;

alter table public.studio_finance_entries
  add column if not exists paid_amount numeric(16,2) not null default 0
  check(paid_amount>=0 and paid_amount<=amount);

create index if not exists studio_finance_expenses_project_status_idx
  on public.studio_finance_entries(organization_id,project_id,status,entry_date desc)
  where entry_type='expense' and is_archived=false;

create index if not exists studio_finance_entries_paid_amount_idx
  on public.studio_finance_entries(organization_id,project_id,paid_amount)
  where entry_type='expense' and is_archived=false;

commit;
