begin;
revoke all on public.studio_user_recent_items from authenticated;
revoke all on public.studio_user_favorites from authenticated;
drop table if exists public.studio_user_recent_items;
drop table if exists public.studio_user_favorites;
drop function if exists public.studio_validate_quick_access_entity();
drop function if exists public.studio_quick_access_entity_organization(text,uuid);
commit;
