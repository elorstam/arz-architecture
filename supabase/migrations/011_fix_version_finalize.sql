begin;
create or replace function public.studio_validate_project_file() returns trigger language plpgsql set search_path=public as $$
declare version_finalize boolean:=coalesce(current_setting('app.studio_version_finalize',true),'')='1';
begin
 if tg_op='UPDATE' then
  if new.organization_id is distinct from old.organization_id or new.project_id is distinct from old.project_id or new.uploaded_by is distinct from old.uploaded_by or new.created_at is distinct from old.created_at or new.storage_bucket is distinct from old.storage_bucket or new.storage_path is distinct from old.storage_path or new.extension is distinct from old.extension or (new.mime_type is distinct from old.mime_type and not version_finalize) or (new.file_size is distinct from old.file_size and not version_finalize) or (new.original_file_name is distinct from old.original_file_name and old.storage_provider<>'google_drive') then raise exception 'Controlled file fields cannot be changed.'; end if;
 end if;
 new.display_name=btrim(new.display_name); new.original_file_name=btrim(new.original_file_name); new.normalized_file_name=lower(regexp_replace(new.display_name,'\s+',' ','g'));
 if lower(storage.extension(new.original_file_name))<>new.extension then raise exception 'File extension cannot be changed.'; end if;
 if not exists(select 1 from public.studio_projects p where p.id=new.project_id and p.organization_id=new.organization_id) then raise exception 'File project must belong to organization.'; end if;
 if new.folder_id is not null and not exists(select 1 from public.studio_project_folders f where f.id=new.folder_id and f.project_id=new.project_id and f.organization_id=new.organization_id) then raise exception 'File folder must belong to same project.'; end if;
 if new.previous_folder_id is not null and not exists(select 1 from public.studio_project_folders f where f.id=new.previous_folder_id and f.project_id=new.project_id and f.organization_id=new.organization_id) then raise exception 'Previous file folder must belong to same project.'; end if;
 if new.storage_path<>format('organizations/%s/projects/%s/files/%s/%s',new.organization_id,new.project_id,new.id,storage.filename(new.storage_path)) and new.storage_provider='supabase' then raise exception 'Invalid controlled storage path.'; end if;
 new.updated_by=auth.uid(); return new;
end $$;

create or replace function public.studio_finalize_file_version(target_version_id uuid,target_external_file_id text,target_checksum text,target_provider_version text,target_external_modified_at timestamptz)
returns void language plpgsql security invoker set search_path=public as $$
declare version_row public.studio_project_file_versions; master public.studio_project_files;
begin
 select * into version_row from public.studio_project_file_versions where id=target_version_id for update;
 if version_row.id is null then raise exception 'Version not found.'; end if;
 select * into master from public.studio_project_files where id=version_row.file_id for update;
 if not public.studio_has_organization_role(master.organization_id,array['owner']) then raise exception 'Owner access required.'; end if;
 if version_row.status='ready' and version_row.external_file_id=target_external_file_id and master.current_version_id=version_row.id then return; end if;
 if version_row.status not in('uploading','action_required') then raise exception 'Version cannot be finalized.'; end if;
 perform set_config('app.studio_version_finalize','1',true);
 update public.studio_project_file_versions set is_current=false where file_id=master.id and is_current=true;
 update public.studio_project_file_versions set external_file_id=target_external_file_id,provider_checksum=target_checksum,provider_version=target_provider_version,external_modified_at=target_external_modified_at,status='ready',sync_status='synced',sync_error_code=null,is_current=true where id=version_row.id;
 update public.studio_project_files set status='ready',current_version_id=version_row.id,version_count=(select count(*) from public.studio_project_file_versions where file_id=master.id and status='ready'),latest_version_number=greatest(latest_version_number,version_row.version_number),original_file_name=version_row.original_file_name,normalized_file_name=version_row.normalized_file_name,mime_type=version_row.mime_type,file_size=version_row.file_size,external_file_id=target_external_file_id,provider_checksum=target_checksum,provider_version=target_provider_version,external_modified_at=target_external_modified_at,sync_status='synced',sync_error_code=null,last_synced_at=now() where id=master.id;
end $$;
revoke all on function public.studio_finalize_file_version(uuid,text,text,text,timestamptz) from public,anon;
grant execute on function public.studio_finalize_file_version(uuid,text,text,text,timestamptz) to authenticated;
notify pgrst,'reload schema';
commit;
