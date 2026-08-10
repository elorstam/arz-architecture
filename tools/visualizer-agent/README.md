# ARZ Visualizer Agent

Local Python foundation for a future ARZ Visualizer machine agent. The agent will eventually register a workstation, report health, receive jobs and control ComfyUI. Phase 10A.0 intentionally contains no network service, authentication, scheduler, GPU detection or rendering pipeline.

Run the stdlib tests from the repository root:

```text
python -m unittest discover -s tools/visualizer-agent/tests
```
