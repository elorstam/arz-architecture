begin;
do $$begin
 if exists(select 1 from public.studio_client_payment_billing_profiles where identity_number_encrypted is not null) then
  raise exception '049 rollback requires application-key decryption of encrypted payment profiles first';
 end if;
end$$;
revoke all on function public.iyzico_finalize_payment_v2(uuid,text,numeric,text,text) from service_role;
drop function if exists public.iyzico_finalize_payment_v2(uuid,text,numeric,text,text);
grant execute on function public.iyzico_finalize_payment(uuid,text,numeric,text) to service_role;
revoke all on function public.studio_upsert_client_payment_billing_profile_encrypted(uuid,uuid,text,text,text,text,text,text,text,text,text) from authenticated;
drop function if exists public.studio_upsert_client_payment_billing_profile_encrypted(uuid,uuid,text,text,text,text,text,text,text,text,text);
grant execute on function public.studio_upsert_client_payment_billing_profile(uuid,uuid,text,text,text,text,text,text,text,text) to authenticated;
notify pgrst,'reload schema';
commit;
