import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const read=path=>readFileSync(new URL(`../../${path}`,import.meta.url),"utf8");
const migration=read("supabase/migrations/035_client_portal_security_foundation.sql");
const rollback=read("supabase/migrations/035_client_portal_security_foundation.rollback.sql");

test("migration and rollback are transaction safe and reload schema",()=>{
 for(const sql of[migration,rollback]){assert.equal((sql.match(/\bbegin;/gi)??[]).length,1);assert.equal((sql.match(/\bcommit;/gi)??[]).length,1);assert.match(sql,/notify pgrst,'reload schema'/)}
 assert.doesNotMatch(migration,/delete from|truncate table/i);
});

test("project access is active-only, cross-organization safe and revocable",()=>{
 assert.match(migration,/create table if not exists public\.studio_client_project_access/);
 assert.match(migration,/unique index[^;]*\(user_id,project_id\) where revoked_at is null/);
 assert.match(migration,/join public\.studio_projects p on p\.id=a\.project_id and p\.organization_id=a\.organization_id/);
 assert.match(migration,/m\.status='active' and m\.role='client'/);
 assert.match(migration,/update public\.studio_client_project_access set revoked_at=now\(\)/);
 assert.doesNotMatch(migration,/delete from public\.studio_client_project_access/);
});

test("owner and member project behavior remains while clients require explicit access",()=>{
 assert.match(migration,/m\.role in\('owner','admin','team_member'\)/);
 assert.match(migration,/studio_projects_select_scoped/);
 assert.match(migration,/studio_is_non_client_member\(organization_id\) or public\.studio_client_can_access_project\(auth\.uid\(\),id\)/);
});

test("client base-table access is denied and safe projections enforce visibility",()=>{
 for(const policy of["studio_project_renders_select_staff","studio_project_stages_select_staff","studio_notifications_select_staff","studio_finance_entries_select_staff","studio_obligations_select_staff","studio_files_select_staff"])assert.match(migration,new RegExp(policy));
 assert.match(migration,/r\.is_client_visible and r\.archived_at is null/);
 assert.match(migration,/s\.is_client_visible and s\.is_active and not s\.is_archived/);
 assert.match(migration,/n\.channel='client_portal'/);
 assert.match(migration,/e\.is_client_visible and not e\.is_archived and e\.entry_type in\('income','progress_payment','invoice'\)/);
 assert.doesNotMatch(migration,/client_portal_list_finance[\s\S]*personnel|gross_profit|margin/);
});

test("file sharing uses only explicit customer-visible stage attachments",()=>{
 assert.match(migration,/client_portal_list_files/);
 assert.match(migration,/sf\.is_customer_visible and sf\.archived_at is null/);
 assert.match(migration,/f\.status='ready' and not f\.is_archived/);
 assert.doesNotMatch(migration,/alter table public\.studio_project_files[\s\S]*add column[^;]*is_client_visible/);
});

test("notification and invitation projections do not expose private snapshots or tokens",()=>{
 assert.match(migration,/create table if not exists public\.studio_client_invitations/);
 assert.match(migration,/token_hash text not null unique/);
 assert.match(migration,/encode\(digest\(p_token,'sha256'\),'hex'\)/);
 assert.match(migration,/client_invitation_accepted/);
 const notificationProjection=migration.match(/create or replace function public\.client_portal_list_notifications[\s\S]*?\$\$;/)?.[0]??"";
 assert.doesNotMatch(notificationProjection,/variables_snapshot|recipient_snapshot|safe_error_code|provider_message_id/);
});

test("grant revoke and acceptance audit without sensitive invitation payload",()=>{
 for(const event of["client_project_access_granted","client_project_access_revoked","client_invitation_accepted"])assert.match(migration,new RegExp(event));
 assert.doesNotMatch(migration,/jsonb_build_object\([^)]*(token|email)/i);
});

test("rollback restores canonical policies and removes only foundation objects",()=>{
 for(const policy of["studio_projects_select_member","studio_project_renders_select","studio_project_stages_select","studio_notifications_select","studio_finance_entries_select","studio_obligations_select","studio_files_select_member"])assert.match(rollback,new RegExp(`create policy ${policy}`));
 assert.match(rollback,/drop table if exists public\.studio_client_invitations/);
 assert.match(rollback,/drop table if exists public\.studio_client_project_access/);
 assert.doesNotMatch(rollback,/drop table if exists public\.(studio_projects|studio_project_files|studio_notifications|studio_finance_entries)/);
});
