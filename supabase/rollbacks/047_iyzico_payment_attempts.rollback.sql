begin;
drop function if exists public.studio_upsert_client_payment_billing_profile(uuid,uuid,text,text,text,text,text,text,text,text);
drop function if exists public.studio_list_client_payment_billing_profiles(uuid);
drop function if exists public.iyzico_finalize_payment(uuid,text,numeric,text);
drop function if exists public.iyzico_create_payment_attempt(uuid,uuid,text,text,text,timestamptz);
drop table if exists public.studio_client_payment_attempts;
drop function if exists public.client_portal_get_payment_request_for_checkout(uuid);
create function public.client_portal_get_payment_request_for_checkout(p_payment_request_id uuid)
returns table(id uuid,organization_id uuid,project_id uuid,project_name text,title text,amount numeric,currency text,due_date date)
language sql stable security definer set search_path=public as $$
 select r.id,r.organization_id,r.project_id,p.name,r.title,r.amount,r.currency,r.due_date
 from public.studio_client_payment_requests r join public.studio_projects p on p.id=r.project_id and p.organization_id=r.organization_id
 where r.id=p_payment_request_id and r.status='pending' and public.studio_client_can_access_project(auth.uid(),r.project_id)
$$;
drop function if exists public.client_portal_list_payment_requests(uuid);
create function public.client_portal_list_payment_requests(p_project_id uuid)
returns table(id uuid,project_id uuid,project_name text,title text,description text,payment_type text,amount numeric,currency text,due_date date,status text,paid_at timestamptz,created_at timestamptz)
language sql stable security definer set search_path=public as $$
 select r.id,r.project_id,p.name,r.title,r.description,r.payment_type,r.amount,r.currency,r.due_date,r.status,r.paid_at,r.created_at
 from public.studio_client_payment_requests r join public.studio_projects p on p.id=r.project_id and p.organization_id=r.organization_id
 where r.project_id=p_project_id and r.status in('pending','paid') and public.studio_client_can_access_project(auth.uid(),r.project_id)
 order by case when r.status='pending' then 0 else 1 end,r.due_date nulls last,r.created_at desc
$$;
drop table if exists public.studio_client_payment_billing_profiles;
notify pgrst,'reload schema';
commit;
