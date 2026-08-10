from dataclasses import dataclass
import os
from pathlib import Path

@dataclass(frozen=True)
class AgentConfig:
    storage_root: Path = Path.home() / "Documents" / "ARZ Visualizer"
    agent_version: str = "0.1.0"
    api_url: str = os.environ.get("ARZ_VISUALIZER_API_URL", "")
    agent_token: str = os.environ.get("ARZ_VISUALIZER_AGENT_TOKEN", "")


def heartbeat_payload(*, agent_version: str, hostname: str, os_name: str,
                      gpu_name: str | None = None, gpu_vram_mb: int | None = None,
                      current_job_count: int = 0) -> dict[str, object]:
    return {"agentVersion": agent_version, "hostname": hostname, "os": os_name,
            "gpuName": gpu_name, "gpuVramMb": gpu_vram_mb,
            "currentJobCount": current_job_count}


def authorization_header(token: str) -> dict[str, str]:
    """Build the header without logging or persisting the secret."""
    return {"Authorization": f"Bearer {token}"} if token else {}


def job_update_payload(*, lease_id: str, status: str | None = None,
                       progress_percent: int | None = None,
                       eta_seconds: int | None = None,
                       error_code: str | None = None,
                       error_message: str | None = None) -> dict[str, object]:
    payload: dict[str, object] = {"leaseId": lease_id}
    if status is not None:
        payload["status"] = status
    if progress_percent is not None:
        payload["progressPercent"] = progress_percent
    if eta_seconds is not None:
        payload["etaSeconds"] = eta_seconds
    if error_code is not None:
        payload["errorCode"] = error_code
    if error_message is not None:
        payload["errorMessage"] = error_message
    return payload
