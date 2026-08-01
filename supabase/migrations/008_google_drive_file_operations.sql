begin;

alter table public.studio_project_files
 add column if not exists previous_folder_id uuid null references public.studio_project_folders(id) on delete restrict,
 add column if not exists previous_external_parent_folder_id text null,
 add column if not exists external_modified_at timestamptz null,
 add column if not exists sync_error_code text null;

alter table public.studio_project_folders
 add column if not exists previous_parent_folder_id uuid null references public.studio_project_folders(id) on delete restrict,
 add column if not exists previous_external_parent_folder_id text null,
 add column if not exists external_modified_at timestamptz null,
 add column if not exists sync_error_code text null;

create index if not exists studio_project_files_sync_error_idx
 on public.studio_project_files(organization_id,project_id,sync_status)
 where sync_status='error';

create index if not exists studio_project_folders_sync_error_idx
 on public.studio_project_folders(organization_id,project_id,sync_status)
 where sync_status='error';

create or replace function public.studio_validate_project_file() returns trigger language plpgsql set search_path=public as $$
begin
 if tg_op='UPDATE' then
  if new.organization_id is distinct from old.organization_id
   or new.project_id is distinct from old.project_id
   or new.uploaded_by is distinct from old.uploaded_by
   or new.created_at is distinct from old.created_at
   or new.storage_bucket is distinct from old.storage_bucket
   or new.storage_path is distinct from old.storage_path
   or new.extension is distinct from old.extension
   or new.mime_type is distinct from old.mime_type
   or new.file_size is distinct from old.file_size
   or (new.original_file_name is distinct from old.original_file_name and old.storage_provider<>'google_drive')
  then raise exception 'Controlled file fields cannot be changed.'; end if;
 end if;
 new.display_name=btrim(new.display_name);
 new.original_file_name=btrim(new.original_file_name);
 new.normalized_file_name=lower(regexp_replace(new.display_name,'\s+',' ','g'));
 if lower(storage.extension(new.original_file_name))<>new.extension then raise exception 'File extension cannot be changed.'; end if;
 if not exists(select 1 from public.studio_projects p where p.id=new.project_id and p.organization_id=new.organization_id) then raise exception 'File project must belong to organization.'; end if;
 if new.folder_id is not null and not exists(select 1 from public.studio_project_folders f where f.id=new.folder_id and f.project_id=new.project_id and f.organization_id=new.organization_id) then raise exception 'File folder must belong to same project.'; end if;
 if new.previous_folder_id is not null and not exists(select 1 from public.studio_project_folders f where f.id=new.previous_folder_id and f.project_id=new.project_id and f.organization_id=new.organization_id) then raise exception 'Previous file folder must belong to same project.'; end if;
 if new.storage_path<>format('organizations/%s/projects/%s/files/%s/%s',new.organization_id,new.project_id,new.id,storage.filename(new.storage_path)) and new.storage_provider='supabase' then raise exception 'Invalid controlled storage path.'; end if;
 new.updated_by=auth.uid(); return new;
end $$;

create or replace function public.studio_validate_project_folder() returns trigger language plpgsql set search_path=public as $$
declare cursor_id uuid; depth integer:=0;
begin
 new.name=btrim(new.name); new.normalized_name=lower(regexp_replace(new.name,'\s+',' ','g'));
 if new.name in('.','..') then raise exception 'Folder name is invalid.'; end if;
 if tg_op='UPDATE' then
  if new.organization_id is distinct from old.organization_id or new.project_id is distinct from old.project_id or new.created_by is distinct from old.created_by or new.created_at is distinct from old.created_at then raise exception 'Controlled folder fields cannot be changed.'; end if;
  if old.is_system and (new.name is distinct from old.name or new.parent_folder_id is distinct from old.parent_folder_id or new.is_archived is distinct from old.is_archived) then raise exception 'System folders cannot be changed.'; end if;
 end if;
 if not exists(select 1 from public.studio_projects p where p.id=new.project_id and p.organization_id=new.organization_id) then raise exception 'Folder project must belong to organization.'; end if;
 if new.previous_parent_folder_id is not null and not exists(select 1 from public.studio_project_folders f where f.id=new.previous_parent_folder_id and f.project_id=new.project_id and f.organization_id=new.organization_id) then raise exception 'Previous folder parent must belong to same project.'; end if;
 if new.parent_folder_id is not null then
  if new.parent_folder_id=new.id then raise exception 'Folder cannot parent itself.'; end if;
  if not exists(select 1 from public.studio_project_folders f where f.id=new.parent_folder_id and f.project_id=new.project_id and f.organization_id=new.organization_id) then raise exception 'Parent folder must belong to same project.'; end if;
  cursor_id:=new.parent_folder_id;
  while cursor_id is not null loop
   if cursor_id=new.id then raise exception 'Folder cycle detected.'; end if;
   select parent_folder_id into cursor_id from public.studio_project_folders where id=cursor_id;
   depth:=depth+1; if depth>32 then raise exception 'Folder hierarchy is too deep.'; end if;
  end loop;
 end if;
 new.updated_by=auth.uid(); return new;
end $$;

notify pgrst,'reload schema';
commit;
