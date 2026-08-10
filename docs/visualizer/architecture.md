# ARZ Visualizer Architecture

## Foundation scope

Phase 10A.0 defines contracts and boundaries only. The existing Studio Render Archive remains the product’s current render surface; no Visualizer tables, routes or queue are introduced.

## Data flow

```text
Studio → Visualizer API → Render Queue → Machine Scheduler → ARZ Visualizer Agent → ComfyUI → Local/Cloud GPU → Render Archive
```

Studio owns user-facing setup and authorization. The future API validates a request and creates a queue item. The scheduler assigns work. The local Python Agent owns machine integration, local files and ComfyUI control. ComfyUI never becomes a direct SketchUp integration point.

## Trust boundaries

- Browser/Studio: authenticated user intent only; never authoritative machine, cost or provider data.
- Visualizer API: server-authoritative organization/project correlation and job contract.
- Agent: authenticated machine boundary; only receives assigned work and reports bounded progress/results.
- ComfyUI/GPU: execution boundary; secrets and model files remain machine-side or in a future controlled cloud worker.

## Quality vs compute

Quality describes the requested output: Draft, Standard or Ultra Final. Compute describes where it may run: Auto, Local or Cloud. Ultra Final is valid on Local when the workflow fits the workstation (for example an RTX 3080), as well as Cloud or future Auto routing.

Cloud is for higher VRAM, faster turnaround or unavailable local machines. Auto will later consider machine health, GPU/VRAM, workflow requirements, queue load, estimated duration and user preference.

## Local storage

The future canonical root is `Documents/ARZ Visualizer/{Project}/{Scene}/` with `Draft/`, `Standard/` and `Ultra/` folders. Each render has a `render.json` sidecar containing request and Render DNA metadata. Phase 10A.0 only provides safe path generation; it does not write image renders.

## Render DNA

Render DNA records the seed, model, workflow version, prompts, references, settings, camera, quality, compute, machine, creator and timestamp. Future additions may include ControlNet, LoRA, sampler and model hashes.

## SketchUp boundary

The Phase 10B Ruby + HtmlDialog plugin will prepare scenes/cameras and trigger the Agent/API boundary. It will never call ComfyUI directly.

## Cloud cache

Future Ultra Final cloud assets default to 15-day retention. The asset may be deleted after retention while metadata remains. Manual cache deletion requires confirmation.

## Phase 10A.1 machine foundation

Visualizer machines reuse the existing `organizations` record as a generic workspace; no duplicate workspace table is created. The machine registry, credential records and audit events are server-controlled. Studio owner/admin authorization is an adapter around the machine service, leaving a future workspace entitlement policy seam.

Registration creates a machine and one credential. The raw `arzv_` credential has 256 bits of random entropy and is returned once only. The database stores only a SHA-256 hash. Credentials are service-role-only, can be rotated or revoked, and a machine is disabled rather than deleted so history remains available.

`POST /api/visualizer/agent/heartbeat` is the narrow agent boundary. It accepts a Bearer credential and bounded machine telemetry, and can update only the credential's associated machine. It never exposes Studio, Client Portal, payment or project data. A normal cadence is about 30 seconds. Database `status` is `online`, `busy`, `offline` or `disabled`; effective health treats disabled as highest priority and treats a missing/stale heartbeat (90 seconds) as offline. No scheduler or cron is included in this phase, so stale status is evaluated by a shared policy when read.

Heartbeat rows are not written to the event table on every request; `last_heartbeat_at` prevents unbounded growth. Events are reserved for registration, credential changes, enable/disable, and sampled/meaningful operational events. Event metadata never contains secrets.

Render generation and Studio publishing are separate trust boundaries. A future explicit publish action may write to the ARZ Studio Render Archive only after server-side owner/admin authorization and an audit event. Future commercial workspaces do not receive that permission by default. Commercial local-first storage remains local (`Documents/ARZ Visualizer/...`); cloud execution is temporary cache, not automatic asset synchronization.

## Phase 10A.2 queue and scheduler

`visualizer_render_jobs` is the canonical queue; there is no duplicate queue or assignment table. A validated, immutable request snapshot is stored with each job. Ordering is deterministic: priority descending (0-100, default 50), then creation time ascending (FIFO). Job events record only major lifecycle changes; progress remains on the job row to avoid event-table growth.

The state machine is centralized: queued -> assigned -> running -> paused/completed/failed/cancelled, with failed -> queued available only through an explicit bounded retry. User intent is separate in `desired_state`; queued cancellation is immediate, while assigned/running/paused cancellation is acknowledged by the agent. A 120-second assigned-not-started lease can be requeued by a future worker/helper. Running work is not blindly duplicated on lease expiry.

Agents pull work through `POST /api/visualizer/agent/jobs/claim`. The server derives machine and workspace from the credential, checks a fresh heartbeat, disabled state, numeric VRAM and authoritative active-job count (`assigned`, `running`, `paused`), then atomically claims with `FOR UPDATE SKIP LOCKED`. `auto` currently resolves to local; `cloud` remains valid domain data but is unschedulable until the cloud adapter phase. Agent updates require the opaque assignment lease and machine ownership.

## Product direction (future, not implemented)

- Local GPU is first-class: local files and metadata are unlimited and are not mapped to per-render credits. Cloud is optional and provider-independent.
- Architectural control is the promise: preserve geometry, camera, materials/colors and locked design elements; render what was designed without the AI changing the design.
- Multi-view consistency must keep multiple SketchUp cameras looking like the same building.
- Selective/masked revision will target only a selected region (for example, darken brick without touching wood).
- Render DNA will include camera, prompts, seed, model/version/hash, workflow/version, sampler, steps, denoise, references/ControlNet/LoRA, resolution, quality, compute, machine/GPU, user, timestamp and parent revision. Future actions are re-run and variation from DNA.
- A private machine pool may include RTX 3080/4090/5090 workstations. Professional queue features include batch, overnight, multi-camera, ETA and pause/resume/cancel.
- Live Preview order: fast local preview, meaningful prompt updates, 0.7-1.5s debounce, stale-preview cancellation, progressive images, accept -> capture/lock DNA -> final, camera debounce, masked revision, A/B history, then research continuous viewport reuse. V1 is a fresh lightweight local render per meaningful change, not a game-engine loop.
- The future Visualizer desktop window owns preview, progress, prompt, camera, quality, references, variations, A/B and Render DNA. SketchUp remains a thin Ruby/HtmlDialog integration.
- Commercial hypothesis is documentation only: approximately $19.99 one-time local license (possible $9.99 early access); local unlimited/zero credits, cloud ARZ Credits, and future Studio/Team subscription for shared pools, queues, presets, batch and support. No paywall or billing exists now.
- Future cloud jobs require atomic credit reservation, server-side pricing, limits, reconciliation, kill switch, circuit breaker and bounded retries. ARZ Credits are not provider balances; provider secrets remain server-only.
