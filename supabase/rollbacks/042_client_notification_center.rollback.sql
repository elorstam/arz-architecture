begin;

drop function if exists public.client_portal_mark_project_notifications_read(uuid);
drop function if exists public.client_portal_mark_notification_read(uuid);
drop function if exists public.client_portal_unread_notification_count();
drop function if exists public.client_portal_list_notifications(uuid);

create function public.client_portal_list_notifications(p_project_id uuid)
returns table(id uuid,project_id uuid,source_type text,source_id uuid,status text,template_name text,sent_at timestamptz,delivered_at timestamptz,read_at timestamptz,created_at timestamptz)
language sql stable security definer set search_path=public as $$ select n.id,n.project_id,n.source_type,n.source_id,n.status,n.template_name,n.sent_at,n.delivered_at,n.read_at,n.created_at from public.studio_notifications n where public.studio_client_can_access_project(auth.uid(),p_project_id) and n.project_id=p_project_id and n.channel='client_portal' order by n.created_at desc $$;

revoke all on function public.client_portal_list_notifications(uuid) from public,anon;
grant execute on function public.client_portal_list_notifications(uuid) to authenticated;
drop table if exists public.studio_client_notification_reads;

notify pgrst,'reload schema';
commit;
