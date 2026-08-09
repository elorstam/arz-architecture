begin;
drop function if exists public.studio_upsert_client_payment_billing_profile(uuid,uuid,text,text,text,text,text,text,text,text);
drop function if exists public.studio_list_client_payment_billing_profiles(uuid);
notify pgrst,'reload schema';
commit;
