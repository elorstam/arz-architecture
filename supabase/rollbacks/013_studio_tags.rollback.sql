begin;
drop table if exists public.studio_tag_assignments;
drop table if exists public.studio_tags;
drop function if exists public.studio_validate_tag_assignment();
drop function if exists public.studio_can_access_tag_entity(text,uuid,uuid);
drop function if exists public.studio_prepare_tag();
drop function if exists public.studio_normalize_tag_name(text);
commit;
