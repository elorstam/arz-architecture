begin;

drop function if exists public.studio_create_client_invitation(uuid, text, timestamptz);

grant execute on function public.client_portal_list_projects() to public;
grant execute on function public.client_portal_list_renders(uuid) to public;
grant execute on function public.client_portal_list_stages(uuid) to public;
grant execute on function public.client_portal_list_files(uuid) to public;
grant execute on function public.client_portal_list_notifications(uuid) to public;
grant execute on function public.client_portal_list_finance(uuid) to public;
grant execute on function public.client_portal_list_official_processes(uuid) to public;

notify pgrst, 'reload schema';

commit;
