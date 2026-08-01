import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=path=>readFileSync(path,"utf8");
const ui=read("components/studio/files/StudioFileVersionUpload.tsx");
const recovery=read("lib/studio/files/uploads/google-drive-version-upload-recovery.ts");
const uploader=read("lib/studio/files/uploads/google-drive-resumable-upload.ts");
const repository=read("lib/studio/files/versions/version-repository.ts");
const actions=read("app/studio/(protected)/projects/[projectId]/files/actions.ts");
const detail=read("components/studio/files/StudioFileDetail.tsx");

test("version reservation precedes transfer and keeps the assigned version id",()=>{const reserve=ui.indexOf("reserveFileVersionUploadAction");const transfer=ui.indexOf("await transfer",reserve);assert.ok(reserve>=0&&transfer>reserve);assert.match(ui,/versionId:reservation\.id/);});

test("unreadable final PUT is uncertain and does not immediately call fail",()=>{assert.match(ui,/error instanceof GoogleDriveUploadUncertainError/);const uncertain=ui.indexOf("if(uncertain)");const fail=ui.indexOf("failFileVersionUploadAction",uncertain);const alternate=ui.indexOf("}else{",uncertain);assert.ok(alternate>uncertain&&fail>alternate);assert.match(ui,/Yeni sürüm Google Drive’a aktarılmış olabilir ancak ARZ Studio işlemi tamamlayamadı/);});

test("same resumable session is probed and 308 resumes",()=>{assert.match(ui,/transfer\(recovery,true\)/);assert.match(ui,/Aynı Oturumdan Devam Et/);assert.match(uploader,/Content-Range":`bytes \*\/\$\{totalSize\}`/);assert.match(uploader,/response\.status===308/);assert.match(uploader,/offset=status\.offset/);});

test("server repair uses stable version identity and never name-only lookup",()=>{assert.match(recovery,/key='version_id'/);assert.match(recovery,/key='file_id'/);assert.match(recovery,/organization_id/);assert.match(recovery,/project_id/);assert.match(recovery,/external_parent_folder_id/);assert.match(recovery,/physicalVersionName/);assert.doesNotMatch(recovery,/name='|createDriveResumableSession|copyDriveFile/);});

test("legacy failed reservation can be promoted to recoverable and finalized",()=>{assert.match(recovery,/version\.status==="failed"/);assert.match(recovery,/status:"action_required"/);assert.match(recovery,/finalizeStudioFileVersion/);assert.match(detail,/version\.status==="action_required"\|\|version\.status==="failed"/);});

test("recovery cannot allocate a duplicate version or Drive object",()=>{assert.doesNotMatch(recovery,/studio_reserve_file_version|insert\(|createDriveResumableSession|copyDriveFile/);assert.match(repository,/status==="ready"&&value\.file\.current_version_id===versionId/);});

test("safe diagnostics contain booleans but no capability values",()=>{assert.match(ui,/STUDIO_VERSION_UPLOAD_DIAGNOSTIC/);assert.match(ui,/externalFileIdPresent/);assert.match(ui,/finalizeStarted/);assert.match(actions,/operation:"finalize_started"/);assert.doesNotMatch(ui,/console\.(info|log|warn)\([^\n]*(sessionUrl|externalFileId[,}])/);});
