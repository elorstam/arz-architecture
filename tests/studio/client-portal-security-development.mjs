import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const env = Object.fromEntries(
  (await readFile(".env.local", "utf8"))
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^['"]|['"]$/g, "")];
    }),
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = env.SUPABASE_SERVICE_ROLE_KEY;
assert.equal(new URL(url).hostname, "yegtxoipfpleacgjfndb.supabase.co", "development ref mismatch");

const marker = `codex-client-security-${Date.now()}`;
const password = `Arz-${randomUUID()}-Aa1!`;
const ids = {
  orgA: randomUUID(), orgB: randomUUID(), projectA1: randomUUID(), projectA2: randomUUID(), projectB1: randomUUID(),
  stageA1: randomUUID(), fileVisible: randomUUID(), fileHidden: randomUUID(), fileArchived: randomUUID(), filePending: randomUUID(),
  versionVisible: randomUUID(), versionHidden: randomUUID(), versionArchived: randomUUID(),
};
const users = {};
const results = [];

async function request(path, { key = service, token = key, method = "GET", body, headers = {} } = {}) {
  const response = await fetch(`${url}${path}`, {
    method,
    headers: { apikey: key, Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(`${method} ${path}: ${response.status} ${JSON.stringify(data)}`);
  return data;
}

async function expectFailure(label, operation) {
  await assert.rejects(operation, undefined, label);
  results.push(`${label}: PASS`);
}

async function createUser(name) {
  const email = `${marker}-${name}@example.invalid`;
  const data = await request("/auth/v1/admin/users", { method: "POST", body: { email, password, email_confirm: true, user_metadata: { full_name: `Security ${name}` } } });
  users[name] = { id: data.id, email };
  return users[name];
}

async function cleanupStaleTestUsers() {
  const page = await request("/auth/v1/admin/users?per_page=1000");
  for (const user of page.users ?? []) {
    if (user.email?.startsWith("codex-client-security-")) {
      await request(`/auth/v1/admin/users/${user.id}`, { method: "DELETE" });
    }
  }
}

async function signIn(name) {
  const data = await request("/auth/v1/token?grant_type=password", { key: anon, token: anon, method: "POST", body: { email: users[name].email, password } });
  users[name].token = data.access_token;
}

async function insert(table, rows) {
  throw new Error(`insert(${table}) requires an authenticated owner token`);
}

async function insertAs(table, rows, token) {
  return request(`/rest/v1/${table}`, { key: anon, token, method: "POST", body: rows, headers: { Prefer: "return=representation" } });
}

function dbQuery(sql) {
  const directory = mkdtempSync(join(tmpdir(), "arz-client-security-"));
  const file = join(directory, "query.sql");
  try {
    writeFileSync(file, sql, "utf8");
    return execFileSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", `npx.cmd supabase db query --linked --file ${file}`], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

function cleanupDatabase() {
  const organizations = `'${ids.orgA}'::uuid,'${ids.orgB}'::uuid`;
  const sql = `begin;
set local session_replication_role = replica;
do $cleanup$
declare item record;
begin
  for item in select table_name from information_schema.columns where table_schema='public' and column_name='organization_id'
  loop
    execute format('delete from public.%I where organization_id = any($1)', item.table_name) using array[${organizations}];
  end loop;
end $cleanup$;
delete from public.organizations where id in (${organizations});
commit;`;
  dbQuery(sql);
}

async function rpc(name, token, body = {}) {
  return request(`/rest/v1/rpc/${name}`, { key: anon, token, method: "POST", body });
}

async function rows(table, token, query = "select=*") {
  return request(`/rest/v1/${table}?${query}`, { key: anon, token });
}

try {
  await cleanupStaleTestUsers();
  for (const name of ["ownerA", "memberA", "clientA", "clientB", "ownerB"]) await createUser(name);
  for (const name of Object.keys(users)) await signIn(name);
  dbQuery(`begin;
insert into public.profiles(id,email,full_name) values
('${users.ownerA.id}','${users.ownerA.email}','Security Owner A'),
('${users.memberA.id}','${users.memberA.email}','Security Member A'),
('${users.clientA.id}','${users.clientA.email}','Security Client A'),
('${users.clientB.id}','${users.clientB.email}','Security Client B'),
('${users.ownerB.id}','${users.ownerB.email}','Security Owner B');
insert into public.organizations(id,name,slug,created_by) values
('${ids.orgA}','${marker} Organization A','${marker}-a','${users.ownerA.id}'),
('${ids.orgB}','${marker} Organization B','${marker}-b','${users.ownerB.id}');
insert into public.organization_members(organization_id,user_id,role,created_by) values
('${ids.orgA}','${users.ownerA.id}','owner','${users.ownerA.id}'),
('${ids.orgA}','${users.memberA.id}','team_member','${users.ownerA.id}'),
('${ids.orgA}','${users.clientA.id}','client','${users.ownerA.id}'),
('${ids.orgA}','${users.clientB.id}','client','${users.ownerA.id}'),
('${ids.orgB}','${users.ownerB.id}','owner','${users.ownerB.id}');
select set_config('request.jwt.claim.sub','${users.ownerA.id}',true);
insert into public.studio_projects(id,organization_id,code,name,stage,status,created_by,updated_by) values
('${ids.projectA1}','${ids.orgA}','${marker}-A1','Security Project A1','Tasarım','Aktif','${users.ownerA.id}','${users.ownerA.id}'),
('${ids.projectA2}','${ids.orgA}','${marker}-A2','Security Project A2','Tasarım','Aktif','${users.ownerA.id}','${users.ownerA.id}');
select set_config('request.jwt.claim.sub','${users.ownerB.id}',true);
insert into public.studio_projects(id,organization_id,code,name,stage,status,created_by,updated_by) values
('${ids.projectB1}','${ids.orgB}','${marker}-B1','Security Project B1','Tasarım','Aktif','${users.ownerB.id}','${users.ownerB.id}');
commit;`);

  const ownerIdentity = await request("/auth/v1/user", { key: anon, token: users.ownerA.token });
  assert.equal(ownerIdentity.id, users.ownerA.id, "owner JWT subject mismatch");
  const membershipDiagnostic = dbQuery(`select organization_id,user_id,role,status from public.organization_members where organization_id='${ids.orgA}' and user_id='${users.ownerA.id}';`);
  assert.match(membershipDiagnostic, /"role": "owner"/, "owner membership fixture missing");
  const ownerRole = await rpc("studio_has_organization_role", users.ownerA.token, { target_organization_id: ids.orgA, allowed_roles: ["owner"] });
  assert.equal(ownerRole, true, "owner JWT cannot resolve canonical organization role");

  await rpc("studio_grant_client_project_access", users.ownerA.token, { p_project_id: ids.projectA1, p_user_id: users.clientA.id });
  const invitation = await rpc("studio_create_client_invitation", users.ownerA.token, { p_project_id: ids.projectA2, p_invited_email: users.clientB.email, p_expires_at: new Date(Date.now() + 86400000).toISOString() });
  assert.equal(invitation.length, 1);
  const accessB1 = await rpc("studio_accept_client_invitation", users.clientB.token, { p_token: invitation[0].invitation_token });
  const accessB2 = await rpc("studio_accept_client_invitation", users.clientB.token, { p_token: invitation[0].invitation_token });
  assert.equal(accessB1, accessB2, "invitation acceptance must be idempotent");
  results.push("invitation hash-only storage and idempotent acceptance: PASS");

  const ownerProjects = await rows("studio_projects", users.ownerA.token, "select=id&order=code");
  const memberProjects = await rows("studio_projects", users.memberA.token, "select=id&order=code");
  const clientAProjects = await rows("studio_projects", users.clientA.token, "select=id&order=code");
  const clientBProjects = await rows("studio_projects", users.clientB.token, "select=id&order=code");
  assert.deepEqual(ownerProjects.map((x) => x.id).sort(), [ids.projectA1, ids.projectA2].sort());
  assert.deepEqual(memberProjects.map((x) => x.id).sort(), [ids.projectA1, ids.projectA2].sort());
  assert.deepEqual(clientAProjects.map((x) => x.id), [ids.projectA1]);
  assert.deepEqual(clientBProjects.map((x) => x.id), [ids.projectA2]);
  results.push("authenticated project RLS matrix and cross-org isolation: PASS");

  dbQuery(`begin;
select set_config('request.jwt.claim.sub','${users.ownerA.id}',true);
insert into public.studio_project_stages(id,organization_id,project_id,title,description,note,sort_order,is_client_visible,created_by,updated_by) values('${ids.stageA1}','${ids.orgA}','${ids.projectA1}','Client visible stage','Public stage description','INTERNAL_STAGE_NOTE',9001,true,'${users.ownerA.id}','${users.ownerA.id}');
insert into public.studio_project_files(id,organization_id,project_id,display_name,original_file_name,normalized_file_name,extension,mime_type,file_size,storage_path,category,status,is_archived,uploaded_by,updated_by) values
('${ids.fileVisible}','${ids.orgA}','${ids.projectA1}','Visible','Visible.pdf','visible.pdf','pdf','application/pdf',12,'organizations/${ids.orgA}/projects/${ids.projectA1}/files/${ids.fileVisible}/Visible.pdf','render','uploading',false,'${users.ownerA.id}','${users.ownerA.id}'),
('${ids.fileHidden}','${ids.orgA}','${ids.projectA1}','Hidden','Hidden.pdf','hidden.pdf','pdf','application/pdf',12,'organizations/${ids.orgA}/projects/${ids.projectA1}/files/${ids.fileHidden}/Hidden.pdf','render','uploading',false,'${users.ownerA.id}','${users.ownerA.id}'),
('${ids.fileArchived}','${ids.orgA}','${ids.projectA1}','Archived','Archived.pdf','archived.pdf','pdf','application/pdf',12,'organizations/${ids.orgA}/projects/${ids.projectA1}/files/${ids.fileArchived}/Archived.pdf','document','uploading',true,'${users.ownerA.id}','${users.ownerA.id}'),
('${ids.filePending}','${ids.orgA}','${ids.projectA1}','Pending','Pending.pdf','pending.pdf','pdf','application/pdf',12,'organizations/${ids.orgA}/projects/${ids.projectA1}/files/${ids.filePending}/Pending.pdf','document','uploading',false,'${users.ownerA.id}','${users.ownerA.id}');
insert into public.studio_project_file_versions(id,organization_id,project_id,file_id,version_number,is_current,status,storage_provider,storage_bucket,storage_path,original_file_name,normalized_file_name,extension,mime_type,file_size,uploaded_by) values
('${ids.versionVisible}','${ids.orgA}','${ids.projectA1}','${ids.fileVisible}',1,true,'ready','supabase','studio-files','organizations/${ids.orgA}/projects/${ids.projectA1}/files/${ids.fileVisible}/Visible.pdf','Visible.pdf','visible.pdf','pdf','application/pdf',12,'${users.ownerA.id}'),
('${ids.versionHidden}','${ids.orgA}','${ids.projectA1}','${ids.fileHidden}',1,true,'ready','supabase','studio-files','organizations/${ids.orgA}/projects/${ids.projectA1}/files/${ids.fileHidden}/Hidden.pdf','Hidden.pdf','hidden.pdf','pdf','application/pdf',12,'${users.ownerA.id}'),
('${ids.versionArchived}','${ids.orgA}','${ids.projectA1}','${ids.fileArchived}',1,true,'ready','supabase','studio-files','organizations/${ids.orgA}/projects/${ids.projectA1}/files/${ids.fileArchived}/Archived.pdf','Archived.pdf','archived.pdf','pdf','application/pdf',12,'${users.ownerA.id}');
select set_config('app.studio_version_finalize','1',true);
update public.studio_project_files set current_version_id='${ids.versionVisible}',version_count=1,latest_version_number=1,status='ready' where id='${ids.fileVisible}';
update public.studio_project_files set current_version_id='${ids.versionHidden}',version_count=1,latest_version_number=1,status='ready' where id='${ids.fileHidden}';
update public.studio_project_files set current_version_id='${ids.versionArchived}',version_count=1,latest_version_number=1,status='ready' where id='${ids.fileArchived}';
insert into public.studio_project_stage_files(organization_id,project_id,stage_id,file_id,is_customer_visible,created_by) values
('${ids.orgA}','${ids.projectA1}','${ids.stageA1}','${ids.fileVisible}',true,'${users.ownerA.id}'),('${ids.orgA}','${ids.projectA1}','${ids.stageA1}','${ids.fileHidden}',false,'${users.ownerA.id}'),('${ids.orgA}','${ids.projectA1}','${ids.stageA1}','${ids.fileArchived}',true,'${users.ownerA.id}'),('${ids.orgA}','${ids.projectA1}','${ids.stageA1}','${ids.filePending}',true,'${users.ownerA.id}');
insert into public.studio_project_renders(organization_id,project_id,logical_file_id,title,description,is_client_visible,created_by,updated_by) values
('${ids.orgA}','${ids.projectA1}','${ids.fileVisible}','Visible render','Client note',true,'${users.ownerA.id}','${users.ownerA.id}'),('${ids.orgA}','${ids.projectA1}','${ids.fileHidden}','Internal render','INTERNAL_RENDER_NOTE',false,'${users.ownerA.id}','${users.ownerA.id}');
insert into public.studio_finance_entries(organization_id,project_id,entry_type,title,description,category,amount,status,due_date,is_client_visible,created_by,updated_by) values
('${ids.orgA}','${ids.projectA1}','income','Visible paid payment','Client paid payment','project_fee',1000,'collected','2025-01-15',true,'${users.ownerA.id}','${users.ownerA.id}'),
('${ids.orgA}','${ids.projectA1}','progress_payment','Visible waiting payment','Client waiting payment','progress_payment',2000,'waiting','2030-01-15',true,'${users.ownerA.id}','${users.ownerA.id}'),
('${ids.orgA}','${ids.projectA1}','invoice','Visible overdue payment','Client overdue payment','invoice',3000,'waiting','2020-01-15',true,'${users.ownerA.id}','${users.ownerA.id}'),
('${ids.orgA}','${ids.projectA1}','expense','Personnel cost','INTERNAL_MARGIN_NOTE','personnel',999,'waiting',null,false,'${users.ownerA.id}','${users.ownerA.id}');
insert into public.studio_notifications(organization_id,project_id,source_type,channel,template_name,recipient_snapshot,provider_message_id,created_by) values
('${ids.orgA}','${ids.projectA1}','custom','client_portal','client-update','{"phone":"SECRET"}','${marker}-provider','${users.ownerA.id}'),('${ids.orgA}','${ids.projectA1}','custom','email','internal-update','{"email":"SECRET"}',null,'${users.ownerA.id}'),('${ids.orgA}','${ids.projectA2}','custom','client_portal','other-project','{}',null,'${users.ownerA.id}');
update public.studio_project_obligations set title='Visible process',description='INTERNAL_PROCESS_NOTE',is_client_visible=true,updated_by='${users.ownerA.id}' where project_id='${ids.projectA1}' and entity_type='application';
update public.studio_project_obligations set title='Internal process',description='SECRET',is_client_visible=false,updated_by='${users.ownerA.id}' where project_id='${ids.projectA1}' and entity_type='clean_application';
commit;`);

  const projections = {
    renders: await rpc("client_portal_list_renders", users.clientA.token, { p_project_id: ids.projectA1 }),
    files: await rpc("client_portal_list_files", users.clientA.token, { p_project_id: ids.projectA1 }),
    finance: await rpc("client_portal_list_finance", users.clientA.token, { p_project_id: ids.projectA1 }),
    notifications: await rpc("client_portal_list_notifications", users.clientA.token, { p_project_id: ids.projectA1 }),
    stages: await rpc("client_portal_list_stages", users.clientA.token, { p_project_id: ids.projectA1 }),
    processes: await rpc("client_portal_list_official_processes", users.clientA.token, { p_project_id: ids.projectA1 }),
  };
  assert.deepEqual(projections.renders.map((x) => x.title), ["Visible render"]);
  assert.deepEqual(projections.files.map((x) => x.display_name), ["Visible"]);
  assert.deepEqual(projections.finance.map((x) => x.title).sort(), ["Visible overdue payment", "Visible paid payment", "Visible waiting payment"]);
  assert.deepEqual(projections.finance.map((x) => x.status).sort(), ["collected", "waiting", "waiting"]);
  assert.deepEqual(projections.notifications.map((x) => x.template_name), ["client-update"]);
  assert.equal(projections.stages.some((x) => x.title === "Client visible stage"), true);
  assert.deepEqual(projections.processes.map((x) => x.title), ["Visible process"]);
  const serialized = JSON.stringify(projections);
  for (const sensitive of ["INTERNAL_", "recipient_snapshot", "provider_message_id", "description\":\"INTERNAL_PROCESS_NOTE"] ) assert.equal(serialized.includes(sensitive), false, sensitive);
  for (const projectionRows of Object.values(projections)) {
    for (const row of projectionRows) {
      for (const field of ["note", "recipient_snapshot", "variables_snapshot", "provider_message_id", "internal_notes", "metadata", "audit_payload"]) assert.equal(Object.hasOwn(row, field), false, field);
    }
  }
  assert.deepEqual(await rpc("client_portal_list_renders", users.clientB.token, { p_project_id: ids.projectA1 }), []);
  results.push("render/file/finance/notification/stage/process projections and sensitive-field exclusion: PASS");

  assert.deepEqual(await rows("studio_project_renders", users.clientA.token, "select=id"), []);
  assert.deepEqual(await rows("studio_finance_entries", users.clientA.token, "select=id"), []);
  assert.deepEqual(await rows("studio_notifications", users.clientA.token, "select=id"), []);
  results.push("direct child-table bypass blocked: PASS");

  await rpc("studio_revoke_client_project_access", users.ownerA.token, { p_project_id: ids.projectA1, p_user_id: users.clientA.id });
  assert.deepEqual(await rows("studio_projects", users.clientA.token, "select=id"), []);
  await rpc("studio_grant_client_project_access", users.ownerA.token, { p_project_id: ids.projectA1, p_user_id: users.clientA.id });
  assert.deepEqual((await rows("studio_projects", users.clientA.token, "select=id")).map((x) => x.id), [ids.projectA1]);
  results.push("revoke immediate effect and re-grant: PASS");

  await expectFailure("member cannot create client invitation", () => rpc("studio_create_client_invitation", users.memberA.token, { p_project_id: ids.projectA1, p_invited_email: "blocked@example.invalid", p_expires_at: new Date(Date.now() + 86400000).toISOString() }));
  const staffInvite = await rpc("studio_create_client_invitation", users.ownerA.token, { p_project_id: ids.projectA1, p_invited_email: users.memberA.email, p_expires_at: new Date(Date.now() + 86400000).toISOString() });
  await expectFailure("staff membership cannot become client", () => rpc("studio_accept_client_invitation", users.memberA.token, { p_token: staffInvite[0].invitation_token }));
  const stored = await request(`/rest/v1/studio_client_invitations?select=token_hash&project_id=eq.${ids.projectA2}`, { key: anon, token: users.ownerA.token, headers: { Accept: "application/json" } });
  assert.equal(stored.some((x) => x.token_hash === invitation[0].invitation_token), false);
  assert.equal(stored[0].token_hash.length, 64);
  results.push("owner-only invitation, plaintext not stored, staff role protected: PASS");

  const expiredToken = `expired-${randomUUID()}`;
  const expiredHash = createHash("sha256").update(expiredToken).digest("hex");
  dbQuery(`insert into public.studio_client_invitations(organization_id,project_id,invited_email,token_hash,status,expires_at,invited_by,created_at) values('${ids.orgA}','${ids.projectA1}','${users.clientA.email}','${expiredHash}','pending',now()-interval '1 day','${users.ownerA.id}',now()-interval '2 days');`);
  await expectFailure("expired invitation is rejected", () => rpc("studio_accept_client_invitation", users.clientA.token, { p_token: expiredToken }));
  await expectFailure("anonymous projection execution is revoked", () => request("/rest/v1/rpc/client_portal_list_projects", { key: anon, token: anon, method: "POST", body: {} }));

  const audits = await request(`/rest/v1/activity_events?select=action&organization_id=eq.${ids.orgA}`, { key: anon, token: users.ownerA.token });
  for (const action of ["client_project_access_granted", "client_project_access_revoked", "client_invitation_accepted"]) assert.equal(audits.some((x) => x.action === action), true, action);
  results.push("security audit events: PASS");

  console.log(results.join("\n"));
} finally {
  try { cleanupDatabase(); } catch (error) { console.error("cleanup database:", error.message); }
  for (const user of Object.values(users)) {
    try { await request(`/rest/v1/profiles?id=eq.${user.id}`, { method: "DELETE" }); } catch {}
    try { await request(`/auth/v1/admin/users/${user.id}`, { method: "DELETE" }); } catch (error) { console.error(`cleanup auth user ${user.id}:`, error.message); }
  }
}
