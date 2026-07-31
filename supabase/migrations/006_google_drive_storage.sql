begin;
create table if not exists public.studio_storage_connections (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id), provider text not null default 'google_drive' check(provider='google_drive'), account_email text, provider_account_id text, encrypted_access_token text, encrypted_refresh_token text, access_token_expires_at timestamptz, root_folder_id text, root_folder_name text, status text not null default 'disconnected' check(status in ('connected','disconnected','error','reauthorization_required')), last_connected_at timestamptz, last_verified_at timestamptz, last_error_code text, created_by uuid not null references auth.users(id), updated_by uuid not null references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(organization_id,provider)
);
alter table public.studio_project_folders add column if not exists storage_provider text not null default 'supabase' check(storage_provider in ('supabase','google_drive'));
alter table public.studio_project_folders add column if not exists external_folder_id text;
alter table public.studio_project_folders add column if not exists external_parent_folder_id text;
alter table public.studio_project_folders add column if not exists sync_status text not null default 'pending' check(sync_status in ('pending','synced','error'));
alter table public.studio_project_folders add column if not exists last_synced_at timestamptz;
alter table public.studio_project_files add column if not exists storage_provider text not null default 'supabase' check(storage_provider in ('supabase','google_drive'));
alter table public.studio_project_files add column if not exists external_file_id text;
alter table public.studio_project_files add column if not exists external_parent_folder_id text;
alter table public.studio_project_files add column if not exists external_web_view_link text;
alter table public.studio_project_files add column if not exists provider_checksum text;
alter table public.studio_project_files add column if not exists provider_version text;
alter table public.studio_project_files add column if not exists sync_status text not null default 'pending' check(sync_status in ('pending','synced','error'));
alter table public.studio_project_files add column if not exists last_synced_at timestamptz;
create index if not exists studio_storage_connections_org_idx on public.studio_storage_connections(organization_id,status);
create index if not exists studio_project_files_provider_idx on public.studio_project_files(organization_id,storage_provider,external_file_id);
create index if not exists studio_project_folders_provider_idx on public.studio_project_folders(organization_id,storage_provider,external_folder_id);
alter table public.studio_storage_connections enable row level security;
create policy studio_storage_connection_read on public.studio_storage_connections for select to authenticated using(public.studio_is_organization_member(organization_id));
create policy studio_storage_connection_owner_write on public.studio_storage_connections for insert to authenticated with check(public.studio_has_organization_role(organization_id,array['owner']) and created_by=auth.uid());
create policy studio_storage_connection_owner_update on public.studio_storage_connections for update to authenticated using(public.studio_has_organization_role(organization_id,array['owner'])) with check(public.studio_has_organization_role(organization_id,array['owner']));
revoke delete on public.studio_storage_connections from authenticated;
commit;
