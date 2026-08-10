from dataclasses import dataclass
from pathlib import Path

@dataclass(frozen=True)
class AgentConfig:
    storage_root: Path = Path.home() / "Documents" / "ARZ Visualizer"
    agent_version: str = "0.1.0"
