import json
from pathlib import Path
from typing import Any

class WorkflowError(RuntimeError): pass

def load_workflow(root: Path, workflow_id: str) -> tuple[dict, dict]:
    if not workflow_id or "/" in workflow_id or "\\" in workflow_id or ".." in workflow_id: raise WorkflowError("WORKFLOW_INVALID")
    directory=(root/workflow_id).resolve(); base=root.resolve()
    if base not in directory.parents: raise WorkflowError("WORKFLOW_INVALID")
    try:
        manifest=json.loads((directory/"manifest.json").read_text(encoding="utf-8"))
        workflow=json.loads((directory/"workflow.api.json").read_text(encoding="utf-8"))
    except Exception as exc: raise WorkflowError("WORKFLOW_INVALID") from exc
    if manifest.get("id") != workflow_id or not isinstance(workflow,dict): raise WorkflowError("WORKFLOW_INVALID")
    return manifest, workflow

def bind_workflow(manifest: dict, workflow: dict, *, prompt: str, negative_prompt: str,
                  seed: int, width: int, height: int, checkpoint: str) -> dict:
    result=json.loads(json.dumps(workflow)); bindings=manifest.get("bindings",{})
    def set_input(binding: str, value: Any):
        ref=bindings.get(binding); 
        if not ref: return
        node=result.get(str(ref.get("node"))); field=ref.get("field")
        if not node or not field: raise WorkflowError("WORKFLOW_INVALID")
        node.setdefault("inputs",{})[field]=value
    set_input("prompt",prompt); set_input("negativePrompt",negative_prompt); set_input("seed",seed); set_input("width",width); set_input("height",height); set_input("checkpoint",checkpoint)
    return result
