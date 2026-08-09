begin;

create table public.studio_client_payment_billing_profiles(
 user_id uuid primary key references auth.users(id) on delete cascade,
 full_name text not null check(char_length(btrim(full_name)) between 2 and 120),
 identity_number text not null check(identity_number~'^[0-9]{11}$'),
 email text not null check(char_length(btrim(email)) between 3 and 320),
 gsm_number text not null check(char_length(btrim(gsm_number)) between 10 and 24),
 registration_address text not null check(char_length(btrim(registration_address)) between 5 and 500),
 city text not null check(char_length(btrim(city)) between 2 and 120),
 country text not null default 'Turkey' check(char_length(btrim(country)) between 2 and 120),
 zip_code text check(zip_code is null or char_length(btrim(zip_code))<=20),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

alter table public.studio_client_payment_billing_profiles enable row level security;
revoke all on table public.studio_client_payment_billing_profiles from public,anon,authenticated;

create function public.studio_list_client_payment_billing_profiles(p_project_id uuid)
returns table(user_id uuid,full_name text,email text,gsm_number text,identity_number text,registration_address text,city text,country text,zip_code text,is_complete boolean)
language plpgsql stable security definer set search_path=public as $$
declare v_org uuid;
begin
 select p.organization_id into v_org from public.studio_projects p where p.id=p_project_id and not p.is_archived;
 if v_org is null or not public.studio_has_organization_role(v_org,array['owner']) then raise exception 'forbidden' using errcode='42501';end if;
 return query
 select a.user_id,coalesce(b.full_name,pr.full_name),coalesce(b.email,pr.email),coalesce(b.gsm_number,nullif(p.client_phone,'')),b.identity_number,b.registration_address,b.city,b.country,b.zip_code,(b.user_id is not null and position(' ' in btrim(b.full_name))>0)
 from public.studio_client_project_access a
 join public.studio_projects p on p.id=a.project_id and p.organization_id=a.organization_id
 join public.profiles pr on pr.id=a.user_id
 left join public.studio_client_payment_billing_profiles b on b.user_id=a.user_id
 where a.organization_id=v_org and a.project_id=p_project_id and a.revoked_at is null
 order by coalesce(pr.full_name,pr.email);
end $$;

create function public.studio_upsert_client_payment_billing_profile(p_project_id uuid,p_client_user_id uuid,p_full_name text,p_email text,p_gsm_number text,p_identity_number text,p_registration_address text,p_city text,p_country text,p_zip_code text)
returns boolean language plpgsql security definer set search_path=public as $$
declare v_org uuid;v_phone text;
begin
 select p.organization_id into v_org from public.studio_projects p where p.id=p_project_id and not p.is_archived;
 if v_org is null or not public.studio_has_organization_role(v_org,array['owner']) then raise exception 'forbidden' using errcode='42501';end if;
 if not exists(select 1 from public.studio_client_project_access a where a.organization_id=v_org and a.project_id=p_project_id and a.user_id=p_client_user_id and a.revoked_at is null) then raise exception 'client_access_not_found' using errcode='P0002';end if;
 v_phone:=regexp_replace(btrim(p_gsm_number),'[[:space:]()\-]','','g');
 if char_length(btrim(p_full_name))<3 or position(' ' in btrim(p_full_name))=0 then raise exception 'name_required' using errcode='22023';end if;
 if btrim(p_email)!~*'^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then raise exception 'email_invalid' using errcode='22023';end if;
 if v_phone!~'^\+?[0-9]{10,15}$' then raise exception 'phone_invalid' using errcode='22023';end if;
 if btrim(p_identity_number)!~'^[0-9]{11}$' then raise exception 'identity_invalid' using errcode='22023';end if;
 if char_length(btrim(p_registration_address))<5 or char_length(btrim(p_city))<2 or char_length(btrim(p_country))<2 then raise exception 'billing_address_incomplete' using errcode='22023';end if;
 insert into public.studio_client_payment_billing_profiles(user_id,full_name,identity_number,email,gsm_number,registration_address,city,country,zip_code)
 values(p_client_user_id,btrim(p_full_name),btrim(p_identity_number),lower(btrim(p_email)),v_phone,btrim(p_registration_address),btrim(p_city),btrim(p_country),nullif(btrim(coalesce(p_zip_code,'')),''))
 on conflict(user_id) do update set full_name=excluded.full_name,identity_number=excluded.identity_number,email=excluded.email,gsm_number=excluded.gsm_number,registration_address=excluded.registration_address,city=excluded.city,country=excluded.country,zip_code=excluded.zip_code,updated_at=now();
 return true;
end $$;

revoke all on function public.studio_list_client_payment_billing_profiles(uuid),public.studio_upsert_client_payment_billing_profile(uuid,uuid,text,text,text,text,text,text,text,text) from public,anon;
grant execute on function public.studio_list_client_payment_billing_profiles(uuid),public.studio_upsert_client_payment_billing_profile(uuid,uuid,text,text,text,text,text,text,text,text) to authenticated;

create table public.studio_client_payment_attempts(
 id uuid primary key default gen_random_uuid(),
 payment_request_id uuid not null references public.studio_client_payment_requests(id),
 organization_id uuid not null references public.organizations(id),
 project_id uuid not null references public.studio_projects(id),
 provider text not null default 'iyzico' check(provider='iyzico'),
 environment text not null check(environment in('sandbox','live')),
 conversation_id text not null unique,
 basket_id text not null unique,
 amount numeric(16,2) not null check(amount>0),
 currency text not null check(currency in('TRY','USD','EUR','GBP')),
 status text not null default 'created' check(status in('created','awaiting_payment','succeeded','failed','expired','superseded')),
 provider_token_hash text unique check(provider_token_hash is null or provider_token_hash~'^[0-9a-f]{64}$'),
 provider_checkout_url text,
 provider_payment_id text unique,
 finance_entry_id uuid unique references public.studio_finance_entries(id),
 error_code text,
 error_message text,
 initiated_by uuid not null references auth.users(id),
 expires_at timestamptz,
 completed_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create index studio_client_payment_attempts_request_idx on public.studio_client_payment_attempts(payment_request_id,created_at desc);
create unique index studio_client_payment_attempts_one_active_idx on public.studio_client_payment_attempts(payment_request_id) where status in('created','awaiting_payment');
alter table public.studio_client_payment_attempts enable row level security;
revoke all on table public.studio_client_payment_attempts from public,anon,authenticated;
grant select,insert,update on public.studio_client_payment_attempts to service_role;

drop function public.client_portal_list_payment_requests(uuid);
create function public.client_portal_list_payment_requests(p_project_id uuid)
returns table(id uuid,project_id uuid,project_name text,title text,description text,payment_type text,amount numeric,currency text,due_date date,status text,payment_provider text,paid_at timestamptz,created_at timestamptz)
language sql stable security definer set search_path=public as $$
 select r.id,r.project_id,p.name,r.title,r.description,r.payment_type,r.amount,r.currency,r.due_date,r.status,r.payment_provider,r.paid_at,r.created_at
 from public.studio_client_payment_requests r join public.studio_projects p on p.id=r.project_id and p.organization_id=r.organization_id
 where r.project_id=p_project_id and r.status in('pending','paid') and public.studio_client_can_access_project(auth.uid(),r.project_id)
 order by case when r.status='pending' then 0 else 1 end,r.due_date nulls last,r.created_at desc
$$;

drop function public.client_portal_get_payment_request_for_checkout(uuid);
create function public.client_portal_get_payment_request_for_checkout(p_payment_request_id uuid)
returns table(id uuid,organization_id uuid,project_id uuid,project_name text,title text,amount numeric,currency text,status text,buyer_id uuid,buyer_full_name text,buyer_identity_number text,buyer_email text,buyer_gsm_number text,buyer_registration_address text,buyer_city text,buyer_country text,buyer_zip_code text)
language sql stable security definer set search_path=public as $$
 select r.id,r.organization_id,r.project_id,p.name,r.title,r.amount,r.currency,r.status,auth.uid(),b.full_name,b.identity_number,b.email,b.gsm_number,b.registration_address,b.city,b.country,b.zip_code
 from public.studio_client_payment_requests r
 join public.studio_projects p on p.id=r.project_id and p.organization_id=r.organization_id
 left join public.studio_client_payment_billing_profiles b on b.user_id=auth.uid()
 where r.id=p_payment_request_id and public.studio_client_can_access_project(auth.uid(),r.project_id)
$$;

create function public.iyzico_create_payment_attempt(p_payment_request_id uuid,p_initiated_by uuid,p_environment text,p_conversation_id text,p_basket_id text,p_expires_at timestamptz)
returns setof public.studio_client_payment_attempts language plpgsql security definer set search_path=public as $$
declare r public.studio_client_payment_requests%rowtype;a public.studio_client_payment_attempts%rowtype;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_payment_request_id::text,0));
 select * into r from public.studio_client_payment_requests where id=p_payment_request_id for update;
 if r.id is null then raise exception 'payment_not_found' using errcode='P0002';end if;
 if r.status='paid' then raise exception 'payment_already_paid' using errcode='P0001';end if;
 if r.status='cancelled' then raise exception 'payment_cancelled' using errcode='P0001';end if;
 update public.studio_client_payment_attempts set status='expired',updated_at=now() where payment_request_id=r.id and status in('created','awaiting_payment') and expires_at<=now();
 select * into a from public.studio_client_payment_attempts where payment_request_id=r.id and status in('created','awaiting_payment') limit 1;
 if a.id is null then
  insert into public.studio_client_payment_attempts(payment_request_id,organization_id,project_id,environment,conversation_id,basket_id,amount,currency,initiated_by,expires_at)
  values(r.id,r.organization_id,r.project_id,p_environment,p_conversation_id,p_basket_id,r.amount,r.currency,p_initiated_by,p_expires_at) returning * into a;
 end if;
 return next a;
end $$;

create function public.iyzico_finalize_payment(p_attempt_id uuid,p_provider_payment_id text,p_amount numeric,p_currency text)
returns boolean language plpgsql security definer set search_path=public as $$
declare a public.studio_client_payment_attempts%rowtype;r public.studio_client_payment_requests%rowtype;entry_id uuid;entry_type text;category text;
begin
 select * into a from public.studio_client_payment_attempts where id=p_attempt_id for update;
 if a.id is null then return false;end if;
 if a.status='succeeded' then return a.provider_payment_id=p_provider_payment_id;end if;
 select * into r from public.studio_client_payment_requests where id=a.payment_request_id for update;
 if r.id is null or r.status<>'pending' or r.amount<>p_amount or r.currency<>p_currency or a.amount<>p_amount or a.currency<>p_currency then return false;end if;
 if exists(select 1 from public.studio_client_payment_attempts x where x.provider_payment_id=p_provider_payment_id and x.id<>a.id) then return false;end if;
 entry_type:=case when r.payment_type='progress_payment' then 'progress_payment' else 'income' end;
 category:=case when r.payment_type='progress_payment' then 'progress_payment' else 'project_fee' end;
 insert into public.studio_finance_entries(organization_id,project_id,entry_type,source_type,title,description,category,status,amount,paid_amount,tax_rate,currency,entry_date,due_date,is_client_visible,created_by,updated_by)
 values(r.organization_id,r.project_id,entry_type,'project',r.title,concat_ws(' ',r.description,'iyzico üzerinden tahsil edildi.'),category,'collected',r.amount,0,0,r.currency,current_date,r.due_date,true,a.initiated_by,a.initiated_by) returning id into entry_id;
 insert into public.studio_finance_payments(organization_id,income_id,amount,payment_date,method,note,is_client_visible,created_by,updated_by)
 values(r.organization_id,entry_id,r.amount,current_date,'credit_card','iyzico üzerinden tahsil edildi',true,a.initiated_by,a.initiated_by);
 update public.studio_client_payment_requests set status='paid',paid_at=now(),payment_provider='iyzico' where id=r.id;
 update public.studio_client_payment_attempts set status='succeeded',provider_payment_id=p_provider_payment_id,finance_entry_id=entry_id,completed_at=now(),updated_at=now() where id=a.id;
 update public.studio_client_payment_attempts set status='superseded',updated_at=now() where payment_request_id=r.id and id<>a.id and status in('created','awaiting_payment');
 return true;
end $$;

revoke all on function public.client_portal_get_payment_request_for_checkout(uuid) from public,anon;
revoke all on function public.client_portal_list_payment_requests(uuid) from public,anon;
grant execute on function public.client_portal_list_payment_requests(uuid) to authenticated;
grant execute on function public.client_portal_get_payment_request_for_checkout(uuid) to authenticated;
revoke all on function public.iyzico_create_payment_attempt(uuid,uuid,text,text,text,timestamptz),public.iyzico_finalize_payment(uuid,text,numeric,text) from public,anon,authenticated;
grant execute on function public.iyzico_create_payment_attempt(uuid,uuid,text,text,text,timestamptz),public.iyzico_finalize_payment(uuid,text,numeric,text) to service_role;

notify pgrst,'reload schema';
commit;
