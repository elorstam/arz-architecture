begin;

alter table public.studio_storage_connections enable row level security;

drop policy if exists studio_storage_connection_read on public.studio_storage_connections;
create policy studio_storage_connection_read
on public.studio_storage_connections for select to authenticated
using(public.studio_is_organization_member(organization_id));

drop policy if exists studio_storage_connection_owner_write on public.studio_storage_connections;
create policy studio_storage_connection_owner_write
on public.studio_storage_connections for insert to authenticated
with check(
 public.studio_has_organization_role(organization_id,array['owner'])
 and created_by=auth.uid()
 and updated_by=auth.uid()
);

drop policy if exists studio_storage_connection_owner_update on public.studio_storage_connections;
create policy studio_storage_connection_owner_update
on public.studio_storage_connections for update to authenticated
using(public.studio_has_organization_role(organization_id,array['owner']))
with check(
 public.studio_has_organization_role(organization_id,array['owner'])
 and updated_by=auth.uid()
);

grant select,insert,update on public.studio_storage_connections to authenticated;
revoke delete on public.studio_storage_connections from authenticated;

notify pgrst,'reload schema';
commit;
