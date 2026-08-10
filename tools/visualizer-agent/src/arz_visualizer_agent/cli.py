import argparse
from pathlib import Path
from .config import AgentConfig
from .comfyui import ComfyUIClient
from .gpu import detect_gpu
from .workflow import load_workflow
from .runtime import AgentRuntime

def doctor(config: AgentConfig) -> int:
    print("ARZ Visualizer Doctor\n")
    print("Backend:", "PASS" if config.api_url else "NOT CONFIGURED")
    print("Agent credential:", "CONFIGURED" if config.agent_token else "NOT CONFIGURED")
    client=ComfyUIClient(config.comfyui_url)
    try:
        stats=client.system_stats(); name,vram=detect_gpu(client); print("ComfyUI: PASS", config.comfyui_url); print("GPU:",name or "NOT DETECTED"); print("VRAM:",f"{vram} MB" if vram else "NOT DETECTED")
    except Exception:
        print("ComfyUI: NOT READY", config.comfyui_url); print("GPU: NOT DETECTED"); print("VRAM: NOT DETECTED"); return 1
    try:
        manifest,_=load_workflow(Path(__file__).resolve().parents[2]/"workflows","smoke_txt2img_v1"); print("Workflow:",manifest["id"],"READY" if config.smoke_checkpoint or manifest.get("checkpoint") else "MODEL_MISSING")
    except Exception: print("Workflow: INVALID"); return 1
    try: config.output_root.mkdir(parents=True,exist_ok=True); writable=config.output_root.is_dir()
    except OSError: writable=False
    print("Output:",config.output_root,"WRITABLE" if writable else "NOT WRITABLE")
    return 0 if writable else 1

def main() -> int:
    parser = argparse.ArgumentParser(description="ARZ Visualizer Agent")
    parser.add_argument("--version", action="version", version="0.1.0")
    sub=parser.add_subparsers(dest="command")
    sub.add_parser("doctor")
    sub.add_parser("run")
    args=parser.parse_args(); config=AgentConfig()
    if args.command=="doctor": return doctor(config)
    if args.command=="run": return AgentRuntime(config,Path(__file__).resolve().parents[2]/"workflows").run_forever() or 0
    parser.print_help(); return 0

if __name__ == "__main__":
    raise SystemExit(main())
