begin;
-- Integration contract: execute with seeded Organization A/B owner/member identities.
-- A owner: SELECT/INSERT/UPDATE tag and assignment succeeds.
-- A member: SELECT succeeds; INSERT/UPDATE fails with RLS.
-- B identities: A organization rows remain invisible and immutable.
-- Anonymous: no table privileges through authenticated grants.
-- No DELETE policy exists; unlink uses is_active=false.
select policyname,cmd from pg_policies where schemaname='public' and tablename in('studio_tags','studio_tag_assignments') order by tablename,policyname;
rollback;
