begin;

revoke select on public.studio_client_invitations from service_role;
revoke select on public.studio_projects from service_role;

notify pgrst, 'reload schema';

commit;
