begin;
drop policy if exists client_payment_billing_profile_select_own on public.studio_client_payment_billing_profiles;
drop policy if exists client_payment_billing_profile_insert_own on public.studio_client_payment_billing_profiles;
drop policy if exists client_payment_billing_profile_update_own on public.studio_client_payment_billing_profiles;
revoke all on table public.studio_client_payment_billing_profiles from public,anon,authenticated;

create or replace function public.studio_list_client_payment_billing_profiles(p_project_id uuid)
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

create or replace function public.studio_upsert_client_payment_billing_profile(p_project_id uuid,p_client_user_id uuid,p_full_name text,p_email text,p_gsm_number text,p_identity_number text,p_registration_address text,p_city text,p_country text,p_zip_code text)
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
notify pgrst,'reload schema';
commit;
