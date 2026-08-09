begin;

create or replace function public.studio_list_client_payment_requests_v2(p_project_id uuid)
returns table(id uuid,title text,description text,payment_type text,amount numeric,currency text,due_date date,status text,payment_provider text,paid_at timestamptz,created_at timestamptz,installment integer,paid_price numeric,merchant_commission_rate numeric,merchant_commission_rate_amount numeric,iyzi_commission_rate_amount numeric,iyzi_commission_fee numeric,environment text,refund_status text)
language plpgsql stable security definer set search_path=public as $$
declare v_org uuid;
begin
 select sp.organization_id into v_org
 from public.studio_projects as sp
 where sp.id=p_project_id and not sp.is_archived;

 if v_org is null or not public.studio_is_non_client_member(v_org) then
  raise exception 'forbidden' using errcode='42501';
 end if;

 return query
 select pr.id,pr.title,pr.description,pr.payment_type,pr.amount,pr.currency,pr.due_date,pr.status,pr.payment_provider,pr.paid_at,pr.created_at,
        pa.installment,pa.paid_price,pa.merchant_commission_rate,pa.merchant_commission_rate_amount,pa.iyzi_commission_rate_amount,pa.iyzi_commission_fee,pa.environment,rf.status
 from public.studio_client_payment_requests as pr
 left join public.studio_client_payment_attempts as pa on pa.payment_request_id=pr.id and pa.status in('succeeded','refunded')
 left join public.studio_client_payment_refunds as rf on rf.payment_attempt_id=pa.id
 where pr.organization_id=v_org and pr.project_id=p_project_id
 order by pr.created_at desc;
end $$;

revoke all on function public.studio_list_client_payment_requests_v2(uuid) from public,anon;
grant execute on function public.studio_list_client_payment_requests_v2(uuid) to authenticated;

notify pgrst,'reload schema';
commit;
