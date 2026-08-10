begin;

-- Reassert the corrected Finance projection from 052. Every relation column is
-- qualified so RETURNS TABLE output variables can never shadow SQL columns.
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

-- 053 introduced this projection. Its UPDATE predicates used bare names that
-- collide with RETURNS TABLE variables (project_id, status and expires_at).
create or replace function public.studio_list_public_payment_links(p_project_id uuid)
returns table(payment_request_id uuid,link_id uuid,status text,expires_at timestamptz,last_opened_at timestamptz,paid_at timestamptz,buyer_full_name text,buyer_email text,buyer_gsm_number text,buyer_identity_number_masked text,buyer_registration_address text,buyer_city text,buyer_country text,buyer_zip_code text)
language plpgsql security definer set search_path=public as $$
declare v_org uuid;
begin
 select sp.organization_id into v_org
 from public.studio_projects as sp
 where sp.id=p_project_id and not sp.is_archived;

 if v_org is null or not public.studio_has_organization_role(v_org,array['owner']) then
  raise exception 'forbidden' using errcode='42501';
 end if;

 update public.studio_public_payment_links as ppl
 set status='expired',updated_at=now()
 where ppl.project_id=p_project_id
   and ppl.status='active'
   and ppl.expires_at<=now();

 return query
 select ppl.payment_request_id,ppl.id,ppl.status,ppl.expires_at,ppl.last_opened_at,ppl.paid_at,
        ppl.buyer_full_name,ppl.buyer_email,ppl.buyer_gsm_number,
        repeat('*',9)||ppl.buyer_identity_number_last_two,
        ppl.buyer_registration_address,ppl.buyer_city,ppl.buyer_country,ppl.buyer_zip_code
 from public.studio_public_payment_links as ppl
 where ppl.organization_id=v_org and ppl.project_id=p_project_id
 order by ppl.created_at desc;
end $$;

revoke all on function public.studio_list_client_payment_requests_v2(uuid),public.studio_list_public_payment_links(uuid) from public,anon;
grant execute on function public.studio_list_client_payment_requests_v2(uuid),public.studio_list_public_payment_links(uuid) to authenticated;

notify pgrst,'reload schema';
commit;
