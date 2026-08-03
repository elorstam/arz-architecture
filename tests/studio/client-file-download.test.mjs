import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const repository=readFileSync("lib/client-portal/files/client-file-download.ts","utf8");
const route=readFileSync("app/client/(portal)/files/[fileId]/download/route.ts","utf8");
const constants=readFileSync("lib/studio/files/file-constants.ts","utf8");
const migration=readFileSync("supabase/migrations/041_client_file_download_service_grants.sql","utf8");
const rollback=readFileSync("supabase/rollbacks/041_client_file_download_service_grants.rollback.sql","utf8");

test("client download is authorized through the existing safe file projection",()=>{
 assert.match(repository,/getClientPortalContext\(\)/);
 assert.match(repository,/client_portal_list_files/);
 assert.match(repository,/file\.id===fileId/);
 assert.match(repository,/\.eq\("organization_id",authorized\.context\.membership!/);
});

test("canonical ready current version is resolved only after client authorization",()=>{
 assert.match(repository,/studio_project_file_versions/);
 assert.match(repository,/\.eq\("id",file\.current_version_id\)/);
 assert.match(repository,/\.eq\("status","ready"\)/);
 assert.match(repository,/\.eq\("is_current",true\)/);
 assert.match(repository,/\.eq\("is_archived",false\)/);
});

test("private object URL is short lived and never returned to the browser",()=>{
 assert.match(constants,/STUDIO_FILE_SIGNED_URL_SECONDS=60/);
 assert.match(repository,/createSignedUrl\(version\.storage_path,STUDIO_FILE_SIGNED_URL_SECONDS/);
 assert.match(repository,/fetch\(signed\.signedUrl/);
 assert.doesNotMatch(route,/redirect|signedUrl|storage_path|SUPABASE_SERVICE_ROLE_KEY/);
});

test("download response is private, sanitized, and enumeration safe",()=>{
 assert.match(route,/Cache-Control":"private, no-store"/);
 assert.match(route,/Content-Disposition/);
 assert.match(route,/replace\(\/\["\\\\\\r\\n\]\/g/);
 assert.match(route,/status===404\?"Dosya bulunamadı veya erişim reddedildi\./);
 assert.doesNotMatch(route,/service.role|object\/public|getPublicUrl/i);
});

test("server metadata grant repair is minimal and rollback balanced",()=>{
 assert.match(migration,/grant select on table public\.studio_project_files to service_role/);
 assert.match(migration,/grant select on table public\.studio_project_file_versions to service_role/);
 assert.doesNotMatch(migration,/authenticated|anon|disable row level security/i);
 assert.match(rollback,/revoke select on table public\.studio_project_file_versions from service_role/);
 for(const sql of[migration,rollback]){assert.match(sql,/^begin;/);assert.match(sql,/commit;/);}
});
