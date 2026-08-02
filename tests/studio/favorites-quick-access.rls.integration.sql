begin;
-- Integration contract: execute with fixture users in the Supabase RLS harness.
-- A user can read/update only rows whose user_id equals auth.uid(), and entity
-- validation independently rejects cross-organization identifiers.
select policyname,cmd from pg_policies where schemaname='public' and tablename in('studio_user_favorites','studio_user_recent_items');
select relname,relrowsecurity from pg_class where relname in('studio_user_favorites','studio_user_recent_items');
rollback;
