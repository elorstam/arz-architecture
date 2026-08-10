begin;

create function public.resolve_public_payment_link(p_token_hash text,p_mark_opened boolean default false)
returns table(link_id uuid,created_by uuid,expires_at timestamptz,link_status text,payment_request_id uuid,organization_id uuid,project_id uuid,project_name text,title text,amount numeric,currency text,payment_status text,buyer_full_name text,buyer_email text,buyer_gsm_number text,buyer_identity_number_encrypted text,buyer_identity_number_last_two text,buyer_registration_address text,buyer_city text,buyer_country text,buyer_zip_code text)
language plpgsql security definer set search_path=public as $$
begin
 if p_token_hash!~'^[0-9a-f]{64}$' then return;end if;

 update public.studio_public_payment_links as ppl
 set status='expired',updated_at=now()
 where ppl.token_hash=p_token_hash and ppl.status='active' and ppl.expires_at<=now();

 if p_mark_opened then
  update public.studio_public_payment_links as ppl
  set last_opened_at=now(),updated_at=now()
  where ppl.token_hash=p_token_hash and ppl.status='active' and ppl.expires_at>now();
 end if;

 return query
 select ppl.id,ppl.created_by,ppl.expires_at,ppl.status,pr.id,pr.organization_id,pr.project_id,sp.name,pr.title,pr.amount,pr.currency,pr.status,
        ppl.buyer_full_name,ppl.buyer_email,ppl.buyer_gsm_number,ppl.buyer_identity_number_encrypted,ppl.buyer_identity_number_last_two,
        ppl.buyer_registration_address,ppl.buyer_city,ppl.buyer_country,ppl.buyer_zip_code
 from public.studio_public_payment_links as ppl
 join public.studio_client_payment_requests as pr on pr.id=ppl.payment_request_id and pr.organization_id=ppl.organization_id and pr.project_id=ppl.project_id
 join public.studio_projects as sp on sp.id=pr.project_id and sp.organization_id=pr.organization_id
 where ppl.token_hash=p_token_hash;
end $$;

revoke all on function public.resolve_public_payment_link(text,boolean) from public,anon,authenticated;
grant execute on function public.resolve_public_payment_link(text,boolean) to service_role;

notify pgrst,'reload schema';
commit;
