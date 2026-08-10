import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from arz_visualizer_agent.domain import ComputeMode, JobStatus, RenderQuality
from arz_visualizer_agent.config import authorization_header, heartbeat_payload, job_update_payload
from arz_visualizer_agent.storage import render_directory, safe_segment, write_sidecar

class FoundationTests(unittest.TestCase):
    def test_contract_values(self):
        self.assertEqual(RenderQuality.ULTRA_FINAL.value, "ultra_final")
        self.assertEqual(ComputeMode.LOCAL.value, "local")
        self.assertEqual(JobStatus.QUEUED.value, "queued")

    def test_safe_storage_blocks_traversal(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            path = render_directory(root, "..\\escape/scene", "..", "ultra_final")
            self.assertIn(root, path.parents)
            self.assertNotIn("..", safe_segment("../escape"))
            sidecar = write_sidecar(path, {"quality": "ultra_final"})
            self.assertEqual(json.loads(sidecar.read_text(encoding="utf-8"))["quality"], "ultra_final")

    def test_heartbeat_contract_does_not_add_browser_fields(self):
        payload = heartbeat_payload(agent_version="0.1.0", hostname="workstation", os_name="windows")
        self.assertEqual(payload["currentJobCount"], 0)
        self.assertNotIn("machineId", payload)
        self.assertEqual(authorization_header("arzv_secret")["Authorization"], "Bearer arzv_secret")
        self.assertEqual(authorization_header(""), {})
        self.assertEqual(job_update_payload(lease_id="lease", progress_percent=25), {"leaseId":"lease", "progressPercent":25})

if __name__ == "__main__":
    unittest.main()
