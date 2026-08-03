begin;
alter function public.studio_accept_client_invitation(text) set search_path=public,auth,extensions;
revoke all on function public.studio_accept_client_invitation(text) from public,anon;
grant execute on function public.studio_accept_client_invitation(text) to authenticated;
notify pgrst,'reload schema';
commit;
