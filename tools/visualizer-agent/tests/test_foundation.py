import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from arz_visualizer_agent.domain import ComputeMode, JobStatus, RenderQuality
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

if __name__ == "__main__":
    unittest.main()
