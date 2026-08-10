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
