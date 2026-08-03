begin;
alter function public.studio_create_client_invitation(uuid,text,timestamptz) set search_path=public;
notify pgrst,'reload schema';
commit;
