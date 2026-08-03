begin;
revoke select on public.studio_client_invitations from authenticated;
notify pgrst,'reload schema';
commit;
