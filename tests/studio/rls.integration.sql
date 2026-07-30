-- Run against a disposable Supabase database after applying
-- 001_studio_core_foundation.sql. This file changes no persistent data.
begin;

do $$
declare
  table_name text;
  rls_enabled boolean;
begin
  foreach table_name in array array[
    'profiles',
    'organizations',
    'organization_members',
    'activity_events'
  ]
  loop
    select c.relrowsecurity
      into rls_enabled
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public' and c.relname = table_name;

    if coalesce(rls_enabled, false) is not true then
      raise exception 'RLS is not enabled for public.%', table_name;
    end if;
  end loop;
end
$$;

do $$
declare
  policy_count integer;
begin
  select count(*)
    into policy_count
    from pg_policies
   where schemaname = 'public'
     and tablename in (
       'profiles',
       'organizations',
       'organization_members',
       'activity_events'
     );

  if policy_count < 7 then
    raise exception 'Expected Studio RLS policies are missing.';
  end if;
end
$$;

do $$
begin
  if has_function_privilege(
    'anon',
    'public.studio_bootstrap_owner(uuid,text,text,text,text)',
    'EXECUTE'
  ) then
    raise exception 'anon must not execute studio_bootstrap_owner';
  end if;

  if has_function_privilege(
    'authenticated',
    'public.studio_bootstrap_owner(uuid,text,text,text,text)',
    'EXECUTE'
  ) then
    raise exception 'authenticated must not execute studio_bootstrap_owner';
  end if;
end
$$;

rollback;
