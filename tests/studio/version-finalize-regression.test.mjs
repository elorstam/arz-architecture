import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=path=>readFileSync(path,"utf8");
const migration=read("supabase/migrations/011_fix_version_finalize.sql");
const migration008=read("supabase/migrations/008_google_drive_file_operations.sql");
const repository=read("lib/studio/files/versions/version-repository.ts");

test("root regression is the migration 008 immutable current metadata mirror",()=>{assert.match(migration008,/new\.mime_type is distinct from old\.mime_type/);assert.match(migration008,/new\.file_size is distinct from old\.file_size/);assert.match(migration008,/Controlled file fields cannot be changed/);});

test("011 permits current metadata mirrors only inside controlled finalize",()=>{assert.match(migration,/current_setting\('app\.studio_version_finalize',true\)/);assert.match(migration,/set_config\('app\.studio_version_finalize','1',true\)/);assert.match(migration,/new\.file_size is distinct from old\.file_size and not version_finalize/);assert.match(migration,/new\.mime_type is distinct from old\.mime_type and not version_finalize/);});

test("V2 finalize atomically switches pointer counters and sync metadata",()=>{assert.match(migration,/set is_current=false where file_id=master\.id and is_current=true/);assert.match(migration,/status='ready',sync_status='synced',sync_error_code=null,is_current=true/);assert.match(migration,/current_version_id=version_row\.id/);assert.match(migration,/version_count=\(select count\(\*\)/);assert.match(migration,/latest_version_number=greatest\(latest_version_number,version_row\.version_number\)/);assert.match(migration,/provider_version=target_provider_version/);assert.match(migration,/external_modified_at=target_external_modified_at/);});

test("repeat finalize is idempotent and cannot create a Drive duplicate",()=>{assert.match(migration,/version_row\.status='ready'.*master\.current_version_id=version_row\.id then return/);assert.doesNotMatch(migration,/copy|insert into public\.studio_project_file_versions/i);assert.doesNotMatch(repository,/createDriveResumableSession.*finalizeStudioFileVersion/);});

test("safe finalize diagnostic records SQL state without tokens",()=>{assert.match(repository,/STUDIO_VERSION_FINALIZE/);assert.match(repository,/step:"rpc_current_pointer_switch"/);assert.match(repository,/sqlState:error\.code/);assert.match(repository,/operation:"finalize_file_version"/);assert.doesNotMatch(repository,/STUDIO_VERSION_FINALIZE[^\n]*(token|externalFileId)/);});

test("011 is transactional and preserves owner RPC grants",()=>{assert.equal((migration.match(/^begin;$/gim)||[]).length,1);assert.equal((migration.match(/^commit;$/gim)||[]).length,1);assert.equal((migration.match(/\$\$/g)||[]).length%2,0);assert.match(migration,/grant execute .* to authenticated/);assert.doesNotMatch(migration,/delete from|disable row level security|create policy .*delete/i);});
