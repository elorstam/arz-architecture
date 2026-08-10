import subprocess
from .comfyui import parse_system_stats

def detect_gpu(client=None) -> tuple[str,int]:
    if client:
        try:
            name,vram=parse_system_stats(client.system_stats())
            if name: return name,vram
        except Exception: pass
    try:
        result=subprocess.run(["nvidia-smi","--query-gpu=name,memory.total","--format=csv,noheader,nounits"],capture_output=True,text=True,timeout=5,check=True)
        first=result.stdout.strip().splitlines()[0].split(",")
        return first[0].strip(),int(float(first[1].strip()))
    except Exception: return "",0
