-- Apply 001 and 002 to a disposable Supabase database before running.
-- This contract check changes no data and verifies the installed policy boundary.
begin;
do $$
declare select_policy text;insert_policy text;update_policy text;
begin
 if not exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='studio_projects' and c.relrowsecurity) then
  raise exception 'RLS must be enabled on public.studio_projects';
 end if;
 select qual into select_policy from pg_policies where schemaname='public' and tablename='studio_projects' and policyname='studio_projects_select_member';
 select with_check into insert_policy from pg_policies where schemaname='public' and tablename='studio_projects' and policyname='studio_projects_insert_owner';
 select qual||coalesce(with_check,'') into update_policy from pg_policies where schemaname='public' and tablename='studio_projects' and policyname='studio_projects_update_owner';
 if select_policy not like '%studio_is_organization_member%' then raise exception 'Member-scoped SELECT policy missing'; end if;
 if insert_policy not like '%studio_has_organization_role%' or insert_policy not like '%owner%' then raise exception 'Owner INSERT policy missing'; end if;
 if update_policy not like '%studio_has_organization_role%' or update_policy not like '%owner%' then raise exception 'Owner UPDATE policy missing'; end if;
 if exists(select 1 from pg_policies where schemaname='public' and tablename='studio_projects' and cmd='DELETE') then raise exception 'Hard delete policy must not exist'; end if;
end $$;
rollback;
