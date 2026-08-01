begin;

-- Run manually in an isolated Supabase test database after migration 009.
-- Matrix contract: active member SELECT; owner INSERT/UPDATE; no DELETE;
-- cross-organization/project rows remain inaccessible through RLS and triggers.
do $$
begin
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='studio_project_file_versions' and policyname='studio_file_versions_select_member') then raise exception 'member select policy missing'; end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='studio_project_file_versions' and policyname='studio_file_versions_insert_owner') then raise exception 'owner insert policy missing'; end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='studio_project_file_versions' and policyname='studio_file_versions_update_owner') then raise exception 'owner update policy missing'; end if;
 if exists(select 1 from pg_policies where schemaname='public' and tablename='studio_project_file_versions' and cmd='DELETE') then raise exception 'delete policy must not exist'; end if;
 if not exists(select 1 from pg_indexes where schemaname='public' and tablename='studio_project_file_versions' and indexdef ilike '%where (is_current = true)%') then raise exception 'single-current partial unique index missing'; end if;
end $$;

rollback;
