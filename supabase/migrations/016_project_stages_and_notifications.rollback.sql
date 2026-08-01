begin;
drop trigger if exists studio_validate_stage_scope_trigger on public.studio_project_stages;
drop function if exists public.studio_validate_stage_scope(); drop function if exists public.studio_initialize_project_stages(uuid,uuid);
drop table if exists public.studio_notification_events; drop table if exists public.studio_notifications; drop table if exists public.studio_notification_automations; drop table if exists public.studio_notification_templates; drop table if exists public.studio_project_stages;
alter table public.studio_leads drop column if exists communication_consent_source,drop column if exists communication_consent_at,drop column if exists preferred_communication_channel,drop column if exists portal_notification_opt_in,drop column if exists email_notification_opt_in,drop column if exists whatsapp_phone,drop column if exists whatsapp_opt_in;
commit;
