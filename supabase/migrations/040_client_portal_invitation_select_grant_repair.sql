begin;
grant select on public.studio_client_invitations to authenticated;
notify pgrst,'reload schema';
commit;
