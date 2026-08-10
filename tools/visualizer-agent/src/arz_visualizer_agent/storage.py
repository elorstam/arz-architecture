import json
import re
from pathlib import Path
from typing import Any

_UNSAFE = re.compile(r"[^\w .-]+", re.UNICODE)

def safe_segment(value: str, fallback: str = "untitled") -> str:
    """Normalize one user/project segment without allowing path traversal."""
    cleaned = _UNSAFE.sub("_", str(value)).strip().strip(".")
    cleaned = re.sub(r"\s+", " ", cleaned)
    if cleaned in {"", ".", ".."}:
        return fallback
    return cleaned[:120]

def render_directory(root: Path, project: str, scene: str, quality: str) -> Path:
    quality_dir = {"draft": "Draft", "standard": "Standard", "ultra_final": "Ultra"}.get(quality)
    if quality_dir is None:
        raise ValueError("unsupported render quality")
    base = root.expanduser().resolve()
    target = (base / safe_segment(project) / safe_segment(scene) / quality_dir).resolve()
    if base != target and base not in target.parents:
        raise ValueError("render path escaped storage root")
    return target

def sidecar_path(render_dir: Path) -> Path:
    return render_dir / "render.json"

def write_sidecar(render_dir: Path, metadata: dict[str, Any]) -> Path:
    path = sidecar_path(render_dir)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding="utf-8")
    return path
