begin;

alter table public.studio_project_files
 drop constraint if exists studio_project_files_initial_version_state_check,
 drop constraint if exists studio_project_files_file_size_check,
 drop constraint if exists studio_project_files_sync_status_check,
 add constraint studio_project_files_file_size_check check(file_size>0 and file_size<=6291456) not valid,
 add constraint studio_project_files_sync_status_check check(sync_status in('pending','synced','error')) not valid;

alter table public.studio_project_file_versions
 drop constraint if exists studio_project_file_versions_file_size_check,
 add constraint studio_project_file_versions_file_size_check check(file_size>0 and file_size<=262144000) not valid;

create or replace function public.studio_validate_current_version_pointer() returns trigger language plpgsql set search_path=public as $$
begin
 if new.current_version_id is not null and not exists(select 1 from public.studio_project_file_versions v where v.id=new.current_version_id and v.file_id=new.id and v.organization_id=new.organization_id and v.project_id=new.project_id and v.is_current=true and v.status='ready') then raise exception 'Current version pointer is inconsistent.'; end if;
 return new;
end $$;

drop trigger if exists studio_files_current_version_validate on public.studio_project_files;
create constraint trigger studio_files_current_version_validate after insert or update of current_version_id on public.studio_project_files deferrable initially deferred for each row execute function public.studio_validate_current_version_pointer();

notify pgrst,'reload schema';
commit;
