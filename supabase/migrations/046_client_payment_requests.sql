begin;

create table public.studio_client_payment_requests(
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references public.organizations(id),
 project_id uuid not null references public.studio_projects(id),
 title text not null check(char_length(btrim(title)) between 2 and 180),
 description text check(description is null or char_length(description)<=4000),
 payment_type text not null check(payment_type in('deposit','progress_payment','final_payment','other')),
 amount numeric(16,2) not null check(amount>0),
 currency text not null default 'TRY' check(currency in('TRY','USD','EUR','GBP')),
 due_date date,
 status text not null default 'pending' check(status in('pending','paid','cancelled')),
 payment_provider text check(payment_provider is null or char_length(payment_provider)<=50),
 created_by uuid not null references auth.users(id),
 paid_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check((status='paid' and paid_at is not null) or(status<>'paid' and paid_at is null))
);

create index studio_client_payment_requests_project_idx on public.studio_client_payment_requests(organization_id,project_id,status,created_at desc);
create index studio_client_payment_requests_pending_idx on public.studio_client_payment_requests(project_id,due_date,created_at desc) where status='pending';

create function public.studio_validate_client_payment_request()
returns trigger language plpgsql set search_path=public as $$
begin
 if not exists(select 1 from public.studio_projects p where p.id=new.project_id and p.organization_id=new.organization_id and not p.is_archived) then
  raise exception 'Payment request project scope mismatch' using errcode='23514';
 end if;
 if tg_op='UPDATE' then
  if new.organization_id<>old.organization_id or new.project_id<>old.project_id or new.title<>old.title or new.description is distinct from old.description or new.payment_type<>old.payment_type or new.amount<>old.amount or new.currency<>old.currency or new.due_date is distinct from old.due_date or new.created_by<>old.created_by or new.created_at<>old.created_at then
   raise exception 'Protected payment request fields cannot change' using errcode='42501';
  end if;
  if old.status<>'pending' or new.status not in('paid','cancelled') then
   raise exception 'Invalid payment request status transition' using errcode='23514';
  end if;
 end if;
 new.title:=btrim(new.title);
 new.description:=nullif(btrim(coalesce(new.description,'')),'');
 new.updated_at:=now();
 return new;
end $$;

create trigger studio_validate_client_payment_request_trigger before insert or update on public.studio_client_payment_requests for each row execute function public.studio_validate_client_payment_request();

alter table public.studio_client_payment_requests enable row level security;
create policy studio_client_payment_requests_select_staff on public.studio_client_payment_requests for select to authenticated using(public.studio_is_non_client_member(organization_id));

revoke all on table public.studio_client_payment_requests from public,anon,authenticated;
grant select on table public.studio_client_payment_requests to authenticated;

create function public.studio_create_client_payment_request(p_project_id uuid,p_title text,p_description text,p_payment_type text,p_amount numeric,p_currency text,p_due_date date)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_org uuid;v_id uuid;
begin
 select p.organization_id into v_org from public.studio_projects p where p.id=p_project_id and not p.is_archived;
 if v_org is null or not public.studio_has_organization_role(v_org,array['owner']) then raise exception 'forbidden' using errcode='42501';end if;
 insert into public.studio_client_payment_requests(organization_id,project_id,title,description,payment_type,amount,currency,due_date,created_by)
 values(v_org,p_project_id,p_title,p_description,p_payment_type,p_amount,p_currency,p_due_date,auth.uid()) returning id into v_id;
 insert into public.activity_events(organization_id,actor_user_id,entity_type,entity_id,action,summary,metadata)
 values(v_org,auth.uid(),'client_payment_request',v_id,'client_payment_request_created','Client payment request created.',jsonb_build_object('project_id',p_project_id));
 return v_id;
end $$;

create function public.studio_cancel_client_payment_request(p_project_id uuid,p_payment_request_id uuid)
returns boolean language plpgsql security definer set search_path=public as $$
declare v_org uuid;v_id uuid;
begin
 select p.organization_id into v_org from public.studio_projects p where p.id=p_project_id and not p.is_archived;
 if v_org is null or not public.studio_has_organization_role(v_org,array['owner']) then raise exception 'forbidden' using errcode='42501';end if;
 update public.studio_client_payment_requests set status='cancelled' where id=p_payment_request_id and organization_id=v_org and project_id=p_project_id and status='pending' returning id into v_id;
 if v_id is null then return false;end if;
 insert into public.activity_events(organization_id,actor_user_id,entity_type,entity_id,action,summary,metadata)
 values(v_org,auth.uid(),'client_payment_request',v_id,'client_payment_request_cancelled','Client payment request cancelled.',jsonb_build_object('project_id',p_project_id));
 return true;
end $$;

create function public.client_portal_list_payment_requests(p_project_id uuid)
returns table(id uuid,project_id uuid,project_name text,title text,description text,payment_type text,amount numeric,currency text,due_date date,status text,paid_at timestamptz,created_at timestamptz)
language sql stable security definer set search_path=public as $$
 select r.id,r.project_id,p.name,r.title,r.description,r.payment_type,r.amount,r.currency,r.due_date,r.status,r.paid_at,r.created_at
 from public.studio_client_payment_requests r join public.studio_projects p on p.id=r.project_id and p.organization_id=r.organization_id
 where r.project_id=p_project_id and r.status in('pending','paid') and public.studio_client_can_access_project(auth.uid(),r.project_id)
 order by case when r.status='pending' then 0 else 1 end,r.due_date nulls last,r.created_at desc
$$;

create function public.client_portal_get_payment_request_for_checkout(p_payment_request_id uuid)
returns table(id uuid,organization_id uuid,project_id uuid,project_name text,title text,amount numeric,currency text,due_date date)
language sql stable security definer set search_path=public as $$
 select r.id,r.organization_id,r.project_id,p.name,r.title,r.amount,r.currency,r.due_date
 from public.studio_client_payment_requests r join public.studio_projects p on p.id=r.project_id and p.organization_id=r.organization_id
 where r.id=p_payment_request_id and r.status='pending' and public.studio_client_can_access_project(auth.uid(),r.project_id)
$$;

revoke all on function public.studio_create_client_payment_request(uuid,text,text,text,numeric,text,date),public.studio_cancel_client_payment_request(uuid,uuid),public.client_portal_list_payment_requests(uuid),public.client_portal_get_payment_request_for_checkout(uuid) from public,anon;
grant execute on function public.studio_create_client_payment_request(uuid,text,text,text,numeric,text,date),public.studio_cancel_client_payment_request(uuid,uuid),public.client_portal_list_payment_requests(uuid),public.client_portal_get_payment_request_for_checkout(uuid) to authenticated;

notify pgrst,'reload schema';
commit;
