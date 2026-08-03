begin;
drop trigger if exists studio_validate_stage_scope_trigger on public.studio_project_stages;
create trigger studio_validate_stage_scope_trigger before insert or update on public.studio_project_stages for each row execute function public.studio_validate_stage_scope();
drop function if exists public.studio_initialize_project_stages(uuid,uuid);
commit;
