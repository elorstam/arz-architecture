import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=(path)=>readFileSync(path,"utf8");
const migration=read("supabase/migrations/009_studio_file_versions.sql");
const rollback=read("supabase/rollbacks/009_studio_file_versions.rollback.sql");
const repository=read("lib/studio/files/versions/version-repository.ts");
const fileRepository=read("lib/studio/files/file-repository.ts");
const upload=read("components/studio/files/StudioFileVersionUpload.tsx");
const detail=read("components/studio/files/StudioFileDetail.tsx");

test("migration models immutable physical versions and a single current pointer",()=>{
 assert.match(migration,/create table if not exists public\.studio_project_file_versions/);
 assert.match(migration,/unique\(file_id,version_number\)/);
 assert.match(migration,/where is_current=true/);
 assert.match(migration,/current_version_id uuid/);
 assert.match(migration,/for update/);
 assert.match(migration,/greatest\(master\.latest_version_number/);
 assert.doesNotMatch(migration,/create policy .*delete/i);
});

test("backfill creates only safe ready V1 rows and is repeat-safe",()=>{
 assert.match(migration,/f\.status='ready'/);
 assert.match(migration,/version_number=1/);
 assert.match(migration,/not exists\(select 1 from public\.studio_project_file_versions/);
 assert.match(migration,/storage_provider='supabase'/);
 assert.match(migration,/external_file_id is not null/);
});

test("RLS grants member read and owner mutation without delete",()=>{
 assert.match(migration,/studio_file_versions_select_member/);
 assert.match(migration,/studio_is_organization_member\(organization_id\)/);
 assert.match(migration,/studio_file_versions_insert_owner/);
 assert.match(migration,/studio_has_organization_role\(organization_id,array\['owner'\]\)/);
 assert.match(migration,/revoke delete .*anon,authenticated/);
});

test("version upload reuses resumable Drive upload and rejects extension changes",()=>{
 assert.match(repository,/createDriveResumableSession/);
 assert.match(repository,/checked\.extension!==value\.file\.extension/);
 assert.match(repository,/version_id:reservation\.version_id/);
 assert.match(upload,/uploadToGoogleDriveSession/);
 assert.match(upload,/role="progressbar"/);
});

test("rollback copies instead of overwriting and remains replay-aware",()=>{
 assert.match(repository,/copyDriveFile/);
 assert.match(repository,/source_version_id/);
 assert.match(repository,/revision_reason","rollback"/);
 assert.doesNotMatch(repository,/permissions\.create|anyoneWithLink|overwrite=true/);
});

test("rename move archive and restore operate on historical ready versions",()=>{
 assert.match(fileRepository,/readyDriveVersions/);
 assert.match(fileRepository,/physicalVersionName/);
 assert.match(fileRepository,/moveHistoricalVersions/);
 assert.match(fileRepository,/version_archive_partial/);
 assert.match(fileRepository,/version_restore_partial/);
});

test("history UI exposes current state, downloads and controlled promotion",()=>{
 assert.match(detail,/Sürüm Geçmişi/);
 assert.match(detail,/Güncel/);
 assert.match(detail,/StudioVersionPromoteButton/);
 assert.match(detail,/versions\/\$\{version\.id\}\/download/);
});

test("rollback removes version schema without touching file history elsewhere",()=>{
 assert.match(rollback,/drop table if exists public\.studio_project_file_versions/);
 assert.match(rollback,/drop column if exists current_version_id/);
 assert.doesNotMatch(rollback,/delete from public\.studio_project_files/i);
});
