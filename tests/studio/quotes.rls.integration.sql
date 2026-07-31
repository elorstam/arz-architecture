begin;
do $$
begin
 if not exists(select 1 from pg_tables where schemaname='public' and tablename='studio_quotes') then raise exception 'studio_quotes missing'; end if;
 if not exists(select 1 from pg_class where relname='studio_quotes' and relrowsecurity) then raise exception 'quote RLS disabled'; end if;
 if not exists(select 1 from pg_class where relname='studio_quote_items' and relrowsecurity) then raise exception 'item RLS disabled'; end if;
 if exists(select 1 from pg_policies where schemaname='public' and tablename in('studio_quotes','studio_quote_items') and cmd='DELETE') then raise exception 'hard delete policy exposed'; end if;
 if not exists(select 1 from pg_proc where proname='studio_create_quote') then raise exception 'create transaction RPC missing'; end if;
 if not exists(select 1 from pg_proc where proname='studio_update_quote') then raise exception 'update transaction RPC missing'; end if;
 if not exists(select 1 from pg_proc where proname='studio_convert_quote_to_project') then raise exception 'conversion transaction RPC missing'; end if;
 if not exists(select 1 from pg_indexes where indexname='studio_projects_source_quote_unique') then raise exception 'conversion idempotency index missing'; end if;
end $$;
-- A disposable integration harness must additionally set auth.uid() for A owner/member,
-- B owner/member and unauthenticated fixtures, then execute the matrix documented in Phase 4B.
rollback;
