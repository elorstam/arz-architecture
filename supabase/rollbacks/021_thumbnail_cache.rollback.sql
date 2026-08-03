begin;
drop policy if exists studio_thumbnails_member_read on storage.objects;
drop policy if exists studio_thumbnails_owner_insert on storage.objects;
drop policy if exists studio_thumbnails_owner_update on storage.objects;
revoke all on public.studio_file_thumbnails from authenticated;
drop table if exists public.studio_file_thumbnails;
drop function if exists public.studio_validate_file_thumbnail();
-- The private bucket and its objects are deliberately retained to avoid destructive rollback.
commit;
