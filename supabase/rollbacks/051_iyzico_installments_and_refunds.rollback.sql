begin;
do $$begin if exists(select 1 from public.studio_client_payment_refunds) then raise exception '051 rollback requires refund reconciliation first';end if;end$$;
drop function if exists public.iyzico_finalize_full_refund(uuid,text,numeric,text,text,text);
drop function if exists public.iyzico_fail_refund(uuid,text);
drop function if exists public.studio_claim_iyzico_full_refund(uuid,uuid,text);
drop function if exists public.iyzico_finalize_payment_v3(uuid,text,numeric,numeric,text,text,integer,numeric,numeric,numeric,numeric,text,text);
drop function if exists public.studio_list_client_payment_requests_v2(uuid);
drop table public.studio_client_payment_refunds;

drop function public.client_portal_list_payment_requests(uuid);
create function public.client_portal_list_payment_requests(p_project_id uuid)
returns table(id uuid,project_id uuid,project_name text,title text,description text,payment_type text,amount numeric,currency text,due_date date,status text,payment_provider text,paid_at timestamptz,created_at timestamptz)
language sql stable security definer set search_path=public as $$
 select r.id,r.project_id,p.name,r.title,r.description,r.payment_type,r.amount,r.currency,r.due_date,r.status,r.payment_provider,r.paid_at,r.created_at
 from public.studio_client_payment_requests r join public.studio_projects p on p.id=r.project_id and p.organization_id=r.organization_id
 where r.project_id=p_project_id and r.status in('pending','paid') and public.studio_client_can_access_project(auth.uid(),r.project_id)
 order by case when r.status='pending' then 0 else 1 end,r.due_date nulls last,r.created_at desc
$$;
revoke all on function public.client_portal_list_payment_requests(uuid) from public,anon;
grant execute on function public.client_portal_list_payment_requests(uuid) to authenticated;

alter table public.studio_client_payment_requests drop constraint studio_client_payment_requests_status_check;
alter table public.studio_client_payment_requests add constraint studio_client_payment_requests_status_check check(status in('pending','paid','cancelled'));
alter table public.studio_client_payment_attempts drop constraint studio_client_payment_attempts_paid_price_check;
alter table public.studio_client_payment_attempts drop constraint studio_client_payment_attempts_installment_check;
alter table public.studio_client_payment_attempts drop constraint studio_client_payment_attempts_status_check;
alter table public.studio_client_payment_attempts add constraint studio_client_payment_attempts_status_check check(status in('created','awaiting_payment','succeeded','failed','expired','superseded'));
alter table public.studio_client_payment_attempts drop column paid_price,drop column installment,drop column merchant_commission_rate,drop column merchant_commission_rate_amount,drop column iyzi_commission_rate_amount,drop column iyzi_commission_fee,drop column provider_payment_transaction_id,drop column three_ds_status;
notify pgrst,'reload schema';
commit;
