begin;

-- Migration 014 may already have created some or all of these objects. This
-- repair is additive: it never drops policies, triggers, tables, or data.
alter table public.studio_project_obligations enable row level security;
alter table public.studio_project_obligation_events enable row level security;
alter table public.studio_project_obligation_notifications enable row level security;

create index if not exists studio_obligations_org_project_idx on public.studio_project_obligations(organization_id,project_id,is_archived);
create index if not exists studio_obligations_due_idx on public.studio_project_obligations(organization_id,due_date) where is_archived=false;
create index if not exists studio_obligations_status_idx on public.studio_project_obligations(organization_id,status);
create index if not exists studio_obligation_events_timeline_idx on public.studio_project_obligation_events(obligation_id,created_at desc);
create index if not exists studio_obligation_notifications_idx on public.studio_project_obligation_notifications(obligation_id,created_at desc);

do $$
begin
 if not exists(select 1 from pg_catalog.pg_trigger where tgname='studio_validate_obligation' and tgrelid='public.studio_project_obligations'::regclass and not tgisinternal) then
  create trigger studio_validate_obligation before insert or update on public.studio_project_obligations for each row execute function public.studio_validate_obligation();
 end if;
 if not exists(select 1 from pg_catalog.pg_trigger where tgname='studio_validate_obligation_event' and tgrelid='public.studio_project_obligation_events'::regclass and not tgisinternal) then
  create trigger studio_validate_obligation_event before insert or update on public.studio_project_obligation_events for each row execute function public.studio_validate_obligation_child();
 end if;
 if not exists(select 1 from pg_catalog.pg_trigger where tgname='studio_validate_obligation_notification' and tgrelid='public.studio_project_obligation_notifications'::regclass and not tgisinternal) then
  create trigger studio_validate_obligation_notification before insert or update on public.studio_project_obligation_notifications for each row execute function public.studio_validate_obligation_child();
 end if;
 if not exists(select 1 from pg_catalog.pg_trigger where tgname='studio_obligation_audit_trigger' and tgrelid='public.studio_project_obligations'::regclass and not tgisinternal) then
  create trigger studio_obligation_audit_trigger after insert or update on public.studio_project_obligations for each row execute function public.studio_obligation_audit();
 end if;
 if not exists(select 1 from pg_catalog.pg_trigger where tgname='studio_initialize_project_obligations_after_insert' and tgrelid='public.studio_projects'::regclass and not tgisinternal) then
  create trigger studio_initialize_project_obligations_after_insert after insert on public.studio_projects for each row execute function public.studio_initialize_project_obligations_trigger();
 end if;
end $$;

do $$
begin
 if not exists(select 1 from pg_catalog.pg_policies where schemaname='public' and tablename='studio_project_obligations' and policyname='studio_obligations_select') then
  create policy studio_obligations_select on public.studio_project_obligations for select to authenticated using(public.studio_is_organization_member(organization_id));
 end if;
 if not exists(select 1 from pg_catalog.pg_policies where schemaname='public' and tablename='studio_project_obligations' and policyname='studio_obligations_owner_insert') then
  create policy studio_obligations_owner_insert on public.studio_project_obligations for insert to authenticated with check(created_by=auth.uid() and updated_by=auth.uid() and public.studio_has_organization_role(organization_id,array['owner']));
 end if;
 if not exists(select 1 from pg_catalog.pg_policies where schemaname='public' and tablename='studio_project_obligations' and policyname='studio_obligations_owner_update') then
  create policy studio_obligations_owner_update on public.studio_project_obligations for update to authenticated using(public.studio_has_organization_role(organization_id,array['owner'])) with check(updated_by=auth.uid() and public.studio_has_organization_role(organization_id,array['owner']));
 end if;
 if not exists(select 1 from pg_catalog.pg_policies where schemaname='public' and tablename='studio_project_obligation_events' and policyname='studio_obligation_events_select') then
  create policy studio_obligation_events_select on public.studio_project_obligation_events for select to authenticated using(public.studio_is_organization_member(organization_id));
 end if;
 if not exists(select 1 from pg_catalog.pg_policies where schemaname='public' and tablename='studio_project_obligation_notifications' and policyname='studio_obligation_notifications_select') then
  create policy studio_obligation_notifications_select on public.studio_project_obligation_notifications for select to authenticated using(public.studio_is_organization_member(organization_id));
 end if;
 if not exists(select 1 from pg_catalog.pg_policies where schemaname='public' and tablename='studio_project_obligation_notifications' and policyname='studio_obligation_notifications_owner_insert') then
  create policy studio_obligation_notifications_owner_insert on public.studio_project_obligation_notifications for insert to authenticated with check(created_by=auth.uid() and public.studio_has_organization_role(organization_id,array['owner']));
 end if;
end $$;

grant select,insert,update on public.studio_project_obligations to authenticated;
grant select on public.studio_project_obligation_events to authenticated;
grant select,insert on public.studio_project_obligation_notifications to authenticated;
revoke delete on public.studio_project_obligations,public.studio_project_obligation_events,public.studio_project_obligation_notifications from anon,authenticated;
grant execute on function public.studio_initialize_project_obligations(uuid,uuid) to authenticated;
notify pgrst,'reload schema';
commit;
