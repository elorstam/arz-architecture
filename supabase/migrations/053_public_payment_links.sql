begin;

create table public.studio_public_payment_links(
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references public.organizations(id) on delete cascade,
 project_id uuid not null references public.studio_projects(id) on delete cascade,
 payment_request_id uuid not null references public.studio_client_payment_requests(id) on delete cascade,
 token_hash text not null unique check(token_hash~'^[0-9a-f]{64}$'),
 status text not null default 'active' check(status in('active','paid','revoked','expired')),
 expires_at timestamptz not null,
 revoked_at timestamptz,
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 last_opened_at timestamptz,
 paid_at timestamptz,
 buyer_full_name text not null,
 buyer_email text not null,
 buyer_gsm_number text not null,
 buyer_identity_number_encrypted text not null,
 buyer_identity_number_last_two text not null check(buyer_identity_number_last_two~'^[0-9]{2}$'),
 buyer_registration_address text not null,
 buyer_city text not null,
 buyer_country text not null,
 buyer_zip_code text,
 check(expires_at>created_at),
 check((status='revoked')=(revoked_at is not null)),
 check((status='paid')=(paid_at is not null))
);

create unique index studio_public_payment_links_one_active_idx on public.studio_public_payment_links(payment_request_id) where status='active' and revoked_at is null;
create index studio_public_payment_links_project_idx on public.studio_public_payment_links(project_id,created_at desc);
alter table public.studio_public_payment_links enable row level security;
revoke all on table public.studio_public_payment_links from public,anon,authenticated;
grant select,insert,update on table public.studio_public_payment_links to service_role;

alter table public.studio_client_payment_attempts
 add column checkout_source text not null default 'client_portal' check(checkout_source in('client_portal','public_link')),
 add column public_payment_link_id uuid references public.studio_public_payment_links(id);

create function public.studio_list_public_payment_links(p_project_id uuid)
returns table(payment_request_id uuid,link_id uuid,status text,expires_at timestamptz,last_opened_at timestamptz,paid_at timestamptz,buyer_full_name text,buyer_email text,buyer_gsm_number text,buyer_identity_number_masked text,buyer_registration_address text,buyer_city text,buyer_country text,buyer_zip_code text)
language plpgsql security definer set search_path=public as $$
declare v_org uuid;
begin
 select p.organization_id into v_org from public.studio_projects p where p.id=p_project_id and not p.is_archived;
 if v_org is null or not public.studio_has_organization_role(v_org,array['owner']) then raise exception 'forbidden' using errcode='42501';end if;
 update public.studio_public_payment_links set status='expired',updated_at=now() where project_id=p_project_id and status='active' and expires_at<=now();
 return query select l.payment_request_id,l.id,l.status,l.expires_at,l.last_opened_at,l.paid_at,l.buyer_full_name,l.buyer_email,l.buyer_gsm_number,repeat('*',9)||l.buyer_identity_number_last_two,l.buyer_registration_address,l.buyer_city,l.buyer_country,l.buyer_zip_code
 from public.studio_public_payment_links l where l.organization_id=v_org and l.project_id=p_project_id order by l.created_at desc;
end $$;

create function public.studio_create_public_payment_link(p_project_id uuid,p_payment_request_id uuid,p_token_hash text,p_expires_at timestamptz,p_buyer_full_name text,p_buyer_email text,p_buyer_gsm_number text,p_buyer_identity_number_encrypted text,p_buyer_identity_number_last_two text,p_buyer_registration_address text,p_buyer_city text,p_buyer_country text,p_buyer_zip_code text)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_org uuid;v_id uuid;v_phone text;
begin
 select r.organization_id into v_org from public.studio_client_payment_requests r join public.studio_projects p on p.id=r.project_id and p.organization_id=r.organization_id and not p.is_archived where r.id=p_payment_request_id and r.project_id=p_project_id and r.status='pending' and r.amount>0 for update;
 if v_org is null then raise exception 'payment_request_not_payable' using errcode='P0001';end if;
 if not public.studio_has_organization_role(v_org,array['owner']) then raise exception 'forbidden' using errcode='42501';end if;
 if p_token_hash!~'^[0-9a-f]{64}$' or p_expires_at<=now() then raise exception 'link_invalid' using errcode='22023';end if;
 v_phone:=regexp_replace(btrim(p_buyer_gsm_number),'[[:space:]()\-]','','g');
 if char_length(btrim(p_buyer_full_name))<3 or position(' ' in btrim(p_buyer_full_name))=0 or btrim(p_buyer_email)!~*'^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' or v_phone!~'^\+?[0-9]{10,15}$' or p_buyer_identity_number_encrypted='' or p_buyer_identity_number_last_two!~'^[0-9]{2}$' or char_length(btrim(p_buyer_registration_address))<5 or char_length(btrim(p_buyer_city))<2 or char_length(btrim(p_buyer_country))<2 then raise exception 'profile_invalid' using errcode='22023';end if;
 update public.studio_public_payment_links set status='revoked',revoked_at=now(),updated_at=now() where payment_request_id=p_payment_request_id and status='active';
 insert into public.studio_public_payment_links(organization_id,project_id,payment_request_id,token_hash,expires_at,created_by,buyer_full_name,buyer_email,buyer_gsm_number,buyer_identity_number_encrypted,buyer_identity_number_last_two,buyer_registration_address,buyer_city,buyer_country,buyer_zip_code)
 values(v_org,p_project_id,p_payment_request_id,p_token_hash,p_expires_at,auth.uid(),btrim(p_buyer_full_name),lower(btrim(p_buyer_email)),v_phone,p_buyer_identity_number_encrypted,p_buyer_identity_number_last_two,btrim(p_buyer_registration_address),btrim(p_buyer_city),btrim(p_buyer_country),nullif(btrim(coalesce(p_buyer_zip_code,'')),'')) returning id into v_id;
 return v_id;
end $$;

create function public.studio_revoke_public_payment_link(p_project_id uuid,p_payment_request_id uuid)
returns boolean language plpgsql security definer set search_path=public as $$
declare v_org uuid;
begin
 select p.organization_id into v_org from public.studio_projects p where p.id=p_project_id and not p.is_archived;
 if v_org is null or not public.studio_has_organization_role(v_org,array['owner']) then raise exception 'forbidden' using errcode='42501';end if;
 update public.studio_public_payment_links set status='revoked',revoked_at=now(),updated_at=now() where organization_id=v_org and project_id=p_project_id and payment_request_id=p_payment_request_id and status='active';return found;
end $$;

create function public.sync_public_payment_link_status() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if new.status='paid' then update public.studio_public_payment_links set status='paid',paid_at=coalesce(new.paid_at,now()),updated_at=now() where payment_request_id=new.id and status='active';
 elsif new.status in('cancelled','refunded') then update public.studio_public_payment_links set status='revoked',revoked_at=now(),updated_at=now() where payment_request_id=new.id and status='active';end if;
 return new;
end $$;
create trigger studio_public_payment_link_payment_status after update of status on public.studio_client_payment_requests for each row when(old.status is distinct from new.status) execute function public.sync_public_payment_link_status();

revoke all on function public.studio_list_public_payment_links(uuid),public.studio_create_public_payment_link(uuid,uuid,text,timestamptz,text,text,text,text,text,text,text,text,text),public.studio_revoke_public_payment_link(uuid,uuid) from public,anon;
grant execute on function public.studio_list_public_payment_links(uuid),public.studio_create_public_payment_link(uuid,uuid,text,timestamptz,text,text,text,text,text,text,text,text,text),public.studio_revoke_public_payment_link(uuid,uuid) to authenticated;
revoke all on function public.sync_public_payment_link_status() from public,anon,authenticated;

notify pgrst,'reload schema';
commit;
