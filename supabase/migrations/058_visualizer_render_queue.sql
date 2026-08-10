begin;

create table if not exists public.visualizer_render_jobs(
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  project_id uuid not null references public.studio_projects(id) on delete restrict,
  created_by uuid not null references auth.users(id) on delete restrict,
  status text not null default 'queued' check(status in('queued','assigned','running','paused','completed','failed','cancelled')),
  desired_state text not null default 'running' check(desired_state in('running','paused','cancelled')),
  priority integer not null default 50 check(priority between 0 and 100),
  quality text not null check(quality in('draft','standard','ultra_final')),
  requested_compute_mode text not null check(requested_compute_mode in('auto','local','cloud')),
  resolved_compute_mode text check(resolved_compute_mode is null or resolved_compute_mode in('local','cloud')),
  render_mode text not null check(render_mode in('interior','exterior')),
  time_of_day text not null check(time_of_day in('day','golden_hour','night')),
  weather text not null check(weather in('clear','cloudy','rain')),
  request_snapshot jsonb not null,
  assigned_machine_id uuid references public.visualizer_machines(id) on delete restrict,
  assignment_lease_id uuid,
  assignment_lease_expires_at timestamptz,
  minimum_gpu_vram_mb integer check(minimum_gpu_vram_mb is null or minimum_gpu_vram_mb >= 0),
  progress_percent integer not null default 0 check(progress_percent between 0 and 100),
  eta_seconds integer check(eta_seconds is null or eta_seconds >= 0),
  attempt_count integer not null default 0 check(attempt_count >= 0),
  max_attempts integer not null default 1 check(max_attempts between 1 and 10),
  error_code text,
  error_message text,
  queued_at timestamptz not null default now(),
  assigned_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  failed_at timestamptz,
  cancelled_at timestamptz,
  last_agent_update_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.visualizer_render_job_events(
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  job_id uuid not null references public.visualizer_render_jobs(id) on delete cascade,
  event_type text not null check(event_type in('created','assigned','started','paused','resumed','cancel_requested','cancelled','failed','completed','requeued','lease_expired')),
  from_status text,
  to_status text,
  actor_type text not null check(actor_type in('user','machine','system')),
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_machine_id uuid references public.visualizer_machines(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists visualizer_render_jobs_queue_idx on public.visualizer_render_jobs(status,priority desc,created_at asc);
create index if not exists visualizer_render_jobs_project_idx on public.visualizer_render_jobs(organization_id,project_id,created_at desc);
create index if not exists visualizer_render_jobs_machine_idx on public.visualizer_render_jobs(assigned_machine_id,status);
create index if not exists visualizer_render_job_events_job_idx on public.visualizer_render_job_events(job_id,created_at desc);

alter table public.visualizer_render_jobs enable row level security;
alter table public.visualizer_render_job_events enable row level security;
drop policy if exists visualizer_render_jobs_member_read on public.visualizer_render_jobs;
create policy visualizer_render_jobs_member_read on public.visualizer_render_jobs for select to authenticated using(
  exists(select 1 from public.organization_members m where m.organization_id=visualizer_render_jobs.organization_id and m.user_id=auth.uid() and m.status='active')
  and exists(select 1 from public.studio_projects p where p.id=visualizer_render_jobs.project_id and p.organization_id=visualizer_render_jobs.organization_id and p.is_archived=false)
);
drop policy if exists visualizer_render_job_events_member_read on public.visualizer_render_job_events;
create policy visualizer_render_job_events_member_read on public.visualizer_render_job_events for select to authenticated using(
  exists(select 1 from public.organization_members m where m.organization_id=visualizer_render_job_events.organization_id and m.user_id=auth.uid() and m.status='active')
);
revoke insert,update,delete on public.visualizer_render_jobs from anon,authenticated;
revoke insert,update,delete on public.visualizer_render_job_events from anon,authenticated;
grant select on public.visualizer_render_jobs,public.visualizer_render_job_events to authenticated;

-- Pull-based claim: the service boundary supplies the authenticated machine id.
-- FOR UPDATE SKIP LOCKED makes simultaneous agents/schedulers mutually exclusive.
create or replace function public.visualizer_claim_next_render_job(p_machine_id uuid,p_now timestamptz default now(),p_lease_seconds integer default 120)
returns setof public.visualizer_render_jobs
language plpgsql
security definer
set search_path=public
as $$
declare selected public.visualizer_render_jobs;
begin
  select j.* into selected
  from public.visualizer_render_jobs j
  join public.visualizer_machines m on m.workspace_id=j.organization_id
  where m.id=p_machine_id and m.disabled_at is null and m.status <> 'disabled'
    and m.last_heartbeat_at is not null and m.last_heartbeat_at >= p_now - interval '90 seconds'
    and (select count(*) from public.visualizer_render_jobs active where active.assigned_machine_id=m.id and active.status in('assigned','running','paused')) < m.max_concurrent_jobs
    and j.status='queued' and j.requested_compute_mode <> 'cloud'
    and (j.minimum_gpu_vram_mb is null or coalesce(m.gpu_vram_mb,0) >= j.minimum_gpu_vram_mb)
  order by j.priority desc,j.created_at asc
  for update of j skip locked limit 1;
  if selected.id is null then return; end if;
  update public.visualizer_render_jobs set status='assigned',resolved_compute_mode='local',assigned_machine_id=p_machine_id,assignment_lease_id=gen_random_uuid(),assignment_lease_expires_at=p_now+(greatest(30,least(p_lease_seconds,600))*interval '1 second'),assigned_at=p_now,attempt_count=attempt_count+1,updated_at=p_now where id=selected.id returning * into selected;
  return next selected;
end $$;
revoke all on function public.visualizer_claim_next_render_job(uuid,timestamptz,integer) from public,anon,authenticated;
grant execute on function public.visualizer_claim_next_render_job(uuid,timestamptz,integer) to service_role;

commit;
