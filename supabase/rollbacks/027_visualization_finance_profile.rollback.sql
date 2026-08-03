begin;
-- Structural rollback only; no finance, render or project rows are deleted.
revoke all on public.studio_visualization_time_entries,public.studio_visualization_revisions from authenticated;
drop trigger if exists studio_validate_visualization_time_entry_trigger on public.studio_visualization_time_entries;
drop trigger if exists studio_validate_visualization_revision_trigger on public.studio_visualization_revisions;
drop function if exists public.studio_validate_visualization_time_entry();
drop function if exists public.studio_validate_visualization_revision();
commit;
