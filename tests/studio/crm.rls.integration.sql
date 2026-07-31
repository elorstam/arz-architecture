begin;
-- Run after 001 and 003 in a disposable Supabase database.
-- Replace fixture UUIDs with auth.users/profiles created by the integration harness.
do $$
begin
 if not exists(select 1 from pg_tables where schemaname='public' and tablename='studio_leads') then
  raise exception 'studio_leads migration is missing';
 end if;
 if not exists(select 1 from pg_class where relname='studio_leads' and relrowsecurity) then
  raise exception 'studio_leads RLS is disabled';
 end if;
 if exists(select 1 from pg_policies where schemaname='public' and tablename='studio_leads' and cmd='DELETE') then
  raise exception 'studio_leads must not expose a delete policy';
 end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='studio_leads' and cmd='SELECT') then
  raise exception 'member read policy is missing';
 end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='studio_leads' and cmd='INSERT') then
  raise exception 'owner insert policy is missing';
 end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='studio_leads' and cmd='UPDATE') then
  raise exception 'owner update policy is missing';
 end if;
end $$;
rollback;
