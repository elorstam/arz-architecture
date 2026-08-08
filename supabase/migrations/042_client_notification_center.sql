begin;

create table if not exists public.studio_client_notification_reads(
 notification_id uuid not null references public.studio_notifications(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 organization_id uuid not null references public.organizations(id) on delete cascade,
 project_id uuid not null references public.studio_projects(id) on delete cascade,
 read_at timestamptz not null default now(),
 primary key(user_id,notification_id)
);
create index if not exists studio_client_notification_reads_notification_idx on public.studio_client_notification_reads(notification_id,user_id);
create index if not exists studio_client_notification_reads_project_user_idx on public.studio_client_notification_reads(project_id,user_id,read_at desc);
alter table public.studio_client_notification_reads enable row level security;
revoke all on table public.studio_client_notification_reads from public,anon,authenticated;

drop function if exists public.client_portal_list_notifications(uuid);
create function public.client_portal_list_notifications(p_project_id uuid)
returns table(id uuid,project_id uuid,project_name text,source_type text,source_id uuid,status text,template_name text,title text,body text,sent_at timestamptz,delivered_at timestamptz,read_at timestamptz,created_at timestamptz)
language sql stable security definer set search_path=public as $$
 select n.id,n.project_id,p.name,n.source_type,n.source_id,n.status,n.template_name,
  coalesce(nullif(n.variables_snapshot->>'title',''),nullif(n.variables_snapshot->>'stage_name',''),nullif(n.variables_snapshot->>'fee_name',''),nullif(n.variables_snapshot->>'document_name',''),nullif(n.variables_snapshot->>'record_name',''),replace(n.template_name,'_',' ')) as title,
  coalesce(nullif(n.variables_snapshot->>'message',''),nullif(n.variables_snapshot->>'description',''),nullif(n.variables_snapshot->>'stage_description',''),nullif(n.variables_snapshot->>'document_name',''),nullif(n.variables_snapshot->>'record_name',''),replace(n.template_name,'_',' ')) as body,
  n.sent_at,n.delivered_at,r.read_at,n.created_at
 from public.studio_notifications n
 join public.studio_projects p on p.id=n.project_id and p.organization_id=n.organization_id and not p.is_archived
 left join public.studio_client_notification_reads r on r.notification_id=n.id and r.user_id=auth.uid() and r.organization_id=n.organization_id and r.project_id=n.project_id
 where public.studio_client_can_access_project(auth.uid(),p_project_id) and n.project_id=p_project_id and n.channel='client_portal'
 order by n.created_at desc
$$;

create or replace function public.client_portal_unread_notification_count()
returns bigint language sql stable security definer set search_path=public as $$
 select count(*) from public.studio_notifications n
 join public.studio_projects p on p.id=n.project_id and p.organization_id=n.organization_id and not p.is_archived
 where n.channel='client_portal' and public.studio_client_can_access_project(auth.uid(),n.project_id)
 and not exists(select 1 from public.studio_client_notification_reads r where r.notification_id=n.id and r.user_id=auth.uid() and r.organization_id=n.organization_id and r.project_id=n.project_id)
$$;

create or replace function public.client_portal_mark_notification_read(p_notification_id uuid)
returns boolean language plpgsql security definer set search_path=public as $$
declare v_notification record;
begin
 if auth.uid() is null then return false; end if;
 select n.id,n.organization_id,n.project_id into v_notification
 from public.studio_notifications n
 join public.studio_projects p on p.id=n.project_id and p.organization_id=n.organization_id and not p.is_archived
 where n.id=p_notification_id and n.channel='client_portal' and public.studio_client_can_access_project(auth.uid(),n.project_id);
 if v_notification.id is null then return false; end if;
 insert into public.studio_client_notification_reads(notification_id,user_id,organization_id,project_id)
 values(v_notification.id,auth.uid(),v_notification.organization_id,v_notification.project_id)
 on conflict(user_id,notification_id) do nothing;
 return true;
end $$;

create or replace function public.client_portal_mark_project_notifications_read(p_project_id uuid)
returns integer language plpgsql security definer set search_path=public as $$
declare v_count integer;
begin
 if auth.uid() is null or not public.studio_client_can_access_project(auth.uid(),p_project_id) then return -1; end if;
 insert into public.studio_client_notification_reads(notification_id,user_id,organization_id,project_id)
 select n.id,auth.uid(),n.organization_id,n.project_id from public.studio_notifications n
 join public.studio_projects p on p.id=n.project_id and p.organization_id=n.organization_id and not p.is_archived
 where n.project_id=p_project_id and n.channel='client_portal'
 on conflict(user_id,notification_id) do nothing;
 get diagnostics v_count=row_count;
 return v_count;
end $$;

revoke all on function public.client_portal_list_notifications(uuid),public.client_portal_unread_notification_count(),public.client_portal_mark_notification_read(uuid),public.client_portal_mark_project_notifications_read(uuid) from public,anon;
grant execute on function public.client_portal_list_notifications(uuid),public.client_portal_unread_notification_count(),public.client_portal_mark_notification_read(uuid),public.client_portal_mark_project_notifications_read(uuid) to authenticated;

notify pgrst,'reload schema';
commit;
