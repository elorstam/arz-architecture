begin;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('studio-thumbnails','studio-thumbnails',false,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create table if not exists public.studio_file_thumbnails(
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references public.organizations(id),
 logical_file_id uuid not null references public.studio_project_files(id),
 file_version_id uuid not null references public.studio_project_file_versions(id),
 thumbnail_storage_key text,
 width integer check(width is null or width between 1 and 4096),
 height integer check(height is null or height between 1 and 4096),
 mime_type text check(mime_type is null or mime_type in('image/jpeg','image/png','image/webp')),
 source_hash text not null check(char_length(source_hash) between 1 and 200),
 created_at timestamptz not null default now(),
 regenerated_at timestamptz,
 status text not null default 'pending' check(status in('pending','generating','ready','failed','unsupported')),
 unique(file_version_id),
 check((status='ready' and thumbnail_storage_key is not null and width is not null and height is not null and mime_type is not null) or status<>'ready'),
 check(thumbnail_storage_key is null or thumbnail_storage_key!~'(^|/)\.\.(/|$)')
);

create index if not exists studio_file_thumbnails_org_file_idx on public.studio_file_thumbnails(organization_id,logical_file_id);
create index if not exists studio_file_thumbnails_queue_idx on public.studio_file_thumbnails(organization_id,status,created_at) where status in('pending','failed');
create index if not exists studio_file_thumbnails_ready_idx on public.studio_file_thumbnails(file_version_id) where status='ready';

insert into public.studio_file_thumbnails(organization_id,logical_file_id,file_version_id,source_hash,status)
select v.organization_id,v.file_id,v.id,coalesce(v.provider_checksum,v.provider_version,v.external_modified_at::text,v.id::text),'pending'
from public.studio_project_file_versions v
where v.status='ready'
on conflict(file_version_id) do nothing;

create or replace function public.studio_validate_file_thumbnail() returns trigger language plpgsql set search_path=public as $$
declare version_row record;
begin
 select organization_id,file_id,status into version_row from public.studio_project_file_versions where id=new.file_version_id;
 if version_row.organization_id is null or version_row.organization_id<>new.organization_id or version_row.file_id<>new.logical_file_id then raise exception 'Thumbnail version identity mismatch' using errcode='23514'; end if;
 if version_row.status<>'ready' then raise exception 'Thumbnail source version is not ready' using errcode='23514'; end if;
 if tg_op='UPDATE' and (new.organization_id<>old.organization_id or new.logical_file_id<>old.logical_file_id or new.file_version_id<>old.file_version_id or new.created_at<>old.created_at) then raise exception 'Protected thumbnail fields cannot be changed' using errcode='42501'; end if;
 return new;
end $$;
drop trigger if exists studio_validate_file_thumbnail on public.studio_file_thumbnails;
create trigger studio_validate_file_thumbnail before insert or update on public.studio_file_thumbnails for each row execute function public.studio_validate_file_thumbnail();

alter table public.studio_file_thumbnails enable row level security;
drop policy if exists studio_file_thumbnails_select on public.studio_file_thumbnails;
drop policy if exists studio_file_thumbnails_owner_insert on public.studio_file_thumbnails;
drop policy if exists studio_file_thumbnails_owner_update on public.studio_file_thumbnails;
create policy studio_file_thumbnails_select on public.studio_file_thumbnails for select to authenticated using(public.studio_is_organization_member(organization_id));
create policy studio_file_thumbnails_owner_insert on public.studio_file_thumbnails for insert to authenticated with check(public.studio_has_organization_role(organization_id,array['owner']));
create policy studio_file_thumbnails_owner_update on public.studio_file_thumbnails for update to authenticated using(public.studio_has_organization_role(organization_id,array['owner'])) with check(public.studio_has_organization_role(organization_id,array['owner']));

drop policy if exists studio_thumbnails_member_read on storage.objects;
drop policy if exists studio_thumbnails_owner_insert on storage.objects;
drop policy if exists studio_thumbnails_owner_update on storage.objects;
create policy studio_thumbnails_member_read on storage.objects for select to authenticated using(bucket_id='studio-thumbnails' and exists(select 1 from public.organization_members m where m.organization_id=split_part(name,'/',1)::uuid and m.user_id=auth.uid() and m.status='active'));
create policy studio_thumbnails_owner_insert on storage.objects for insert to authenticated with check(bucket_id='studio-thumbnails' and exists(select 1 from public.organization_members m where m.organization_id=split_part(name,'/',1)::uuid and m.user_id=auth.uid() and m.status='active' and m.role='owner'));
create policy studio_thumbnails_owner_update on storage.objects for update to authenticated using(bucket_id='studio-thumbnails' and exists(select 1 from public.organization_members m where m.organization_id=split_part(name,'/',1)::uuid and m.user_id=auth.uid() and m.status='active' and m.role='owner')) with check(bucket_id='studio-thumbnails' and exists(select 1 from public.organization_members m where m.organization_id=split_part(name,'/',1)::uuid and m.user_id=auth.uid() and m.status='active' and m.role='owner'));

grant select,insert,update on public.studio_file_thumbnails to authenticated;
revoke delete on public.studio_file_thumbnails from anon,authenticated;
commit;
