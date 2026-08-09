begin;
drop function if exists public.client_portal_get_payment_request_for_checkout(uuid);
drop function if exists public.client_portal_list_payment_requests(uuid);
drop function if exists public.studio_cancel_client_payment_request(uuid,uuid);
drop function if exists public.studio_create_client_payment_request(uuid,text,text,text,numeric,text,date);
drop table if exists public.studio_client_payment_requests;
drop function if exists public.studio_validate_client_payment_request();
notify pgrst,'reload schema';
commit;
