# ARZ Visualizer Agent

Local Python foundation for a future ARZ Visualizer machine agent. The agent will eventually register a workstation, report health, receive jobs and control ComfyUI. Phase 10A.1 adds only the bounded heartbeat contract; it contains no scheduler, GPU detection or rendering pipeline.

Configuration is supplied by environment variables:

```text
ARZ_VISUALIZER_API_URL=https://your-internal-api.example
ARZ_VISUALIZER_AGENT_TOKEN=arzv_...
```

The token is sent only as an `Authorization: Bearer ...` header and must never be logged, committed or included in diagnostics. The server stores only its SHA-256 hash. A future installer should use Windows Credential Manager (or equivalent OS secure storage); this foundation does not implement secure storage or a heartbeat daemon.

Run the stdlib tests from the repository root:

```text
python -m unittest discover -s tools/visualizer-agent/tests
```
