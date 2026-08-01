-- Apply migrations through 007 to a disposable Supabase database before running.
-- This contract check changes no data and verifies the installed policy boundary.
begin;

do $$
declare
 select_policy text;
 insert_policy text;
 update_policy text;
begin
 if not exists(
  select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relname='studio_storage_connections' and c.relrowsecurity
 ) then raise exception 'RLS must be enabled on public.studio_storage_connections'; end if;

 select qual into select_policy from pg_policies
 where schemaname='public' and tablename='studio_storage_connections' and policyname='studio_storage_connection_read';
 select with_check into insert_policy from pg_policies
 where schemaname='public' and tablename='studio_storage_connections' and policyname='studio_storage_connection_owner_write';
 select qual||coalesce(with_check,'') into update_policy from pg_policies
 where schemaname='public' and tablename='studio_storage_connections' and policyname='studio_storage_connection_owner_update';

 if select_policy not like '%studio_is_organization_member%' then raise exception 'Organization-scoped SELECT policy missing'; end if;
 if insert_policy not like '%studio_has_organization_role%' or insert_policy not like '%owner%' then raise exception 'Owner INSERT policy missing'; end if;
 if insert_policy not like '%created_by%' or insert_policy not like '%updated_by%' then raise exception 'INSERT audit ownership checks missing'; end if;
 if update_policy not like '%studio_has_organization_role%' or update_policy not like '%owner%' then raise exception 'Owner UPDATE policy missing'; end if;
 if update_policy not like '%updated_by%' then raise exception 'UPDATE audit ownership check missing'; end if;
 if not has_table_privilege('authenticated','public.studio_storage_connections','SELECT,INSERT,UPDATE') then raise exception 'Authenticated table grants missing'; end if;
 if exists(
  select 1 from pg_policies
  where schemaname='public' and tablename='studio_storage_connections'
   and ('anon'=any(roles) or 'public'=any(roles))
 ) then raise exception 'Anonymous RLS policy must not exist'; end if;
 if exists(select 1 from pg_policies where schemaname='public' and tablename='studio_storage_connections' and cmd='DELETE') then raise exception 'DELETE policy must not exist'; end if;
end $$;

rollback;
