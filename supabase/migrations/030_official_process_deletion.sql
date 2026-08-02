begin;

create table if not exists public.studio_obligation_deletion_audits(
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id), project_id uuid not null references public.studio_projects(id), obligation_id uuid not null, obligation_title text not null, deleted_by uuid not null references auth.users(id), reason text, deleted_at timestamptz not null default now()
);
create index if not exists studio_obligation_deletion_audits_org_idx on public.studio_obligation_deletion_audits(organization_id,deleted_at desc);
alter table public.studio_obligation_deletion_audits enable row level security;
drop policy if exists studio_obligation_deletion_audits_owner_select on public.studio_obligation_deletion_audits;
create policy studio_obligation_deletion_audits_owner_select on public.studio_obligation_deletion_audits for select to authenticated using(public.studio_has_organization_role(organization_id,array['owner']));
grant select on public.studio_obligation_deletion_audits to authenticated;
revoke insert,update,delete on public.studio_obligation_deletion_audits from anon,authenticated;

create table if not exists public.studio_obligation_deletion_confirmations(
 id uuid primary key default gen_random_uuid(), token_hash text not null unique, organization_id uuid not null references public.organizations(id), project_id uuid not null references public.studio_projects(id), obligation_id uuid not null references public.studio_project_obligations(id), user_id uuid not null references auth.users(id), expires_at timestamptz not null, used_at timestamptz
);
create index if not exists studio_obligation_deletion_confirmations_lookup_idx on public.studio_obligation_deletion_confirmations(obligation_id,user_id,expires_at) where used_at is null;
alter table public.studio_obligation_deletion_confirmations enable row level security;
revoke all on public.studio_obligation_deletion_confirmations from anon,authenticated;

create or replace function public.studio_issue_obligation_deletion_confirmation(target_obligation uuid,target_name text)
returns uuid language plpgsql security definer set search_path=public,extensions as $$
declare o record; raw_token uuid:=gen_random_uuid();
begin
 select id,organization_id,project_id,title into o from public.studio_project_obligations where id=target_obligation and is_archived=false;
 if o.id is null or not public.studio_has_organization_role(o.organization_id,array['owner']) or o.title is distinct from target_name then raise exception 'obligation_confirmation_invalid' using errcode='42501'; end if;
 insert into public.studio_obligation_deletion_confirmations(token_hash,organization_id,project_id,obligation_id,user_id,expires_at) values(encode(digest(raw_token::text,'sha256'),'hex'),o.organization_id,o.project_id,o.id,auth.uid(),now()+interval '10 minutes');
 return raw_token;
end $$;

create or replace function public.studio_permanently_delete_obligation(target_obligation uuid,target_token uuid,target_reason text default null)
returns void language plpgsql security definer set search_path=public,extensions as $$
declare c record; o record;
begin
 select * into c from public.studio_obligation_deletion_confirmations where token_hash=encode(digest(target_token::text,'sha256'),'hex') and obligation_id=target_obligation and user_id=auth.uid() and used_at is null and expires_at>now() for update;
 if c.id is null then raise exception 'obligation_confirmation_invalid' using errcode='42501'; end if;
 select * into o from public.studio_project_obligations where id=target_obligation and organization_id=c.organization_id for update;
 if o.id is null or not public.studio_has_organization_role(c.organization_id,array['owner']) then raise exception 'obligation_not_found' using errcode='P0002'; end if;
 insert into public.studio_obligation_deletion_audits(organization_id,project_id,obligation_id,obligation_title,deleted_by,reason) values(o.organization_id,o.project_id,o.id,o.title,auth.uid(),nullif(target_reason,''));
 delete from public.studio_project_obligation_events where obligation_id=o.id;
 delete from public.studio_project_obligation_notifications where obligation_id=o.id;
 delete from public.studio_project_obligations where id=o.id;
 update public.studio_obligation_deletion_confirmations set used_at=now() where id=c.id;
end $$;

revoke all on function public.studio_issue_obligation_deletion_confirmation(uuid,text) from public;
revoke all on function public.studio_permanently_delete_obligation(uuid,uuid,text) from public;
grant execute on function public.studio_issue_obligation_deletion_confirmation(uuid,text) to authenticated;
grant execute on function public.studio_permanently_delete_obligation(uuid,uuid,text) to authenticated;
notify pgrst,'reload schema';
commit;
