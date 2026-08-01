begin;

-- Drive uploads are validated by category in the application up to 5 GiB.
-- Migration 005's original 6 MiB logical-row limit predates direct Drive upload.
alter table public.studio_project_files
 drop constraint if exists studio_project_files_file_size_check,
 add constraint studio_project_files_file_size_check check(file_size>0 and file_size<=5368709120);

alter table public.studio_project_file_versions
 drop constraint if exists studio_project_file_versions_file_size_check,
 add constraint studio_project_file_versions_file_size_check check(file_size>0 and file_size<=5368709120);

alter table public.studio_project_files
 drop constraint if exists studio_project_files_sync_status_check,
 drop constraint if exists studio_project_files_initial_version_state_check,
 add constraint studio_project_files_sync_status_check check(sync_status in('pending','synced','error','action_required')),
 add constraint studio_project_files_initial_version_state_check
 check(status<>'uploading' or (current_version_id is null and version_count=0 and latest_version_number=0));

create or replace function public.studio_validate_current_version_pointer() returns trigger language plpgsql set search_path=public as $$
begin
 if new.status='uploading' then
  if new.current_version_id is not null or new.version_count<>0 or new.latest_version_number<>0 then raise exception 'Uploading logical file cannot have a current version.'; end if;
 elsif new.status='ready' then
  if new.current_version_id is null or not exists(select 1 from public.studio_project_file_versions v where v.id=new.current_version_id and v.file_id=new.id and v.organization_id=new.organization_id and v.project_id=new.project_id and v.is_current=true and v.status='ready') then raise exception 'Ready logical file must have one consistent current version.'; end if;
 elsif new.current_version_id is not null and not exists(select 1 from public.studio_project_file_versions v where v.id=new.current_version_id and v.file_id=new.id and v.organization_id=new.organization_id and v.project_id=new.project_id and v.is_current=true and v.status='ready') then
  raise exception 'Current version pointer is inconsistent.';
 end if;
 return new;
end $$;

drop trigger if exists studio_files_current_version_validate on public.studio_project_files;
create constraint trigger studio_files_current_version_validate after insert or update of current_version_id,status,version_count,latest_version_number on public.studio_project_files deferrable initially deferred for each row execute function public.studio_validate_current_version_pointer();

grant select,insert,update on public.studio_project_files to authenticated;
revoke delete on public.studio_project_files from anon,authenticated;
notify pgrst,'reload schema';
commit;
