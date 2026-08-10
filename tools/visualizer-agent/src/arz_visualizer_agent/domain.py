from dataclasses import dataclass
from enum import StrEnum

class RenderQuality(StrEnum):
    DRAFT = "draft"
    STANDARD = "standard"
    ULTRA_FINAL = "ultra_final"

class ComputeMode(StrEnum):
    AUTO = "auto"
    LOCAL = "local"
    CLOUD = "cloud"

class JobStatus(StrEnum):
    QUEUED = "queued"
    ASSIGNED = "assigned"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

@dataclass(frozen=True)
class MachineInfo:
    name: str
    hostname: str
    os: str
    agent_version: str
    gpu_name: str = ""
    gpu_vram_mb: int = 0
    max_concurrent_jobs: int = 1
