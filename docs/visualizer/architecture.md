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
