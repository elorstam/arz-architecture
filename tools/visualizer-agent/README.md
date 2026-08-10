# ARZ Visualizer Agent

Local Python foundation for a future ARZ Visualizer machine agent. The agent will eventually register a workstation, report health, receive jobs and control ComfyUI. Phase 10A.1 adds only the bounded heartbeat contract; it contains no scheduler, GPU detection or rendering pipeline.

Configuration is supplied by environment variables:

```text
ARZ_VISUALIZER_API_URL=https://your-internal-api.example
ARZ_VISUALIZER_AGENT_TOKEN=arzv_...
```

The token is sent only as an `Authorization: Bearer ...` header and must never be logged, committed or included in diagnostics. The server stores only its SHA-256 hash. A future installer should use Windows Credential Manager (or equivalent OS secure storage); this foundation does not implement secure storage or a heartbeat daemon.

## Phase 10A.3 runtime

`ARZ_VISUALIZER_COMFYUI_URL` defaults to `http://127.0.0.1:8188` and is loopback-only. `ARZ_VISUALIZER_POLL_INTERVAL_SECONDS` controls bounded history polling, `ARZ_VISUALIZER_OUTPUT_ROOT` controls the canonical local output root, and `ARZ_VISUALIZER_SMOKE_CHECKPOINT` names a manually installed approved checkpoint. The agent never downloads models, accepts an arbitrary workflow path, exposes ComfyUI publicly, or uploads local output to Studio.

Commands:

```text
arz-visualizer-agent doctor
arz-visualizer-agent run
```

The `smoke_txt2img_v1` workflow is a development smoke test using core nodes. It requires a compatible checkpoint and is not an architectural production workflow. The temporary owner/admin-only Studio dev console is disabled unless `VISUALIZER_DEV_CONSOLE_ENABLED=true`.

Run the stdlib tests from the repository root:

```text
python -m unittest discover -s tools/visualizer-agent/tests
```
