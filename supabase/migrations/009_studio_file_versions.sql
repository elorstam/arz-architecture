begin;

create table if not exists public.studio_project_file_versions(
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references public.organizations(id) on delete cascade,
 project_id uuid not null references public.studio_projects(id) on delete cascade,
 file_id uuid not null references public.studio_project_files(id) on delete restrict,
 version_number integer not null check(version_number>=1),
 revision_code text null check(revision_code is null or length(revision_code)<=40),
 revision_title text null check(revision_title is null or length(revision_title)<=160),
 revision_note text null check(revision_note is null or length(revision_note)<=4000),
 revision_reason text not null default 'initial' check(revision_reason in('initial','design_change','client_request','municipality_request','technical_update','coordination','correction','final','rollback','other')),
 source_version_id uuid null references public.studio_project_file_versions(id) on delete restrict,
 is_current boolean not null default false,
 status text not null default 'uploading' check(status in('uploading','ready','failed','action_required')),
 storage_provider text not null check(storage_provider in('supabase','google_drive')),
 storage_bucket text null,
 storage_path text null,
 external_file_id text null,
 external_parent_folder_id text null,
 original_file_name text not null check(length(btrim(original_file_name)) between 1 and 240),
 normalized_file_name text not null check(length(normalized_file_name) between 1 and 240),
 extension text not null check(extension=lower(extension) and extension~'^[a-z0-9]{1,10}$'),
 mime_type text not null check(length(btrim(mime_type)) between 1 and 150),
 file_size bigint not null check(file_size>0 and file_size<=262144000),
 provider_checksum text null,
 provider_version text null,
 external_modified_at timestamptz null,
 sync_status text not null default 'pending' check(sync_status in('pending','synced','error','action_required')),
 sync_error_code text null,
 uploaded_by uuid not null references public.profiles(id) on delete restrict,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(file_id,version_number)
);

alter table public.studio_project_files
 add column if not exists current_version_id uuid null,
 add column if not exists version_count integer not null default 0 check(version_count>=0),
 add column if not exists latest_version_number integer not null default 0 check(latest_version_number>=0);

insert into public.studio_project_file_versions(
 id,organization_id,project_id,file_id,version_number,revision_title,revision_reason,is_current,status,
 storage_provider,storage_bucket,storage_path,external_file_id,external_parent_folder_id,original_file_name,
 normalized_file_name,extension,mime_type,file_size,provider_checksum,provider_version,external_modified_at,
 sync_status,sync_error_code,uploaded_by,created_at,updated_at
)
select gen_random_uuid(),f.organization_id,f.project_id,f.id,1,'İlk sürüm','initial',true,'ready',
 f.storage_provider,f.storage_bucket,f.storage_path,f.external_file_id,f.external_parent_folder_id,f.original_file_name,
 f.normalized_file_name,f.extension,f.mime_type,f.file_size,f.provider_checksum,f.provider_version,f.external_modified_at,
 f.sync_status,f.sync_error_code,f.uploaded_by,f.created_at,f.updated_at
from public.studio_project_files f
where f.status='ready'
 and (f.storage_provider='supabase' or (f.storage_provider='google_drive' and f.external_file_id is not null))
 and not exists(select 1 from public.studio_project_file_versions v where v.file_id=f.id and v.version_number=1);

update public.studio_project_files f set
 current_version_id=v.id,version_count=1,latest_version_number=1
from public.studio_project_file_versions v
where v.file_id=f.id and v.version_number=1 and v.is_current=true and f.current_version_id is null;

alter table public.studio_project_files
 add constraint studio_project_files_current_version_fkey foreign key(current_version_id) references public.studio_project_file_versions(id) on delete restrict;

create unique index if not exists studio_file_versions_one_current_idx on public.studio_project_file_versions(file_id) where is_current=true;
create index if not exists studio_file_versions_org_idx on public.studio_project_file_versions(organization_id,created_at desc);
create index if not exists studio_file_versions_project_idx on public.studio_project_file_versions(project_id,created_at desc);
create index if not exists studio_file_versions_file_idx on public.studio_project_file_versions(file_id,version_number desc);
create index if not exists studio_file_versions_status_idx on public.studio_project_file_versions(organization_id,status,sync_status);
create index if not exists studio_file_versions_current_idx on public.studio_project_file_versions(file_id,is_current);

create or replace function public.studio_validate_file_version() returns trigger language plpgsql set search_path=public as $$
declare master public.studio_project_files; source_row public.studio_project_file_versions;
begin
 select * into master from public.studio_project_files where id=new.file_id;
 if master.id is null or master.organization_id<>new.organization_id or master.project_id<>new.project_id then raise exception 'Version must belong to the same logical file organization and project.'; end if;
 if new.source_version_id is not null then select * into source_row from public.studio_project_file_versions where id=new.source_version_id; if source_row.id is null or source_row.file_id<>new.file_id then raise exception 'Source version must belong to the same logical file.'; end if; end if;
 new.revision_code=nullif(btrim(new.revision_code),''); new.revision_title=nullif(btrim(new.revision_title),''); new.revision_note=nullif(btrim(new.revision_note),'');
 new.original_file_name=btrim(new.original_file_name); new.normalized_file_name=lower(regexp_replace(new.original_file_name,'\s+',' ','g'));
 if tg_op='UPDATE' then
  if new.organization_id is distinct from old.organization_id or new.project_id is distinct from old.project_id or new.file_id is distinct from old.file_id or new.version_number is distinct from old.version_number or new.revision_code is distinct from old.revision_code or new.revision_title is distinct from old.revision_title or new.revision_note is distinct from old.revision_note or new.revision_reason is distinct from old.revision_reason or new.source_version_id is distinct from old.source_version_id or new.storage_provider is distinct from old.storage_provider or new.storage_bucket is distinct from old.storage_bucket or new.storage_path is distinct from old.storage_path or new.original_file_name is distinct from old.original_file_name or new.extension is distinct from old.extension or new.mime_type is distinct from old.mime_type or new.file_size is distinct from old.file_size or new.uploaded_by is distinct from old.uploaded_by or new.created_at is distinct from old.created_at then raise exception 'Immutable version fields cannot be changed.'; end if;
  if old.status='ready' and (new.status<>'ready' or new.external_file_id is distinct from old.external_file_id) then raise exception 'Ready version history is immutable.'; end if;
 end if;
 new.updated_at=now(); return new;
end $$;

create trigger studio_file_versions_validate before insert or update on public.studio_project_file_versions for each row execute function public.studio_validate_file_version();

create or replace function public.studio_reserve_file_version(target_file_id uuid,target_original_name text,target_mime_type text,target_file_size bigint,target_revision_code text,target_revision_title text,target_revision_note text,target_revision_reason text,target_source_version_id uuid default null)
returns table(version_id uuid,version_number integer) language plpgsql security invoker set search_path=public as $$
declare master public.studio_project_files; next_number integer; new_id uuid:=gen_random_uuid();
begin
 select * into master from public.studio_project_files where id=target_file_id for update;
 if master.id is null then raise exception 'Logical file not found.'; end if;
 if not public.studio_has_organization_role(master.organization_id,array['owner']) then raise exception 'Owner access required.'; end if;
 if master.is_archived then raise exception 'Archived file cannot receive a new version.'; end if;
 if lower(storage.extension(target_original_name))<>master.extension then raise exception 'Version extension must match logical file.'; end if;
 next_number:=greatest(master.latest_version_number,coalesce((select max(v.version_number) from public.studio_project_file_versions v where v.file_id=master.id),0))+1;
 insert into public.studio_project_file_versions(id,organization_id,project_id,file_id,version_number,revision_code,revision_title,revision_note,revision_reason,source_version_id,status,storage_provider,external_parent_folder_id,original_file_name,normalized_file_name,extension,mime_type,file_size,uploaded_by)
 values(new_id,master.organization_id,master.project_id,master.id,next_number,target_revision_code,target_revision_title,target_revision_note,target_revision_reason,target_source_version_id,'uploading','google_drive',master.external_parent_folder_id,target_original_name,lower(regexp_replace(btrim(target_original_name),'\s+',' ','g')),master.extension,target_mime_type,target_file_size,auth.uid());
 update public.studio_project_files set latest_version_number=next_number where id=master.id;
 return query select new_id,next_number;
end $$;

create or replace function public.studio_finalize_file_version(target_version_id uuid,target_external_file_id text,target_checksum text,target_provider_version text,target_external_modified_at timestamptz)
returns void language plpgsql security invoker set search_path=public as $$
declare version_row public.studio_project_file_versions; master public.studio_project_files;
begin
 select * into version_row from public.studio_project_file_versions where id=target_version_id for update;
 if version_row.id is null then raise exception 'Version not found.'; end if;
 select * into master from public.studio_project_files where id=version_row.file_id for update;
 if not public.studio_has_organization_role(master.organization_id,array['owner']) then raise exception 'Owner access required.'; end if;
 if version_row.status='ready' and version_row.external_file_id=target_external_file_id then return; end if;
 if version_row.status not in('uploading','action_required') then raise exception 'Version cannot be finalized.'; end if;
 update public.studio_project_file_versions set is_current=false where file_id=master.id and is_current=true;
 update public.studio_project_file_versions set external_file_id=target_external_file_id,provider_checksum=target_checksum,provider_version=target_provider_version,external_modified_at=target_external_modified_at,status='ready',sync_status='synced',sync_error_code=null,is_current=true where id=version_row.id;
 update public.studio_project_files set current_version_id=version_row.id,version_count=(select count(*) from public.studio_project_file_versions where file_id=master.id and status='ready'),original_file_name=version_row.original_file_name,normalized_file_name=version_row.normalized_file_name,mime_type=version_row.mime_type,file_size=version_row.file_size,external_file_id=target_external_file_id,provider_checksum=target_checksum,provider_version=target_provider_version,external_modified_at=target_external_modified_at,sync_status='synced',sync_error_code=null,last_synced_at=now() where id=master.id;
end $$;

create or replace function public.studio_finalize_initial_file_version(target_file_id uuid,target_external_file_id text,target_physical_name text,target_checksum text,target_provider_version text,target_external_modified_at timestamptz)
returns void language plpgsql security invoker set search_path=public as $$
declare master public.studio_project_files; new_version_id uuid:=gen_random_uuid();
begin
 select * into master from public.studio_project_files where id=target_file_id for update;
 if master.id is null then raise exception 'Logical file not found.'; end if;
 if not public.studio_has_organization_role(master.organization_id,array['owner']) then raise exception 'Owner access required.'; end if;
 if master.current_version_id is not null then return; end if;
 insert into public.studio_project_file_versions(id,organization_id,project_id,file_id,version_number,revision_title,revision_reason,is_current,status,storage_provider,storage_bucket,storage_path,external_file_id,external_parent_folder_id,original_file_name,normalized_file_name,extension,mime_type,file_size,provider_checksum,provider_version,external_modified_at,sync_status,uploaded_by,created_at)
 values(new_version_id,master.organization_id,master.project_id,master.id,1,'İlk sürüm','initial',true,'ready',master.storage_provider,master.storage_bucket,master.storage_path,target_external_file_id,master.external_parent_folder_id,target_physical_name,lower(regexp_replace(target_physical_name,'\s+',' ','g')),master.extension,master.mime_type,master.file_size,target_checksum,target_provider_version,target_external_modified_at,'synced',master.uploaded_by,master.created_at);
 update public.studio_project_files set status='ready',current_version_id=new_version_id,version_count=1,latest_version_number=1,original_file_name=target_physical_name,normalized_file_name=lower(regexp_replace(target_physical_name,'\s+',' ','g')),external_file_id=target_external_file_id,provider_checksum=target_checksum,provider_version=target_provider_version,external_modified_at=target_external_modified_at,sync_status='synced',sync_error_code=null,last_synced_at=now() where id=master.id;
end $$;

create or replace function public.studio_validate_current_version_pointer() returns trigger language plpgsql set search_path=public as $$
begin
 if new.current_version_id is not null and not exists(select 1 from public.studio_project_file_versions v where v.id=new.current_version_id and v.file_id=new.id and v.organization_id=new.organization_id and v.project_id=new.project_id and v.is_current=true and v.status='ready') then raise exception 'Current version pointer is inconsistent.'; end if;
 return new;
end $$;
create constraint trigger studio_files_current_version_validate after insert or update of current_version_id on public.studio_project_files deferrable initially deferred for each row execute function public.studio_validate_current_version_pointer();

create or replace function public.studio_validate_version_current_state() returns trigger language plpgsql set search_path=public as $$
begin
 if exists(select 1 from public.studio_project_files f where f.id=new.file_id and (f.current_version_id is distinct from (select v.id from public.studio_project_file_versions v where v.file_id=new.file_id and v.is_current=true and v.status='ready'))) then raise exception 'Version current state is inconsistent with logical file.'; end if;
 return new;
end $$;
create constraint trigger studio_versions_current_state_validate after insert or update of is_current,status on public.studio_project_file_versions deferrable initially deferred for each row execute function public.studio_validate_version_current_state();

alter table public.studio_project_file_versions enable row level security;
create policy studio_file_versions_select_member on public.studio_project_file_versions for select to authenticated using(public.studio_is_organization_member(organization_id) and exists(select 1 from public.studio_project_files f where f.id=file_id and f.organization_id=organization_id and f.project_id=project_id));
create policy studio_file_versions_insert_owner on public.studio_project_file_versions for insert to authenticated with check(public.studio_has_organization_role(organization_id,array['owner']) and uploaded_by=auth.uid());
create policy studio_file_versions_update_owner on public.studio_project_file_versions for update to authenticated using(public.studio_has_organization_role(organization_id,array['owner'])) with check(public.studio_has_organization_role(organization_id,array['owner']));
grant select,insert,update on public.studio_project_file_versions to authenticated;
revoke delete on public.studio_project_file_versions from anon,authenticated;
revoke all on function public.studio_reserve_file_version(uuid,text,text,bigint,text,text,text,text,uuid) from public,anon;
grant execute on function public.studio_reserve_file_version(uuid,text,text,bigint,text,text,text,text,uuid) to authenticated;
revoke all on function public.studio_finalize_file_version(uuid,text,text,text,timestamptz) from public,anon;
grant execute on function public.studio_finalize_file_version(uuid,text,text,text,timestamptz) to authenticated;
revoke all on function public.studio_finalize_initial_file_version(uuid,text,text,text,text,timestamptz) from public,anon;
grant execute on function public.studio_finalize_initial_file_version(uuid,text,text,text,text,timestamptz) to authenticated;
notify pgrst,'reload schema';
commit;
