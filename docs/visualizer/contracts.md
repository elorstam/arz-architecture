# ARZ Visualizer Contracts

TypeScript source of truth: `lib/visualizer/types.ts` and `lib/visualizer/constants.ts`. The Python Agent foundation mirrors only execution-neutral enum values.

## Enums

- Quality: `draft | standard | ultra_final`
- Compute: `auto | local | cloud`
- Job: `queued | assigned | running | paused | completed | failed | cancelled`
- Machine: `online | busy | offline | disabled`
- Mode: `interior | exterior`
- Time: `day | golden_hour | night`
- Weather: `clear | cloudy | rain`

## Core objects

`VisualizerRenderRequest` binds organization/project, optional scene/camera, quality, compute, mode, time, weather, prompts, references and render settings. `VisualizerMachine` describes an agent host and bounded concurrency. `VisualizerCamera` uses explicit `{x,y,z}` position and target vectors. `VisualizerReference` supports image, material, lighting, composition and camera sources.

`VisualizerRenderDNA` is the persistent provenance record for a render. Workflow-specific settings remain extensible rather than forcing every ComfyUI field into the first contract.

## Future API directions

Future endpoints may register machines, issue agent credentials, enqueue requests, report heartbeat/progress, cancel jobs and publish signed result metadata. None are implemented in this foundation phase.
# ARZ Visualizer Contracts

The TypeScript types in `lib/visualizer/types.ts` are the source of truth for render quality, compute mode, camera, references, Render DNA and machine status.

## Machine registry

`visualizer_machines` is scoped to the existing organization/workspace. It stores machine metadata, bounded concurrent-job counters and heartbeat timestamps. Status values are `online`, `busy`, `offline` and `disabled`; a disabled machine cannot be revived by an agent heartbeat. `effectiveMachineStatus` applies the centralized 90-second stale-heartbeat threshold.

`visualizer_machine_credentials` stores only a SHA-256 hex digest. A registration or rotation response returns the `arzv_` secret once; it is never readable later, logged, placed in URLs, or included in event metadata. Revocation immediately invalidates the credential.

`POST /api/visualizer/agent/heartbeat` uses `Authorization: Bearer <agent-secret>` and accepts only agent version, host/OS, optional GPU descriptors and current job count. Workspace and machine identity come from the credential, never from the payload. The response is minimal (`ok`, `machineId`, effective status and server time).

Studio owner/admin registration is an internal authorization adapter, not a permanent commercial restriction. Future entitlement policy can be added around the machine service. Browser clients cannot read credentials or write machine telemetry. RLS permits authenticated workspace members to read machine/event projections while service-role code performs registration and agent mutations.

## Render queue

`VisualizerRenderJob` persists a `VisualizerRenderRequest` snapshot, priority, desired state, lifecycle state, assignment lease, progress and bounded retry counters. `requestedComputeMode: cloud` is stored but not assigned in 10A.2. `auto` and `local` resolve to local only after a fresh local machine claim. Agent updates must include the opaque lease and are checked against the credential's machine.

`POST /api/visualizer/agent/jobs/claim` returns `{job, leaseId, desiredState}` or `{job:null}`. `POST /api/visualizer/agent/jobs/:jobId/update` accepts lease, lifecycle status and bounded progress/ETA/error fields. No amount, billing, provider, image or secret data belongs in a job snapshot. Control actions modify `desiredState`; execution status changes only through legal transitions and agent acknowledgement.

## Future publish boundary

Generation on a local or cloud worker is distinct from publishing to Studio Render Archive. Publishing remains an explicit, audited, server-authorized Studio action. Queue, scheduler, render execution, cloud providers and SketchUp integration are later phases.
