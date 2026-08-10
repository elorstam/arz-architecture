# First Local Render Test (Windows / NVIDIA workstation)

This is a manual smoke test. A real RTX 3080 render is **NOT VERIFIED** until every checkbox below is observed on the workstation. Never commit the agent credential.

1. Confirm the repository and commit. Keep the working tree changes reviewed.
2. Apply pending migrations `057_visualizer_machine_registry.sql` and `058_visualizer_render_queue.sql` through the established Supabase workflow. Do not push them automatically from this task.
3. Install and start a supported local ComfyUI development runtime manually. Keep it bound to loopback (`127.0.0.1:8188`), never a public interface.
4. Install one compatible smoke-test checkpoint manually. No automatic download is performed and model licensing must be reviewed.
5. Check `GET http://127.0.0.1:8188/system_stats` and verify ComfyUI is healthy.
6. As an internal Studio owner/admin, register a machine using the existing registration flow and capture the one-time agent credential. Do not paste it into this document, source control or logs.
7. Configure the agent environment securely: `ARZ_VISUALIZER_API_URL`, `ARZ_VISUALIZER_AGENT_TOKEN`, `ARZ_VISUALIZER_COMFYUI_URL`, `ARZ_VISUALIZER_SMOKE_CHECKPOINT` and optional `ARZ_VISUALIZER_OUTPUT_ROOT`.
8. Run `arz-visualizer-agent doctor`. Expected: backend configured, ComfyUI PASS, actual GPU name/VRAM, smoke workflow ready and writable output directory.
9. Start `arz-visualizer-agent run`; verify the machine heartbeat becomes online.
10. Open `/studio/visualizer/dev` with `VISUALIZER_DEV_CONSOLE_ENABLED=true` and create one Draft / Local smoke job.
11. Verify `queued -> assigned -> running -> completed`, a valid assignment lease and no cloud execution.
12. Verify actual NVIDIA workload with local Windows/NVIDIA tooling, then confirm a PNG and `render.json` under `Documents/ARZ Visualizer/{Project}/{Scene}/{Draft|Standard|Ultra}`. Open the PNG manually.
13. Create a second job and test Cancel. The agent must call ComfyUI interrupt where appropriate and acknowledge cancellation.
14. Stop ComfyUI and create another job. Verify a safe `COMFYUI_UNAVAILABLE`/failure state without fabricated output.

## Acceptance checklist

- [ ] 057 remote applied
- [ ] 058 remote applied
- [ ] Agent machine registered
- [ ] One-time agent secret works
- [ ] Heartbeat online
- [ ] ComfyUI reachable
- [ ] Actual GPU name detected
- [ ] Actual VRAM detected
- [ ] Workflow loaded
- [ ] Model loaded
- [ ] Job queued / claimed / running
- [ ] Assignment lease valid
- [ ] GPU workload observed
- [ ] Real PNG created and opened
- [ ] `render.json` created
- [ ] Job completed
- [ ] Canonical local storage correct
- [ ] Cancel stops execution
- [ ] No Supabase render upload
- [ ] No ARZ Studio publish
- [ ] No cloud usage
- [ ] No secret leakage
