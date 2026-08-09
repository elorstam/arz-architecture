begin;

alter table public.studio_client_payment_billing_profiles alter column identity_number drop not null;
alter table public.studio_client_payment_billing_profiles add column identity_number_encrypted text;
alter table public.studio_client_payment_billing_profiles add column identity_number_last_two text check(identity_number_last_two is null or identity_number_last_two~'^[0-9]{2}$');
alter table public.studio_client_payment_billing_profiles add constraint studio_client_payment_identity_present check(identity_number is not null or identity_number_encrypted is not null);

create or replace function public.studio_list_client_payment_billing_profiles(p_project_id uuid)
returns table(user_id uuid,full_name text,email text,gsm_number text,identity_number text,registration_address text,city text,country text,zip_code text,is_complete boolean)
language plpgsql stable security definer set search_path=public as $$
declare v_org uuid;
begin
 select p.organization_id into v_org from public.studio_projects p where p.id=p_project_id and not p.is_archived;
 if v_org is null or not public.studio_has_organization_role(v_org,array['owner']) then raise exception 'forbidden' using errcode='42501';end if;
 return query select a.user_id,coalesce(b.full_name,pr.full_name),coalesce(b.email,pr.email),coalesce(b.gsm_number,nullif(p.client_phone,'')),case when b.user_id is null then null else repeat('*',9)||coalesce(b.identity_number_last_two,right(b.identity_number,2)) end,b.registration_address,b.city,b.country,b.zip_code,(b.user_id is not null and(b.identity_number_encrypted is not null or b.identity_number is not null))
 from public.studio_client_project_access a join public.studio_projects p on p.id=a.project_id and p.organization_id=a.organization_id join public.profiles pr on pr.id=a.user_id left join public.studio_client_payment_billing_profiles b on b.user_id=a.user_id
 where a.organization_id=v_org and a.project_id=p_project_id and a.revoked_at is null order by coalesce(pr.full_name,pr.email);
end $$;

create function public.studio_upsert_client_payment_billing_profile_encrypted(p_project_id uuid,p_client_user_id uuid,p_full_name text,p_email text,p_gsm_number text,p_identity_number_encrypted text,p_identity_number_last_two text,p_registration_address text,p_city text,p_country text,p_zip_code text)
returns boolean language plpgsql security definer set search_path=public as $$
declare v_org uuid;v_phone text;v_exists boolean;
begin
 select p.organization_id into v_org from public.studio_projects p where p.id=p_project_id and not p.is_archived;
 if v_org is null or not public.studio_has_organization_role(v_org,array['owner']) then raise exception 'forbidden' using errcode='42501';end if;
 if not exists(select 1 from public.studio_client_project_access a where a.organization_id=v_org and a.project_id=p_project_id and a.user_id=p_client_user_id and a.revoked_at is null) then raise exception 'client_access_not_found' using errcode='P0002';end if;
 select exists(select 1 from public.studio_client_payment_billing_profiles where user_id=p_client_user_id) into v_exists;
 if p_identity_number_last_two!~'^[0-9]{2}$' or(not v_exists and p_identity_number_encrypted is null) then raise exception 'identity_invalid' using errcode='22023';end if;
 v_phone:=regexp_replace(btrim(p_gsm_number),'[[:space:]()\-]','','g');
 if char_length(btrim(p_full_name))<3 or position(' ' in btrim(p_full_name))=0 or btrim(p_email)!~*'^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' or v_phone!~'^\+?[0-9]{10,15}$' then raise exception 'profile_invalid' using errcode='22023';end if;
 if char_length(btrim(p_registration_address))<5 or char_length(btrim(p_city))<2 or char_length(btrim(p_country))<2 then raise exception 'billing_address_incomplete' using errcode='22023';end if;
 insert into public.studio_client_payment_billing_profiles(user_id,full_name,identity_number,identity_number_encrypted,identity_number_last_two,email,gsm_number,registration_address,city,country,zip_code)
 values(p_client_user_id,btrim(p_full_name),null,p_identity_number_encrypted,p_identity_number_last_two,lower(btrim(p_email)),v_phone,btrim(p_registration_address),btrim(p_city),btrim(p_country),nullif(btrim(coalesce(p_zip_code,'')),''))
 on conflict(user_id) do update set full_name=excluded.full_name,identity_number=case when excluded.identity_number_encrypted is not null then null else studio_client_payment_billing_profiles.identity_number end,identity_number_encrypted=coalesce(excluded.identity_number_encrypted,studio_client_payment_billing_profiles.identity_number_encrypted),identity_number_last_two=coalesce(excluded.identity_number_last_two,studio_client_payment_billing_profiles.identity_number_last_two),email=excluded.email,gsm_number=excluded.gsm_number,registration_address=excluded.registration_address,city=excluded.city,country=excluded.country,zip_code=excluded.zip_code,updated_at=now();
 return true;
end $$;

revoke all on function public.studio_upsert_client_payment_billing_profile(uuid,uuid,text,text,text,text,text,text,text,text) from public,anon,authenticated;
revoke all on function public.studio_upsert_client_payment_billing_profile_encrypted(uuid,uuid,text,text,text,text,text,text,text,text,text) from public,anon;
grant execute on function public.studio_upsert_client_payment_billing_profile_encrypted(uuid,uuid,text,text,text,text,text,text,text,text,text) to authenticated;

drop function public.client_portal_get_payment_request_for_checkout(uuid);
create function public.client_portal_get_payment_request_for_checkout(p_payment_request_id uuid)
returns table(id uuid,organization_id uuid,project_id uuid,project_name text,title text,amount numeric,currency text,status text,buyer_id uuid,buyer_full_name text,buyer_identity_number text,buyer_email text,buyer_gsm_number text,buyer_registration_address text,buyer_city text,buyer_country text,buyer_zip_code text)
language sql stable security definer set search_path=public as $$
 select r.id,r.organization_id,r.project_id,p.name,r.title,r.amount,r.currency,r.status,auth.uid(),b.full_name,null::text,b.email,b.gsm_number,b.registration_address,b.city,b.country,b.zip_code
 from public.studio_client_payment_requests r join public.studio_projects p on p.id=r.project_id and p.organization_id=r.organization_id left join public.studio_client_payment_billing_profiles b on b.user_id=auth.uid()
 where r.id=p_payment_request_id and public.studio_client_can_access_project(auth.uid(),r.project_id)
$$;
revoke all on function public.client_portal_get_payment_request_for_checkout(uuid) from public,anon;
grant execute on function public.client_portal_get_payment_request_for_checkout(uuid) to authenticated;

create or replace function public.iyzico_create_payment_attempt(p_payment_request_id uuid,p_initiated_by uuid,p_environment text,p_conversation_id text,p_basket_id text,p_expires_at timestamptz)
returns setof public.studio_client_payment_attempts language plpgsql security definer set search_path=public as $$
declare r public.studio_client_payment_requests%rowtype;a public.studio_client_payment_attempts%rowtype;
begin
 if p_environment not in('sandbox','live') then raise exception 'payment_environment_invalid' using errcode='22023';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_payment_request_id::text,0));select * into r from public.studio_client_payment_requests where id=p_payment_request_id for update;
 if r.id is null then raise exception 'payment_not_found' using errcode='P0002';end if;if r.status='paid' then raise exception 'payment_already_paid' using errcode='P0001';end if;if r.status='cancelled' then raise exception 'payment_cancelled' using errcode='P0001';end if;
 update public.studio_client_payment_attempts set status='expired',updated_at=now() where payment_request_id=r.id and status in('created','awaiting_payment') and expires_at<=now();
 update public.studio_client_payment_attempts set status='superseded',updated_at=now() where payment_request_id=r.id and status in('created','awaiting_payment') and environment<>p_environment;
 select * into a from public.studio_client_payment_attempts where payment_request_id=r.id and environment=p_environment and status in('created','awaiting_payment') limit 1;
 if a.id is null then insert into public.studio_client_payment_attempts(payment_request_id,organization_id,project_id,environment,conversation_id,basket_id,amount,currency,initiated_by,expires_at) values(r.id,r.organization_id,r.project_id,p_environment,p_conversation_id,p_basket_id,r.amount,r.currency,p_initiated_by,p_expires_at) returning * into a;end if;return next a;
end $$;

create function public.iyzico_finalize_payment_v2(p_attempt_id uuid,p_provider_payment_id text,p_amount numeric,p_currency text,p_environment text)
returns boolean language plpgsql security definer set search_path=public as $$
declare v_environment text;
begin
 select environment into v_environment from public.studio_client_payment_attempts where id=p_attempt_id for update;
 if v_environment is null or v_environment<>p_environment then return false;end if;
 return public.iyzico_finalize_payment(p_attempt_id,p_provider_payment_id,p_amount,p_currency);
end $$;
revoke all on function public.iyzico_finalize_payment(uuid,text,numeric,text) from service_role;
revoke all on function public.iyzico_finalize_payment_v2(uuid,text,numeric,text,text) from public,anon,authenticated;
grant execute on function public.iyzico_finalize_payment_v2(uuid,text,numeric,text,text) to service_role;

notify pgrst,'reload schema';
commit;
