begin;

insert into storage.buckets(id,name,public,file_size_limit)
values('studio-files','studio-files',false,6291456)
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit;

create table if not exists public.studio_project_folders(
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references public.organizations(id) on delete cascade,
 project_id uuid not null references public.studio_projects(id) on delete cascade,
 parent_folder_id uuid null references public.studio_project_folders(id) on delete restrict,
 name text not null check(length(btrim(name)) between 1 and 120 and name!~'[\\/]'),
 normalized_name text not null check(length(normalized_name) between 1 and 120),
 sort_order integer not null default 0 check(sort_order>=0),
 is_system boolean not null default false,
 is_archived boolean not null default false,
 created_by uuid not null references public.profiles(id) on delete restrict,
 updated_by uuid not null references public.profiles(id) on delete restrict,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check(parent_folder_id is null or parent_folder_id<>id)
);

create table if not exists public.studio_project_files(
 id uuid primary key,
 organization_id uuid not null references public.organizations(id) on delete cascade,
 project_id uuid not null references public.studio_projects(id) on delete cascade,
 folder_id uuid null references public.studio_project_folders(id) on delete restrict,
 display_name text not null check(length(btrim(display_name)) between 1 and 240),
 original_file_name text not null check(length(btrim(original_file_name)) between 1 and 240),
 normalized_file_name text not null check(length(normalized_file_name) between 1 and 240),
 extension text not null check(extension=lower(extension) and extension~'^[a-z0-9]{1,10}$'),
 mime_type text not null check(length(btrim(mime_type)) between 1 and 150),
 file_size bigint not null check(file_size>0 and file_size<=6291456),
 storage_bucket text not null default 'studio-files' check(storage_bucket='studio-files'),
 storage_path text not null unique check(storage_path!~'(^|/)\.\.(/|$)'),
 storage_object_id text null,
 checksum_sha256 text null check(checksum_sha256 is null or checksum_sha256~'^[a-f0-9]{64}$'),
 description text null check(description is null or length(description)<=5000),
 category text not null check(category in('general','drawing','model','document','image','render','video','archive','spreadsheet','other')),
 status text not null default 'uploading' check(status in('uploading','ready','failed','quarantined')),
 is_archived boolean not null default false,
 uploaded_by uuid not null references public.profiles(id) on delete restrict,
 updated_by uuid not null references public.profiles(id) on delete restrict,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create unique index if not exists studio_folders_sibling_name_unique on public.studio_project_folders(project_id,coalesce(parent_folder_id,'00000000-0000-0000-0000-000000000000'::uuid),normalized_name) where is_archived=false;
create unique index if not exists studio_files_folder_name_unique on public.studio_project_files(project_id,coalesce(folder_id,'00000000-0000-0000-0000-000000000000'::uuid),normalized_file_name) where is_archived=false and status in('uploading','ready');
create index if not exists studio_folders_org_project_idx on public.studio_project_folders(organization_id,project_id,is_archived,sort_order);
create index if not exists studio_folders_parent_idx on public.studio_project_folders(parent_folder_id) where parent_folder_id is not null;
create index if not exists studio_files_org_project_idx on public.studio_project_files(organization_id,project_id,is_archived,created_at desc);
create index if not exists studio_files_folder_idx on public.studio_project_files(folder_id,is_archived);
create index if not exists studio_files_category_idx on public.studio_project_files(organization_id,category,status);

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

create or replace function public.studio_validate_project_file() returns trigger language plpgsql set search_path=public as $$
begin
 if tg_op='UPDATE' then
  if new.organization_id is distinct from old.organization_id or new.project_id is distinct from old.project_id or new.uploaded_by is distinct from old.uploaded_by or new.created_at is distinct from old.created_at or new.storage_bucket is distinct from old.storage_bucket or new.storage_path is distinct from old.storage_path or new.original_file_name is distinct from old.original_file_name or new.extension is distinct from old.extension or new.mime_type is distinct from old.mime_type or new.file_size is distinct from old.file_size then raise exception 'Controlled file fields cannot be changed.'; end if;
 end if;
 new.display_name=btrim(new.display_name); new.normalized_file_name=lower(regexp_replace(new.display_name,'\s+',' ','g'));
 if not exists(select 1 from public.studio_projects p where p.id=new.project_id and p.organization_id=new.organization_id) then raise exception 'File project must belong to organization.'; end if;
 if new.folder_id is not null and not exists(select 1 from public.studio_project_folders f where f.id=new.folder_id and f.project_id=new.project_id and f.organization_id=new.organization_id) then raise exception 'File folder must belong to same project.'; end if;
 if new.storage_path<>format('organizations/%s/projects/%s/files/%s/%s',new.organization_id,new.project_id,new.id,storage.filename(new.storage_path)) then raise exception 'Invalid controlled storage path.'; end if;
 new.updated_by=auth.uid(); return new;
end $$;

create trigger studio_folders_set_updated_at before update on public.studio_project_folders for each row execute function public.studio_set_updated_at();
create trigger studio_folders_validate before insert or update on public.studio_project_folders for each row execute function public.studio_validate_project_folder();
create trigger studio_files_set_updated_at before update on public.studio_project_files for each row execute function public.studio_set_updated_at();
create trigger studio_files_validate before insert or update on public.studio_project_files for each row execute function public.studio_validate_project_file();

create or replace function public.studio_initialize_project_folders(target_project_id uuid) returns void language plpgsql security definer set search_path=public as $$
declare org_id uuid;
begin
 select organization_id into org_id from public.studio_projects where id=target_project_id and public.studio_is_organization_member(organization_id);
 if org_id is null then raise exception 'Project not found.'; end if;
 insert into public.studio_project_folders(organization_id,project_id,name,normalized_name,sort_order,is_system,created_by,updated_by)
 select org_id,target_project_id,v.name,lower(v.name),v.sort_order,true,auth.uid(),auth.uid() from(values
 ('01 Proje',10),('02 Çizimler',20),('03 Modeller',30),('04 Dokümanlar',40),('05 Görseller',50),('06 Renderlar',60),('07 Sunumlar',70),('08 Arşiv',80)
 )v(name,sort_order)
 where not exists(select 1 from public.studio_project_folders f where f.project_id=target_project_id and f.parent_folder_id is null and f.normalized_name=lower(v.name));
end $$;

alter table public.studio_project_folders enable row level security;
alter table public.studio_project_files enable row level security;
create policy studio_folders_select_member on public.studio_project_folders for select to authenticated using(public.studio_is_organization_member(organization_id));
create policy studio_folders_insert_owner on public.studio_project_folders for insert to authenticated with check(public.studio_has_organization_role(organization_id,array['owner']) and created_by=auth.uid() and updated_by=auth.uid());
create policy studio_folders_update_owner on public.studio_project_folders for update to authenticated using(public.studio_has_organization_role(organization_id,array['owner'])) with check(public.studio_has_organization_role(organization_id,array['owner']));
create policy studio_files_select_member on public.studio_project_files for select to authenticated using(public.studio_is_organization_member(organization_id));
create policy studio_files_insert_owner on public.studio_project_files for insert to authenticated with check(public.studio_has_organization_role(organization_id,array['owner']) and uploaded_by=auth.uid() and updated_by=auth.uid());
create policy studio_files_update_owner on public.studio_project_files for update to authenticated using(public.studio_has_organization_role(organization_id,array['owner'])) with check(public.studio_has_organization_role(organization_id,array['owner']));

drop policy if exists studio_files_storage_select on storage.objects;
create policy studio_files_storage_select on storage.objects for select to authenticated using(bucket_id='studio-files' and (storage.foldername(name))[1]='organizations' and public.studio_is_organization_member(((storage.foldername(name))[2])::uuid) and exists(select 1 from public.studio_project_files f where f.storage_bucket=bucket_id and f.storage_path=name and f.status='ready'));
drop policy if exists studio_files_storage_insert on storage.objects;
create policy studio_files_storage_insert on storage.objects for insert to authenticated with check(bucket_id='studio-files' and (storage.foldername(name))[1]='organizations' and public.studio_has_organization_role(((storage.foldername(name))[2])::uuid,array['owner']) and exists(select 1 from public.studio_project_files f where f.storage_bucket=bucket_id and f.storage_path=name and f.status='uploading' and f.uploaded_by=auth.uid()));
drop policy if exists studio_files_storage_cleanup on storage.objects;
create policy studio_files_storage_cleanup on storage.objects for delete to authenticated using(bucket_id='studio-files' and exists(select 1 from public.studio_project_files f where f.storage_bucket=bucket_id and f.storage_path=name and f.status in('uploading','failed') and public.studio_has_organization_role(f.organization_id,array['owner'])));

grant select,insert,update on public.studio_project_folders,public.studio_project_files to authenticated;
revoke delete on public.studio_project_folders,public.studio_project_files from anon,authenticated;
revoke all on function public.studio_initialize_project_folders(uuid) from public,anon;
grant execute on function public.studio_initialize_project_folders(uuid) to authenticated;
notify pgrst,'reload schema';
commit;
