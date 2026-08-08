begin;

-- The invitation preview runs only in the server runtime with the Supabase
-- secret key. RLS bypass does not replace PostgreSQL table privileges.
grant select on public.studio_client_invitations to service_role;
grant select on public.studio_projects to service_role;

notify pgrst, 'reload schema';

commit;
