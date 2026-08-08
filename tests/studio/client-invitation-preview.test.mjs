import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import test from "node:test";

const read=path=>readFileSync(path,"utf8");
const auth=read("lib/client-portal/auth.ts");
const page=read("app/client/invite/[token]/page.tsx");
const accept=read("app/api/client/invitations/accept/route.ts");
const createApi=read("app/api/studio/projects/[projectId]/client-invitations/route.ts");
const migration=read("supabase/migrations/045_client_invitation_preview_service_grants.sql");
const rollback=read("supabase/rollbacks/045_client_invitation_preview_service_grants.rollback.sql");
const createMigration=read("supabase/migrations/044_fix_client_invitation_expiry_ambiguity.sql");
const acceptMigration=read("supabase/migrations/043_client_invitation_access_management.sql");

test("Postgres and Node hash the same exact 64-character hex token bytes",()=>{
 const token="0123456789abcdef".repeat(4);
 assert.equal(createHash("sha256").update(token).digest("hex"),"a8ae6e6ee929abea3afcfc5258c8ccd6f85273e0d4626d26c7279f3250f77c8e");
 assert.match(createMigration,/v_token\s*:=\s*encode\([\s\S]*?gen_random_bytes\(32\)[\s\S]*?'hex'/);
 assert.match(createMigration,/digest\([\s\S]*?v_token,[\s\S]*?'sha256'/);
 assert.match(auth,/\/\^\[0-9a-f\]\{64\}\$\/i\.test\(token\)/);
 assert.match(auth,/createHash\([\s\S]*?"sha256"[\s\S]*?\.update\(token\)[\s\S]*?\.digest\("hex"\)/);
});

test("preview uses only the server-side secret key and exact hash lookup",()=>{
 assert.match(auth,/process\.env\.SUPABASE_SERVICE_ROLE_KEY/);
 assert.match(auth,/process\.env\.NEXT_PUBLIC_SUPABASE_URL/);
 assert.match(auth,/\.from\([\s\S]*?"studio_client_invitations"[\s\S]*?\.eq\([\s\S]*?"token_hash",[\s\S]*?hash/);
 assert.doesNotMatch(page+accept,/SUPABASE_SERVICE_ROLE_KEY|token_hash/);
 assert.doesNotMatch(auth,/NEXT_PUBLIC_SUPABASE_SERVICE|serviceRoleKey\s*:/);
});

test("service-role preview receives only the two required read grants",()=>{
 assert.match(migration,/grant select on public\.studio_client_invitations to service_role/);
 assert.match(migration,/grant select on public\.studio_projects to service_role/);
 assert.doesNotMatch(migration,/to anon|to authenticated|disable row level security|grant (insert|update|delete|all)/i);
 assert.match(rollback,/revoke select on public\.studio_client_invitations from service_role/);
 assert.match(rollback,/revoke select on public\.studio_projects from service_role/);
 for(const sql of[migration,rollback]){assert.match(sql,/^begin;/);assert.match(sql,/notify pgrst, 'reload schema'/);assert.match(sql,/commit;/);}
});

test("pending preview returns project email and expiry while lifecycle states stay distinct",()=>{
 for(const state of["accepted","revoked","expired","pending"])assert.match(auth,new RegExp(`case "${state}"`));
 assert.match(auth,/state = expired[\s\S]*?\? "expired"[\s\S]*?: "valid"/);
 assert.match(auth,/projectName:[\s\S]*?project\.name/);
 assert.match(auth,/email:[\s\S]*?invitation\.invited_email/);
 assert.match(auth,/expiresAt:[\s\S]*?invitation\.expires_at/);
 assert.match(page,/preview\.projectName/);assert.match(page,/preview\.email/);assert.match(page,/preview\.expiresAt/);
});

test("missing tokens are invalid but operational failures are unavailable and enumeration-safe",()=>{
 assert.match(auth,/if \(!invitationData\)[\s\S]*?state: "invalid"/);
 assert.match(auth,/ClientInvitationPreviewError/);
 assert.match(auth,/CLIENT_INVITATION_PREVIEW_FAILED/);
 assert.doesNotMatch(auth,/console\.error\([\s\S]{0,180}(token|hash|invited_email|details|hint)/i);
 assert.match(page,/catch\(\(\)=>\(\{state:"unavailable"/);
 assert.match(accept,/preview\.state==="unavailable"[\s\S]*?status:503/);
 assert.doesNotMatch(page+accept,/permission denied|42501|SUPABASE_/);
});

test("acceptance keeps the same token and idempotent database function",()=>{
 assert.match(accept,/studio_accept_client_invitation/);
 assert.match(accept,/p_token:input\.data\.token/);
 assert.match(acceptMigration,/token_hash=encode\(extensions\.digest\(p_token,'sha256'\),'hex'\)/);
 assert.match(acceptMigration,/v_inv\.status='accepted'.*accepted_invitation_access_missing/s);
 assert.match(acceptMigration,/studio_client_can_access_project|organization_id=v_inv\.organization_id|v_inv\.project_id/);
});

test("create API maps validation authorization conflicts and unexpected errors separately",()=>{
 assert.match(createApi,/duplicate \|\| active[\s\S]*?\? 409/);
 assert.match(createApi,/validation[\s\S]*?\? 400/);
 assert.match(createApi,/authorization[\s\S]*?\? 403/);
 assert.match(createApi,/: 500/);
 assert.doesNotMatch(createApi,/details:|hint:|message: error\?\.message/);
 assert.doesNotMatch(createApi,/CLIENT_INVITATION_CREATE_FAILED[\s\S]{0,180}projectId/);
});
