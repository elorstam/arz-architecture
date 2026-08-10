begin;
drop function if exists public.iyzico_create_payment_attempt_v2(uuid,uuid,text,text,text,timestamptz,text,integer[]);
alter table public.studio_client_payment_attempts drop column if exists enabled_installments,drop column if exists checkout_config_fingerprint;
notify pgrst,'reload schema';
commit;
