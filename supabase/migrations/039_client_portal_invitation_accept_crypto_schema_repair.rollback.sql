begin;
alter function public.studio_accept_client_invitation(text) set search_path=public,auth;
notify pgrst,'reload schema';
commit;
