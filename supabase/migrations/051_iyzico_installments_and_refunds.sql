begin;

alter table public.studio_client_payment_attempts
 add column paid_price numeric(16,2),
 add column installment integer,
 add column merchant_commission_rate numeric(12,8),
 add column merchant_commission_rate_amount numeric(16,8),
 add column iyzi_commission_rate_amount numeric(16,8),
 add column iyzi_commission_fee numeric(16,8),
 add column provider_payment_transaction_id text,
 add column three_ds_status text;
alter table public.studio_client_payment_attempts drop constraint studio_client_payment_attempts_status_check;
alter table public.studio_client_payment_attempts add constraint studio_client_payment_attempts_status_check check(status in('created','awaiting_payment','succeeded','failed','expired','superseded','refunded'));
alter table public.studio_client_payment_attempts add constraint studio_client_payment_attempts_installment_check check(installment is null or installment in(1,2,3,4,6,9,12));
alter table public.studio_client_payment_attempts add constraint studio_client_payment_attempts_paid_price_check check(paid_price is null or paid_price>=amount);

alter table public.studio_client_payment_requests drop constraint studio_client_payment_requests_status_check;
alter table public.studio_client_payment_requests add constraint studio_client_payment_requests_status_check check(status in('pending','paid','cancelled','refunded'));

create table public.studio_client_payment_refunds(
 id uuid primary key default gen_random_uuid(),payment_attempt_id uuid not null unique references public.studio_client_payment_attempts(id),payment_request_id uuid not null references public.studio_client_payment_requests(id),organization_id uuid not null references public.organizations(id),project_id uuid not null references public.studio_projects(id),
 environment text not null check(environment in('sandbox','live')),conversation_id text not null unique,provider_payment_id text not null,principal_amount numeric(16,2) not null check(principal_amount>0),provider_refund_amount numeric(16,2) not null check(provider_refund_amount>0),currency text not null check(currency in('TRY','USD','EUR','GBP')),
 status text not null default 'created' check(status in('created','processing','succeeded','failed')),finance_entry_id uuid unique references public.studio_finance_entries(id),provider_refund_reference text,error_code text,initiated_by uuid not null references auth.users(id),completed_at timestamptz,created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create index studio_client_payment_refunds_project_idx on public.studio_client_payment_refunds(organization_id,project_id,created_at desc);
alter table public.studio_client_payment_refunds enable row level security;
revoke all on table public.studio_client_payment_refunds from public,anon,authenticated;
grant select,insert,update on table public.studio_client_payment_refunds to service_role;

drop function public.client_portal_list_payment_requests(uuid);
create function public.client_portal_list_payment_requests(p_project_id uuid)
returns table(id uuid,project_id uuid,project_name text,title text,description text,payment_type text,amount numeric,currency text,due_date date,status text,payment_provider text,paid_at timestamptz,created_at timestamptz,installment integer)
language sql stable security definer set search_path=public as $$
 select r.id,r.project_id,p.name,r.title,r.description,r.payment_type,r.amount,r.currency,r.due_date,r.status,r.payment_provider,r.paid_at,r.created_at,a.installment
 from public.studio_client_payment_requests r join public.studio_projects p on p.id=r.project_id and p.organization_id=r.organization_id left join public.studio_client_payment_attempts a on a.payment_request_id=r.id and a.status in('succeeded','refunded')
 where r.project_id=p_project_id and r.status in('pending','paid','refunded') and public.studio_client_can_access_project(auth.uid(),r.project_id)
 order by case when r.status='pending' then 0 else 1 end,r.due_date nulls last,r.created_at desc
$$;
revoke all on function public.client_portal_list_payment_requests(uuid) from public,anon;
grant execute on function public.client_portal_list_payment_requests(uuid) to authenticated;

create function public.studio_list_client_payment_requests_v2(p_project_id uuid)
returns table(id uuid,title text,description text,payment_type text,amount numeric,currency text,due_date date,status text,payment_provider text,paid_at timestamptz,created_at timestamptz,installment integer,paid_price numeric,merchant_commission_rate numeric,merchant_commission_rate_amount numeric,iyzi_commission_rate_amount numeric,iyzi_commission_fee numeric,environment text,refund_status text)
language plpgsql stable security definer set search_path=public as $$
declare v_org uuid;
begin
 select organization_id into v_org from public.studio_projects where id=p_project_id and not is_archived;
 if v_org is null or not public.studio_is_non_client_member(v_org) then raise exception 'forbidden' using errcode='42501';end if;
 return query select r.id,r.title,r.description,r.payment_type,r.amount,r.currency,r.due_date,r.status,r.payment_provider,r.paid_at,r.created_at,a.installment,a.paid_price,a.merchant_commission_rate,a.merchant_commission_rate_amount,a.iyzi_commission_rate_amount,a.iyzi_commission_fee,a.environment,f.status
 from public.studio_client_payment_requests r left join public.studio_client_payment_attempts a on a.payment_request_id=r.id and a.status in('succeeded','refunded') left join public.studio_client_payment_refunds f on f.payment_attempt_id=a.id
 where r.organization_id=v_org and r.project_id=p_project_id order by r.created_at desc;
end $$;
revoke all on function public.studio_list_client_payment_requests_v2(uuid) from public,anon;
grant execute on function public.studio_list_client_payment_requests_v2(uuid) to authenticated;

create function public.iyzico_finalize_payment_v3(p_attempt_id uuid,p_provider_payment_id text,p_amount numeric,p_paid_price numeric,p_currency text,p_environment text,p_installment integer,p_merchant_commission_rate numeric,p_merchant_commission_rate_amount numeric,p_iyzi_commission_rate_amount numeric,p_iyzi_commission_fee numeric,p_payment_transaction_id text,p_three_ds_status text)
returns boolean language plpgsql security definer set search_path=public as $$
declare ok boolean;
begin
 if p_paid_price<p_amount or p_installment not in(1,2,3,4,6,9,12) then return false;end if;
 ok:=public.iyzico_finalize_payment_v2(p_attempt_id,p_provider_payment_id,p_amount,p_currency,p_environment);
 if not ok then return false;end if;
 update public.studio_client_payment_attempts set paid_price=p_paid_price,installment=p_installment,merchant_commission_rate=p_merchant_commission_rate,merchant_commission_rate_amount=p_merchant_commission_rate_amount,iyzi_commission_rate_amount=p_iyzi_commission_rate_amount,iyzi_commission_fee=p_iyzi_commission_fee,provider_payment_transaction_id=p_payment_transaction_id,three_ds_status=p_three_ds_status,updated_at=now() where id=p_attempt_id and environment=p_environment;
 return found;
end $$;
revoke all on function public.iyzico_finalize_payment_v3(uuid,text,numeric,numeric,text,text,integer,numeric,numeric,numeric,numeric,text,text) from public,anon,authenticated;
grant execute on function public.iyzico_finalize_payment_v3(uuid,text,numeric,numeric,text,text,integer,numeric,numeric,numeric,numeric,text,text) to service_role;

create function public.studio_claim_iyzico_full_refund(p_project_id uuid,p_payment_request_id uuid,p_conversation_id text)
returns setof public.studio_client_payment_refunds language plpgsql security definer set search_path=public as $$
declare v_org uuid;a public.studio_client_payment_attempts%rowtype;r public.studio_client_payment_requests%rowtype;f public.studio_client_payment_refunds%rowtype;
begin
 select organization_id into v_org from public.studio_projects where id=p_project_id and not is_archived;
 if v_org is null or not public.studio_has_organization_role(v_org,array['owner']) then raise exception 'forbidden' using errcode='42501';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_payment_request_id::text,1));
 select * into r from public.studio_client_payment_requests where id=p_payment_request_id and project_id=p_project_id and organization_id=v_org for update;
 if r.id is null or r.status not in('paid','refunded') then raise exception 'payment_not_refundable' using errcode='P0001';end if;
 select * into a from public.studio_client_payment_attempts where payment_request_id=r.id and status in('succeeded','refunded') order by completed_at desc limit 1 for update;
 if a.id is null or a.provider_payment_id is null or a.paid_price is null then raise exception 'payment_metadata_incomplete' using errcode='P0001';end if;
 select * into f from public.studio_client_payment_refunds where payment_attempt_id=a.id;
 if f.id is null then insert into public.studio_client_payment_refunds(payment_attempt_id,payment_request_id,organization_id,project_id,environment,conversation_id,provider_payment_id,principal_amount,provider_refund_amount,currency,initiated_by) values(a.id,r.id,v_org,p_project_id,a.environment,p_conversation_id,a.provider_payment_id,r.amount,a.paid_price,r.currency,auth.uid()) returning * into f;end if;
 return next f;
end $$;
revoke all on function public.studio_claim_iyzico_full_refund(uuid,uuid,text) from public,anon;
grant execute on function public.studio_claim_iyzico_full_refund(uuid,uuid,text) to authenticated;

create function public.iyzico_fail_refund(p_refund_id uuid,p_error_code text)
returns boolean language sql security definer set search_path=public as $$update public.studio_client_payment_refunds set status='failed',error_code=left(p_error_code,100),updated_at=now() where id=p_refund_id and status='processing' returning true$$;
revoke all on function public.iyzico_fail_refund(uuid,text) from public,anon,authenticated;
grant execute on function public.iyzico_fail_refund(uuid,text) to service_role;

create function public.iyzico_finalize_full_refund(p_refund_id uuid,p_provider_payment_id text,p_refund_amount numeric,p_currency text,p_environment text,p_provider_refund_reference text)
returns boolean language plpgsql security definer set search_path=public as $$
declare f public.studio_client_payment_refunds%rowtype;r public.studio_client_payment_requests%rowtype;entry_id uuid;
begin
 select * into f from public.studio_client_payment_refunds where id=p_refund_id for update;
 if f.id is null then return false;end if;if f.status='succeeded' then return true;end if;
 if f.status<>'processing' or f.provider_payment_id<>p_provider_payment_id or f.provider_refund_amount<>p_refund_amount or f.currency<>p_currency or f.environment<>p_environment then return false;end if;
 select * into r from public.studio_client_payment_requests where id=f.payment_request_id for update;
 if r.id is null or r.status<>'paid' then return false;end if;
 insert into public.studio_finance_entries(organization_id,project_id,entry_type,source_type,title,description,category,status,amount,paid_amount,tax_rate,currency,entry_date,is_client_visible,created_by,updated_by)
 values(f.organization_id,f.project_id,'expense','project','iyzico ödeme iadesi',concat(r.title,' için iyzico tam iade kaydı.'),'other','paid',f.principal_amount,f.principal_amount,0,f.currency,current_date,false,f.initiated_by,f.initiated_by) returning id into entry_id;
 update public.studio_client_payment_refunds set status='succeeded',finance_entry_id=entry_id,provider_refund_reference=p_provider_refund_reference,completed_at=now(),updated_at=now() where id=f.id;
 update public.studio_client_payment_requests set status='refunded',updated_at=now() where id=r.id;
 update public.studio_client_payment_attempts set status='refunded',updated_at=now() where id=f.payment_attempt_id;
 return true;
end $$;
revoke all on function public.iyzico_finalize_full_refund(uuid,text,numeric,text,text,text) from public,anon,authenticated;
grant execute on function public.iyzico_finalize_full_refund(uuid,text,numeric,text,text,text) to service_role;

notify pgrst,'reload schema';
commit;
