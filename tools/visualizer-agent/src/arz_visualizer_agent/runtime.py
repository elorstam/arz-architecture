import json
import socket
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from .comfyui import ComfyUIClient, ComfyOutput, ComfyUIError
from .config import AgentConfig, authorization_header, heartbeat_payload, job_update_payload
from .gpu import detect_gpu
from .storage import render_directory, write_sidecar
from .workflow import bind_workflow, load_workflow, WorkflowError

class AgentHTTPError(RuntimeError): pass

class AgentRuntime:
    def __init__(self, config: AgentConfig, workflow_root: Path):
        self.config=config; self.workflow_root=workflow_root; self.comfy=ComfyUIClient(config.comfyui_url)
    def _api(self, method: str, path: str, payload=None):
        if not self.config.api_url: raise AgentHTTPError("API_NOT_CONFIGURED")
        body=json.dumps(payload).encode() if payload is not None else None
        request=urllib.request.Request(self.config.api_url.rstrip("/")+path,data=body,headers={**authorization_header(self.config.agent_token),"Content-Type":"application/json"},method=method)
        try:
            with urllib.request.urlopen(request,timeout=15) as response:
                if response.status==204:return None
                return json.loads(response.read().decode())
        except urllib.error.HTTPError as exc:
            if exc.code in {401,409}: raise AgentHTTPError("LEASE_REJECTED")
            raise AgentHTTPError("AGENT_API_UNAVAILABLE") from exc
        except Exception as exc: raise AgentHTTPError("AGENT_API_UNAVAILABLE") from exc
    def heartbeat(self):
        name,vram=detect_gpu(self.comfy)
        return self._api("POST","/api/visualizer/agent/heartbeat",heartbeat_payload(agent_version=self.config.agent_version,hostname=socket.gethostname(),os_name=__import__("platform").system(),gpu_name=name or None,gpu_vram_mb=vram or None,current_job_count=0))
    def claim(self): return self._api("POST","/api/visualizer/agent/jobs/claim",{})
    def update(self,job_id: str, payload: dict): return self._api("POST",f"/api/visualizer/agent/jobs/{job_id}/update",payload)
    def run_once(self):
        claimed=self.claim(); item=(claimed or {}).get("job") if claimed else None
        if not item:return False
        job=item; lease=(claimed or {}).get("leaseId")
        if not lease or job.get("requestedComputeMode")=="cloud": return False
        try:
            request=job.get("requestSnapshot") or {}; settings=request.get("settings") or {}
            workflow_id=str(settings.get("workflowId") or "smoke_txt2img_v1")
            manifest,template=load_workflow(self.workflow_root,workflow_id)
            checkpoint=str(settings.get("checkpoint") or self.config.smoke_checkpoint or manifest.get("checkpoint") or "")
            if not checkpoint: raise WorkflowError("MODEL_MISSING")
            seed=int(settings.get("seed") or 1); width=int(settings.get("width") or 512); height=int(settings.get("height") or 512)
            workflow=bind_workflow(manifest,template,prompt=str(request.get("prompt") or ""),negative_prompt=str(request.get("negativePrompt") or ""),seed=seed,width=width,height=height,checkpoint=checkpoint)
            prompt_id=self.comfy.submit(workflow); started=datetime.now(timezone.utc)
            self.update(str(job["id"]),job_update_payload(lease_id=lease,status="running",progress_percent=1))
            output=None
            while True:
                time.sleep(max(0.5,self.config.poll_interval_seconds)); history=self.comfy.history(prompt_id).get(prompt_id,{})
                status=history.get("status") or {}; messages=status.get("messages") or []
                desired=self._api("GET",f"/api/visualizer/agent/jobs/{job['id']}/update") if False else None
                if status.get("status_str") in {"error","failed"}: raise ComfyUIError("COMFYUI_EXECUTION_FAILED")
                outputs=history.get("outputs") or {}
                for node in outputs.values():
                    for image in node.get("images",[]): output=ComfyOutput(str(image.get("filename","")),str(image.get("subfolder","")),str(image.get("type","output")))
                if output:break
                control=self.update(str(job["id"]),job_update_payload(lease_id=lease,progress_percent=50,eta_seconds=None))
                if (control or {}).get("desiredState")=="cancelled":
                    try:self.comfy.interrupt()
                    except ComfyUIError: pass
                    self.update(str(job["id"]),job_update_payload(lease_id=lease,status="cancelled",progress_percent=0)); return False
            data=self.comfy.download_output(output)
            scene=str(request.get("sceneId") or "default-scene"); project=str(request.get("projectId") or "project")
            directory=render_directory(self.config.output_root,project,scene,str(job.get("quality","draft")))
            directory.mkdir(parents=True,exist_ok=True); filename=f"render-{job['id']}.png"; (directory/filename).write_bytes(data)
            completed=datetime.now(timezone.utc); write_sidecar(directory,{"schemaVersion":1,"jobId":job["id"],"project":project,"scene":scene,"quality":job.get("quality"),"compute":"local","prompt":request.get("prompt"),"negativePrompt":request.get("negativePrompt"),"seed":seed,"width":width,"height":height,"workflowId":manifest.get("id"),"workflowVersion":manifest.get("version"),"checkpoint":checkpoint,"comfyPromptId":prompt_id,"startedAt":started.isoformat(),"completedAt":completed.isoformat(),"duration":(completed-started).total_seconds(),"output":filename})
            self.update(str(job["id"]),job_update_payload(lease_id=lease,status="completed",progress_percent=100,eta_seconds=0)); return True
        except AgentHTTPError: return False
        except WorkflowError as exc: self._safe_fail(job,lease,str(exc)); return False
        except ComfyUIError as exc: self._safe_fail(job,lease,str(exc)); return False
        except OSError: self._safe_fail(job,lease,"OUTPUT_WRITE_FAILED"); return False
    def _safe_fail(self,job,lease,code):
        try:self.update(str(job["id"]),job_update_payload(lease_id=lease,status="failed",error_code=code,error_message=code))
        except AgentHTTPError: pass
    def run_forever(self):
        while True:
            self.heartbeat(); self.run_once(); time.sleep(max(1,self.config.poll_interval_seconds))
