begin;
revoke select,update on table public.studio_client_payment_billing_profiles from service_role;
commit;
