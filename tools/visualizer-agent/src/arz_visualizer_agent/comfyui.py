"""Small loopback-only adapter for ComfyUI's local HTTP API."""
import json
from dataclasses import dataclass
from urllib.parse import urlencode
from urllib.request import Request, urlopen

class ComfyUIError(RuntimeError):
    pass

def _loopback(url: str) -> str:
    from urllib.parse import urlparse
    parsed=urlparse(url)
    if parsed.scheme not in {"http","https"} or parsed.hostname not in {"127.0.0.1","localhost","::1"}:
        raise ValueError("ComfyUI URL must use loopback host")
    return url.rstrip("/")

@dataclass(frozen=True)
class ComfyOutput:
    filename: str
    subfolder: str
    output_type: str

class ComfyUIClient:
    def __init__(self, base_url: str="http://127.0.0.1:8188", timeout: float=10):
        self.base_url=_loopback(base_url)
        self.timeout=timeout
    def _request(self, method: str, path: str, payload=None, timeout=None):
        body=None
        headers={"Accept":"application/json"}
        if payload is not None:
            body=json.dumps(payload).encode(); headers["Content-Type"]="application/json"
        try:
            with urlopen(Request(self.base_url+path, data=body, headers=headers, method=method), timeout=timeout or self.timeout) as response:
                raw=response.read()
                return json.loads(raw.decode()) if raw else {}
        except Exception as exc:
            raise ComfyUIError("COMFYUI_UNAVAILABLE") from exc
    def system_stats(self): return self._request("GET", "/system_stats")
    def object_info(self): return self._request("GET", "/object_info")
    def submit(self, workflow: dict):
        result=self._request("POST", "/prompt", {"prompt":workflow})
        if not result.get("prompt_id"): raise ComfyUIError("WORKFLOW_REJECTED")
        return str(result["prompt_id"])
    def history(self, prompt_id: str): return self._request("GET", "/history/"+prompt_id)
    def interrupt(self): return self._request("POST", "/interrupt", {})
    def output_url(self, output: ComfyOutput) -> str:
        return self.base_url+"/view?"+urlencode({"filename":output.filename,"subfolder":output.subfolder,"type":output.output_type})
    def download_output(self, output: ComfyOutput) -> bytes:
        try:
            with urlopen(self.output_url(output), timeout=self.timeout) as response: return response.read()
        except Exception as exc: raise ComfyUIError("OUTPUT_NOT_FOUND") from exc

def parse_system_stats(stats: dict) -> tuple[str, int]:
    devices=stats.get("devices") or []
    if not devices: return "", 0
    device=devices[0] or {}
    name=str(device.get("name") or device.get("type") or "")
    total=int(device.get("vram_total", device.get("vram_total_mb", 0)) or 0)
    return name, total // (1024*1024) if total > 100000 else total
