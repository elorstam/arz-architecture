begin;

create table if not exists public.visualizer_machines(
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.organizations(id) on delete restrict,
  name text not null check(length(trim(name)) between 1 and 120),
  hostname text not null check(length(trim(hostname)) between 1 and 255),
  os text not null default 'unknown' check(length(os) between 1 and 80),
  agent_version text not null check(length(agent_version) between 1 and 80),
  gpu_name text,
  gpu_vram_mb integer check(gpu_vram_mb is null or gpu_vram_mb between 0 and 4194304),
  status text not null default 'offline' check(status in('online','busy','offline','disabled')),
  max_concurrent_jobs integer not null default 1 check(max_concurrent_jobs between 1 and 32),
  current_job_count integer not null default 0 check(current_job_count between 0 and 32),
  last_heartbeat_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  disabled_at timestamptz
);

create table if not exists public.visualizer_machine_credentials(
  id uuid primary key default gen_random_uuid(),
  machine_id uuid not null references public.visualizer_machines(id) on delete restrict,
  secret_hash text not null unique check(secret_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);

create table if not exists public.visualizer_machine_events(
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.organizations(id) on delete restrict,
  machine_id uuid not null references public.visualizer_machines(id) on delete restrict,
  event_type text not null check(event_type in('registered','credential_issued','credential_revoked','heartbeat','disabled','enabled')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists visualizer_machines_workspace_idx on public.visualizer_machines(workspace_id,status);
create index if not exists visualizer_machine_credentials_machine_idx on public.visualizer_machine_credentials(machine_id) where revoked_at is null;
create index if not exists visualizer_machine_events_machine_idx on public.visualizer_machine_events(machine_id,created_at desc);

alter table public.visualizer_machines enable row level security;
alter table public.visualizer_machine_credentials enable row level security;
alter table public.visualizer_machine_events enable row level security;

drop policy if exists visualizer_machines_member_read on public.visualizer_machines;
create policy visualizer_machines_member_read on public.visualizer_machines for select to authenticated using(
  exists(select 1 from public.organization_members m where m.organization_id=visualizer_machines.workspace_id and m.user_id=auth.uid() and m.status='active')
);
drop policy if exists visualizer_machine_events_member_read on public.visualizer_machine_events;
create policy visualizer_machine_events_member_read on public.visualizer_machine_events for select to authenticated using(
  exists(select 1 from public.organization_members m where m.organization_id=visualizer_machine_events.workspace_id and m.user_id=auth.uid() and m.status='active')
);

revoke all on public.visualizer_machine_credentials from anon, authenticated;
revoke insert, update, delete on public.visualizer_machines from anon, authenticated;
revoke insert, update, delete on public.visualizer_machine_events from anon, authenticated;
grant select on public.visualizer_machines, public.visualizer_machine_events to authenticated;

commit;
