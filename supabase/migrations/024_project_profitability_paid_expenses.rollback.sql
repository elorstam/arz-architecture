begin;

drop index if exists public.studio_finance_entries_paid_amount_idx;
drop index if exists public.studio_finance_expenses_project_status_idx;
alter table public.studio_finance_entries drop column if exists paid_amount;

commit;
