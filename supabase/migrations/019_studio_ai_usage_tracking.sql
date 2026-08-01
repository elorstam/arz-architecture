begin;
create table if not exists public.studio_ai_usage_events(
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id), user_id uuid not null references auth.users(id),
 module text not null check(module in('official_processes','project_stages','crm','proposals','decision_log')),
 operation text not null check(operation in('fee_ai_whatsapp_message','stage_ai_description','crm_ai_meeting_note','proposal_ai_description','decision_ai_summary')),
 model text, input_tokens bigint check(input_tokens is null or input_tokens>=0), output_tokens bigint check(output_tokens is null or output_tokens>=0), total_tokens bigint check(total_tokens is null or total_tokens>=0), cached_input_tokens bigint check(cached_input_tokens is null or cached_input_tokens>=0), reasoning_tokens bigint check(reasoning_tokens is null or reasoning_tokens>=0),
 estimated_cost_usd numeric(18,8) check(estimated_cost_usd is null or estimated_cost_usd>=0), status text not null check(status in('success','fallback','failed')), fallback_used boolean not null default false, usage_unavailable boolean not null default false, pricing_unknown boolean not null default false, safe_error_code text, provider_request_id text, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(),
 constraint studio_ai_usage_metadata_object check(jsonb_typeof(metadata)='object')
);
create unique index if not exists studio_ai_usage_provider_request_uq on public.studio_ai_usage_events(provider_request_id) where provider_request_id is not null;
create index if not exists studio_ai_usage_org_created_idx on public.studio_ai_usage_events(organization_id,created_at desc);
create index if not exists studio_ai_usage_module_operation_idx on public.studio_ai_usage_events(module,operation,created_at desc);
create index if not exists studio_ai_usage_model_idx on public.studio_ai_usage_events(model,created_at desc);
alter table public.studio_ai_usage_events enable row level security;
do $$ begin if not exists(select 1 from pg_policies where schemaname='public' and tablename='studio_ai_usage_events' and policyname='studio_ai_usage_owner_insert') then create policy studio_ai_usage_owner_insert on public.studio_ai_usage_events for insert to authenticated with check(user_id=auth.uid() and public.studio_has_organization_role(organization_id,array['owner']));end if;end $$;
grant insert on public.studio_ai_usage_events to authenticated;
grant select,insert on public.studio_ai_usage_events to service_role;
revoke delete,update on public.studio_ai_usage_events from anon,authenticated;
notify pgrst,'reload schema';
commit;
