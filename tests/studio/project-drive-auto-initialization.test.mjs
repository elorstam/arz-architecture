import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

const actions=await readFile(new URL("../../app/studio/(protected)/projects/actions.ts",import.meta.url),"utf8");
const auto=await readFile(new URL("../../lib/studio/files/storage/project-drive-auto-initialization.ts",import.meta.url),"utf8");
const mapping=await readFile(new URL("../../lib/studio/files/storage/google-drive-mapping.ts",import.meta.url),"utf8");
const page=await readFile(new URL("../../app/studio/(protected)/projects/[projectId]/files/page.tsx",import.meta.url),"utf8");

test("successful project creation triggers automatic Drive initialization before redirect",()=>{const createIndex=actions.indexOf("createStudioProject(parsed.input)");const initializeIndex=actions.indexOf("initializeStudioProjectDriveStorageIfReady(projectId)");const redirectIndex=actions.indexOf("redirect(`/studio/projects/${projectId}`)");assert.ok(createIndex>=0&&initializeIndex>createIndex&&redirectIndex>initializeIndex);});
test("Drive initialization failure cannot turn project creation into failure",()=>{assert.match(actions,/initializeStudioProjectDriveStorageIfReady\(projectId\)\.catch\(\(\)=>undefined\)/);assert.ok(actions.indexOf("catch(error){return actionError")<actions.indexOf("await initializeStudioProjectDriveStorageIfReady(projectId)"));});
test("automatic path is owner-only and organization scoped",()=>{assert.match(auto,/ctx\.membership\.role!=="owner"/);assert.match(auto,/\.eq\("organization_id",organizationId\)/);assert.doesNotMatch(auto,/service.role|SUPABASE_SERVICE_ROLE_KEY/i);});
test("only a connected connection with stored root ids is eligible",()=>{assert.match(auto,/connection\?\.status!=="connected"/);assert.match(auto,/!connection\.root_folder_id\|\|!connection\.projects_folder_id/);assert.match(auto,/status:"skipped"/);});
test("automatic path verifies roots and never creates them",()=>{assert.match(auto,/getDriveFileMetadata/);assert.match(auto,/projects\.parents\.includes\(root\.id\)/);assert.doesNotMatch(auto,/createDriveFolder|initializeStudioGoogleDriveRoot/);});
test("existing mapping remains idempotent by appProperties and external ids",()=>{assert.match(mapping,/project\.external_project_folder_id\?await getDriveFileMetadata/);assert.match(mapping,/logical_folder_id:folder\.id/);assert.match(mapping,/findDriveFolder/);});
test("failure marks project sync state and exposes recovery CTA",()=>{assert.match(auto,/storage_sync_status:"error"/);assert.match(page,/Drive klasörleri hazırlanamadı\. Tekrar Dene\./);assert.match(page,/Proje Klasörlerini Hazırla/);assert.match(page,/status\.project\?\.storage_sync_status==="error"/);});
test("members cannot see or invoke the recovery form",()=>{assert.match(page,/status\.canManage\?<div/);assert.match(mapping,/if\(ctx\.membership\.role!=="owner"\)/);});
