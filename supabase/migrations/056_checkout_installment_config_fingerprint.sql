begin;

alter table public.studio_client_payment_attempts
 add column checkout_config_fingerprint text check(checkout_config_fingerprint is null or checkout_config_fingerprint~'^[0-9a-f]{64}$'),
 add column enabled_installments integer[] check(enabled_installments is null or enabled_installments<@array[1,2,3,4,6,9,12]);

create function public.iyzico_create_payment_attempt_v2(p_payment_request_id uuid,p_initiated_by uuid,p_environment text,p_conversation_id text,p_basket_id text,p_expires_at timestamptz,p_checkout_config_fingerprint text,p_enabled_installments integer[])
returns setof public.studio_client_payment_attempts language plpgsql security definer set search_path=public as $$
declare r public.studio_client_payment_requests%rowtype;a public.studio_client_payment_attempts%rowtype;
begin
 if p_environment not in('sandbox','live') or p_checkout_config_fingerprint!~'^[0-9a-f]{64}$' or p_enabled_installments is null or cardinality(p_enabled_installments)=0 or not(p_enabled_installments<@array[1,2,3,4,6,9,12]) then raise exception 'payment_config_invalid' using errcode='22023';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_payment_request_id::text,0));
 select pr.* into r from public.studio_client_payment_requests as pr where pr.id=p_payment_request_id for update;
 if r.id is null then raise exception 'payment_not_found' using errcode='P0002';end if;
 if r.status='paid' then raise exception 'payment_already_paid' using errcode='P0001';end if;
 if r.status='cancelled' then raise exception 'payment_cancelled' using errcode='P0001';end if;
 if r.status='refunded' then raise exception 'payment_refunded' using errcode='P0001';end if;
 update public.studio_client_payment_attempts as pa set status='expired',updated_at=now() where pa.payment_request_id=r.id and pa.status in('created','awaiting_payment') and pa.expires_at<=now();
 update public.studio_client_payment_attempts as pa set status='superseded',updated_at=now() where pa.payment_request_id=r.id and pa.status in('created','awaiting_payment') and pa.environment<>p_environment;
 select pa.* into a from public.studio_client_payment_attempts as pa where pa.payment_request_id=r.id and pa.environment=p_environment and pa.status in('created','awaiting_payment') limit 1;
 if a.id is null then
  insert into public.studio_client_payment_attempts(payment_request_id,organization_id,project_id,environment,conversation_id,basket_id,amount,currency,initiated_by,expires_at,checkout_config_fingerprint,enabled_installments)
  values(r.id,r.organization_id,r.project_id,p_environment,p_conversation_id,p_basket_id,r.amount,r.currency,p_initiated_by,p_expires_at,p_checkout_config_fingerprint,p_enabled_installments) returning * into a;
 end if;
 return next a;
end $$;

revoke all on function public.iyzico_create_payment_attempt_v2(uuid,uuid,text,text,text,timestamptz,text,integer[]) from public,anon,authenticated;
grant execute on function public.iyzico_create_payment_attempt_v2(uuid,uuid,text,text,text,timestamptz,text,integer[]) to service_role;
notify pgrst,'reload schema';
commit;
