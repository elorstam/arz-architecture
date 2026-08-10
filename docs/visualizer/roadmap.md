# ARZ Visualizer Roadmap

## PHASE 10A.0 - Foundation Bootstrap

Domain contracts, Python Agent skeleton, safe local storage contract and architecture boundaries.

## PHASE 10A.1 - Backend Foundation (current)

Machine Registry, one-time hashed agent credentials, owner/admin registration adapter, credential rotation/revocation, disable semantics, narrow heartbeat endpoint and effective online/offline health policy. No queue or rendering execution.

## PHASE 10A.2 - Render Queue

Scheduler, priority, machine assignment, pause/resume/cancel and progress/ETA. This phase is now the active implementation: queue persistence, atomic pull-claim leases, lifecycle state machine and bounded job updates are present; no rendering execution exists.

## PHASE 10A.3 - Local Agent

GPU detection, ComfyUI integration, Workflow Library and local rendering.

## PHASE 10A.4 - Studio Render Setup

Project/Scene/Camera Registry, Prompt Presets, Reference Manager and Render DNA.

## PHASE 10A.5 - Cloud GPU

Ultra Final, automatic local/cloud routing and 15-day Cloud Cache.

## PHASE 10A.6 - Notifications

Visualizer Admin Dashboard, machine health and queue monitoring.

## PHASE 10A.7 - Windows Installer

`ARZ Visualizer Setup.exe` with Agent, ComfyUI, Python/CUDA/PyTorch dependencies, models, Workflow Library, startup registration and GPU compatibility checks.

## PHASE 10B - SketchUp Plugin

Ruby + HtmlDialog, scene/camera integration and one-click Render with ARZ Visualizer. The plugin never calls ComfyUI directly.
