begin;
drop trigger if exists studio_leads_protect_fields on public.studio_leads;
drop trigger if exists studio_leads_set_updated_at on public.studio_leads;
drop function if exists public.studio_protect_lead_fields();
drop table if exists public.studio_leads;
notify pgrst,'reload schema';
commit;
