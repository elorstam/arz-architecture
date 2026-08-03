import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validateUploadFile} from "../../lib/studio/files/file-validation.ts";

const read=path=>readFileSync(path,"utf8");
const migration=read("supabase/migrations/010_fix_file_upload_reservation.sql");
const rollback=read("supabase/rollbacks/010_fix_file_upload_reservation.rollback.sql");
const repository=read("lib/studio/files/file-repository.ts");
const errors=read("lib/studio/files/file-errors.ts");
const versionMigration=read("supabase/migrations/009_studio_file_versions.sql");

test("PNG reservation supports Drive-sized files and starts without a current version",()=>{
 const png=validateUploadFile({name:"fl.png",type:"image/png",size:12*1024*1024,category:"image"});
 assert.equal(png.success,true);
 assert.match(migration,/file_size<=5368709120/);
 assert.match(migration,/status<>'uploading' or \(current_version_id is null and version_count=0 and latest_version_number=0\)/);
});

test("ready logical files require a consistent current ready version",()=>{
 assert.match(migration,/new\.status='ready'/);
 assert.match(migration,/new\.current_version_id is null/);
 assert.match(migration,/v\.is_current=true and v\.status='ready'/);
 assert.match(versionMigration,/current_version_id=new_version_id,version_count=1,latest_version_number=1/);
});

test("reservation remains owner scoped and folder identity is server verified",()=>{
 assert.match(repository,/project\(input\.projectId,true\)/);
 assert.match(repository,/folderRow\(scope,input\.folderId\)/);
 assert.match(repository,/File folder must belong to same project|parentId=requireDriveFolder/);
 assert.match(migration,/grant select,insert,update on public\.studio_project_files to authenticated/);
 assert.doesNotMatch(migration,/create policy .*delete/i);
});

test("HEIC is intentionally rejected before reservation",()=>{
 const result=validateUploadFile({name:"IMG_3186.HEIC",type:"image/heic",size:1024,category:"image"});
 assert.equal(result.success,false);
 assert.equal(result.message,"HEIC dosyaları şu anda desteklenmiyor. JPG, PNG veya WebP kullanın.");
});

test("Drive session begins only after a successful database reservation",()=>{
 const insert=repository.indexOf('.from("studio_project_files").insert(');
 const guard=repository.indexOf("if(reservation.error)throw normalizeFileReservationError",insert);
 const session=repository.indexOf("createDriveResumableSession",guard);
 assert.ok(insert>=0&&guard>insert&&session>guard);
});

test("safe reservation diagnostics classify PostgreSQL failures",()=>{
 assert.match(errors,/STUDIO_FILE_RESERVATION_ERROR/);
 assert.match(errors,/value\.code==="42501"/);
 assert.match(errors,/value\.code==="23514"/);
 assert.match(errors,/file_reservation_schema_mismatch/);
 assert.doesNotMatch(errors,/details\s*:/);
});

test("migration and rollback are balanced and migration 010 is not destructive",()=>{
 for(const sql of [migration,rollback]){assert.equal((sql.match(/^begin;$/gim)||[]).length,1);assert.equal((sql.match(/^commit;$/gim)||[]).length,1);assert.equal((sql.match(/\$\$/g)||[]).length%2,0);}
 assert.doesNotMatch(migration,/delete from|create policy .*delete|disable row level security/i);
 assert.match(rollback,/not valid/);
});
