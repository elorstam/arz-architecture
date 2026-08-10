import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const migration=fs.readFileSync("supabase/migrations/028_permanent_project_delete.sql","utf8");
const page=fs.readFileSync("components/studio/projects/ProjectPermanentDeleteDialog.tsx","utf8");
const actions=fs.readFileSync("app/studio/(protected)/projects/actions.ts","utf8");

test("permanent deletion is owner-gated and audited server-side",()=>{
 assert.match(migration,/studio_project_deletion_audits/);
 assert.match(migration,/studio_has_organization_role\(.*owner/);
 assert.match(migration,/studio_permanently_delete_project/);
 assert.match(migration,/insert into public\.studio_project_deletion_audits/);
 assert.match(migration,/delete from public\.studio_projects/);
 assert.match(actions,/permanentlyDeleteStudioProject/);
});

test("confirmation requires exact project name and is one-time",()=>{
 assert.match(page,/confirmation\.trim\(\)/);
 assert.match(page,/Bu işlem geri alınamaz/);
 assert.match(page,/Kalıcı Olarak Sil/);
 assert.match(migration,/used_at/);
 assert.match(migration,/expires_at/);
});

test("archive remains a separate action",()=>{
 assert.match(fs.readFileSync("components/studio/projects/StudioProjectArchiveControl.tsx","utf8"),/setStudioProjectArchivedAction/);
 assert.doesNotMatch(page,/setStudioProjectArchivedAction/);
});
