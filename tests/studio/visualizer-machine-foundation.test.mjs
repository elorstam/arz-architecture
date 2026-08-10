import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");
const migration = read("supabase/migrations/057_visualizer_machine_registry.sql");
const service = read("lib/visualizer/server.ts");
const route = read("app/api/visualizer/agent/heartbeat/route.ts");

test("machine registry is forward-only and credential storage is hash-only", () => {
  assert.match(migration, /create table if not exists public\.visualizer_machines/);
  assert.match(migration, /create table if not exists public\.visualizer_machine_credentials/);
  assert.match(migration, /secret_hash text not null unique/);
  assert.doesNotMatch(migration, /raw_secret|agent_secret|secret text/i);
  assert.match(migration, /status in\('online','busy','offline','disabled'\)/);
  assert.match(migration, /revoke all on public\.visualizer_machine_credentials from anon, authenticated/);
});

test("agent credentials use strong random secrets, SHA-256 and timing-safe comparison", () => {
  assert.match(service, /randomBytes\(32\)/);
  assert.match(service, /createHash\("sha256"\)/);
  assert.match(service, /timingSafeEqual/);
  assert.match(service, /arzv_/);
  assert.match(service, /agentSecret:raw/);
  assert.match(service, /credentialId/);
  assert.doesNotMatch(service, /metadata:\{[^}]*raw|metadata:\{[^}]*secret/i);
});

test("heartbeat is a narrow bearer endpoint with centralized health policy", () => {
  assert.match(route, /POST/);
  assert.match(route, /Bearer/);
  assert.match(route, /Cache-Control/);
  assert.match(service, /VISUALIZER_HEARTBEAT_INTERVAL_SECONDS=30/);
  assert.match(service, /VISUALIZER_OFFLINE_THRESHOLD_SECONDS=90/);
  assert.match(service, /currentJobCount>0\?"busy":"online"/);
  assert.match(service, /\.eq\("id",auth\.machine\.id\)/);
  assert.match(service, /status==="disabled"/);
});

test("machine identity is server-derived and no render queue is introduced", () => {
  assert.match(service, /context\.membership\.organization_id/);
  assert.match(service, /credential\.machine_id/);
  assert.doesNotMatch(migration, /render_jobs|scheduler|comfyui|runpod|vast\.ai/i);
});

test("render queue uses one canonical job table and guarded agent routes", () => {
  const migration058 = read("supabase/migrations/058_visualizer_render_queue.sql");
  const serverSource = read("lib/visualizer/server.ts");
  const claim = read("app/api/visualizer/agent/jobs/claim/route.ts");
  const update = read("app/api/visualizer/agent/jobs/[jobId]/update/route.ts");
  assert.match(migration058, /visualizer_render_jobs/);
  assert.match(migration058, /visualizer_render_job_events/);
  assert.match(migration058, /for update of j skip locked/);
  assert.match(migration058, /requested_compute_mode <> 'cloud'/);
  assert.match(serverSource, /VISUALIZER_ASSIGNMENT_LEASE_SECONDS=120/);
  assert.match(serverSource, /canTransition/);
  assert.match(claim, /Bearer/);
  assert.match(update, /updateAgentJob/);
  assert.doesNotMatch(migration058 + serverSource, /ARZ Credits|runpod|comfyui|render image/i);
});

test("queue contract keeps desired state separate from actual lifecycle", () => {
  const types = read("lib/visualizer/types.ts");
  const serverSource = read("lib/visualizer/server.ts");
  assert.match(types, /VisualizerJobDesiredState/);
  assert.match(types, /VisualizerRenderJob/);
  assert.match(serverSource, /desired_state/);
  assert.match(serverSource, /queued.*assigned.*cancelled/);
  assert.match(serverSource, /job_terminal/);
});
