begin;
drop function if exists public.studio_convert_quote_to_project(uuid,jsonb);
drop function if exists public.studio_set_quote_archived(uuid,boolean);
drop function if exists public.studio_transition_quote(uuid,text);
drop function if exists public.studio_update_quote(uuid,jsonb);
drop function if exists public.studio_create_quote(jsonb);
drop trigger if exists studio_quotes_protect_fields on public.studio_quotes;
drop function if exists public.studio_protect_quote_fields();
drop trigger if exists studio_quote_items_set_updated_at on public.studio_quote_items;
drop trigger if exists studio_quotes_set_updated_at on public.studio_quotes;
drop trigger if exists studio_quote_sequences_set_updated_at on public.studio_quote_sequences;
alter table public.studio_quotes drop constraint if exists studio_quotes_converted_project_id_fkey;
alter table public.studio_projects drop constraint if exists studio_projects_source_quote_id_fkey;
drop index if exists public.studio_projects_source_quote_unique;
alter table public.studio_projects drop column if exists source_quote_id;
create or replace function public.studio_protect_project_fields()
returns trigger language plpgsql set search_path=public as $$
begin
 if auth.uid() is null then raise exception 'Authentication required.'; end if;
 if tg_op='INSERT' then
  new.created_by=auth.uid();
  new.updated_by=auth.uid();
 else
  if new.organization_id is distinct from old.organization_id
   or new.created_by is distinct from old.created_by
   or new.created_at is distinct from old.created_at then
   raise exception 'Controlled project fields cannot be changed.';
  end if;
  new.updated_by=auth.uid();
 end if;
 if new.responsible_user_id is not null and not exists(
  select 1 from public.organization_members m
  where m.organization_id=new.organization_id
   and m.user_id=new.responsible_user_id
   and m.status='active'
   and m.role in('owner','admin','team_member')
 ) then
  raise exception 'Responsible user must be an active organization team member.';
 end if;
 return new;
end $$;
drop table if exists public.studio_quote_items;
drop table if exists public.studio_quotes;
drop table if exists public.studio_quote_sequences;
notify pgrst,'reload schema';
commit;
