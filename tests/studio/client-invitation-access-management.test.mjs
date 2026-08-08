import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const read=path=>readFileSync(path,"utf8");
const migration=read("supabase/migrations/043_client_invitation_access_management.sql");
const rollback=read("supabase/rollbacks/043_client_invitation_access_management.rollback.sql");
const repository=read("lib/studio/client-access/client-access-repository.ts");
const createApi=read("app/api/studio/projects/[projectId]/client-invitations/route.ts");
const revokeApi=read("app/api/studio/projects/[projectId]/client-invitations/[invitationId]/route.ts");
const renewApi=read("app/api/studio/projects/[projectId]/client-invitations/[invitationId]/renew/route.ts");
const accessApi=read("app/api/studio/projects/[projectId]/client-access/[userId]/route.ts");
const page=read("app/studio/(protected)/projects/[projectId]/client/page.tsx");
const projectTabs=read("components/studio/projects/StudioProjectTabs.tsx");
const manager=read("components/studio/projects/StudioClientAccessManager.tsx");
const email=read("lib/studio/client-access/client-invitation-email.ts");

test("owner-only projections isolate invitation access and audit lists by project organization",()=>{
 for(const name of["studio_list_client_invitations","studio_list_client_project_access","studio_list_client_access_events"])assert.match(migration,new RegExp(`function public\\.${name}`));
 assert.match(migration,/studio_has_organization_role\(v_org,array\['owner'\]\)/);
 assert.match(migration,/i\.organization_id=v_org and i\.project_id=p_project_id/);
 assert.match(migration,/a\.organization_id=v_org and a\.project_id=p_project_id/);
 assert.match(migration,/e\.organization_id=v_org and e\.metadata->>'project_id'=p_project_id::text/);
 assert.doesNotMatch(repository,/service.role|studio_client_invitations\"\)\.select|studio_client_project_access\"\)\.select/i);
});

test("invitation lifecycle persists real pending accepted expired and revoked states",()=>{
 assert.match(migration,/set status='expired'.*status='pending'.*expires_at<=now\(\)/s);
 assert.match(migration,/status='revoked'/);
 assert.match(migration,/set status='accepted',invited_user_id=auth\.uid\(\),accepted_at=now\(\)/);
 for(const status of["pending","accepted","expired","revoked"])assert.match(manager,new RegExp(status));
});

test("duplicate pending invitations are rejected and explicit renewal revokes before replacement",()=>{
 assert.match(migration,/pending_invitation_exists/);
 assert.match(migration,/select invited_email into v_email.*status='pending' for update/s);
 assert.match(migration,/update public\.studio_client_invitations set status='revoked'.*insert into public\.studio_client_invitations/s);
 assert.match(createApi,/duplicate \|\| active[\s\S]*?\? 409[\s\S]*?authorization[\s\S]*?\? 403[\s\S]*?: 500/);
 assert.match(manager,/kind:"renew-invitation"/);
});

test("invitation revoke is enumeration-safe and cannot cross project or organization",()=>{
 assert.match(migration,/id=p_invitation_id and organization_id=v_org and project_id=p_project_id and status='pending'/);
 assert.match(revokeApi,/error:\"Davet bulunamadı\.\".*status:404/);
 assert.doesNotMatch(revokeApi,/error\.message|organization_id/);
 assert.match(renewApi,/error:\"Davet bulunamadı\.\".*status:404/);
});

test("access revoke uses the existing centralized owner RPC and portal guards remain intact",()=>{
 assert.match(accessApi,/studio_revoke_client_project_access/);
 assert.match(accessApi,/p_project_id:values\.projectId,p_user_id:values\.userId/);
 const foundation=read("supabase/migrations/035_client_portal_security_foundation.sql");
 assert.match(foundation,/studio_client_can_access_project/);
 assert.match(foundation,/a\.revoked_at is null/);
 for(const source of["lib/client-portal/files/client-file-download.ts","lib/client-portal/renders/client-render-preview.ts","supabase/migrations/042_client_notification_center.sql"]){const value=read(source);assert.match(value,/studio_client_can_access_project|client_portal_/);}
});

test("accepted invitation remains idempotent but cannot restore revoked access",()=>{
 assert.match(migration,/v_inv\.status='accepted'.*revoked_at is null.*accepted_invitation_access_missing/s);
 assert.match(migration,/if v_access is null then insert into public\.studio_client_project_access/);
 assert.match(migration,/client_project_access_granted/);
});

test("tokens are hashed at rest transient in APIs and absent from audit metadata",()=>{
 assert.match(migration,/digest\(v_token,'sha256'\)/);
 assert.doesNotMatch(migration,/jsonb_build_object\([^)]*(token|invitation_token)/i);
 assert.doesNotMatch(createApi+renewApi+email,/console\.(log|info|warn)/);
 assert.doesNotMatch(manager,/token_hash|invitation_token/);
 assert.match(createApi,/Cache-Control":\s*"private, no-store/);
});

test("email delivery is optional and provider failure does not mutate invitation state",()=>{
 assert.match(email,/if\(!process\.env\.RESEND_API_KEY\)return "unavailable"/);
 assert.match(email,/return result\.error\?"failed":"sent"/);
 assert.match(createApi,/sendClientInvitationEmail/);
 assert.match(renewApi,/sendClientInvitationEmail/);
 assert.doesNotMatch(email,/studio_client_invitations|accepted|revoked/);
});

test("Project Detail reuses existing cards badges modal and one-time link behavior",()=>{
 assert.match(page,/StudioProjectTabs/);assert.match(page,/StudioClientInvitationLink/);assert.match(page,/StudioClientAccessManager/);
 for(const primitive of["StudioCard","StudioBadge","StudioModal","StudioSectionHeader","StudioEmptyState"])assert.match(manager,new RegExp(primitive));
 assert.match(manager,/Yenilenen davet bağlantısı/);assert.match(manager,/router\.refresh\(\)/);
});

test("Project Detail navigation exposes the active customer access route",()=>{
 assert.match(projectTabs,/href:`\/studio\/projects\/\$\{projectId\}\/client`/);
 assert.match(projectTabs,/label:"Müşteri Erişimi"/);
 assert.match(projectTabs,/icon:"clients"/);
 assert.match(projectTabs,/client:6/);
 assert.match(page,/StudioProjectTabs projectId=\{projectId\} active="client"/);
});

test("migration 043 and rollback are transactional balanced and do not weaken RLS",()=>{
 for(const sql of[migration,rollback]){assert.match(sql,/^begin;/);assert.match(sql,/notify pgrst,'reload schema'/);assert.match(sql,/commit;/);}
 assert.doesNotMatch(migration,/disable row level security|grant (select|insert|update|delete) on/i);
 for(const fn of["studio_list_client_invitations","studio_list_client_project_access","studio_list_client_access_events","studio_revoke_client_invitation","studio_renew_client_invitation"])assert.match(rollback,new RegExp(`drop function if exists public\\.${fn}`));
});
