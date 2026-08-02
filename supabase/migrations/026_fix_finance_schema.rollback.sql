begin;
-- Structural rollback only. Preserve existing data and never drop live tables.
drop index if exists public.studio_finance_entries_receipt_file_idx;
drop index if exists public.studio_finance_entries_invoice_file_idx;
drop trigger if exists studio_validate_project_finance_documents_trigger on public.studio_finance_entries;
drop trigger if exists studio_validate_project_finance_profile_trigger on public.studio_project_finance_profiles;
drop function if exists public.studio_validate_project_finance_documents();
drop function if exists public.studio_validate_project_finance_profile();
commit;
