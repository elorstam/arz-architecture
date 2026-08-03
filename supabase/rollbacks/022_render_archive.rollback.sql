begin;
-- AI usage enum expansion is deliberately retained so historical render usage remains valid.
revoke execute on function public.studio_initialize_render_categories(uuid,uuid) from authenticated;
revoke execute on function public.studio_set_hero_render(uuid,uuid,uuid) from authenticated;
revoke all on public.studio_render_events,public.studio_project_renders,public.studio_render_categories from authenticated;
drop table if exists public.studio_render_events;
drop function if exists public.studio_validate_render_event();
drop trigger if exists studio_validate_render_record on public.studio_project_renders;
drop table if exists public.studio_project_renders;
drop table if exists public.studio_render_categories;
drop function if exists public.studio_validate_render_record();
drop function if exists public.studio_set_hero_render(uuid,uuid,uuid);
drop function if exists public.studio_validate_render_category();
drop trigger if exists studio_seed_render_categories_for_project on public.studio_projects;
drop function if exists public.studio_seed_render_categories_for_project();
drop function if exists public.studio_initialize_render_categories(uuid,uuid);
drop function if exists public.studio_normalize_render_name(text);
commit;
