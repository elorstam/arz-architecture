import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {GoogleDriveUploadUncertainError,queryGoogleDriveUploadStatus,uploadToGoogleDriveSession} from "../../lib/studio/files/uploads/google-drive-resumable-upload.ts";

const read=path=>readFileSync(path,"utf8");
const uploader=read("lib/studio/files/uploads/google-drive-resumable-upload.ts");
const recovery=read("lib/studio/files/uploads/google-drive-upload-recovery.ts");
const ui=read("components/studio/files/StudioFileUpload.tsx");
const actions=read("app/studio/(protected)/projects/[projectId]/files/actions.ts");
const originalFetch=globalThis.fetch;
const file={size:4,slice:(start,end)=>new Blob([new Uint8Array(end-start)])};
test.afterEach(()=>{globalThis.fetch=originalFetch;});

test("completed status query returns readable Drive metadata",async()=>{globalThis.fetch=async()=>new Response(JSON.stringify({id:"drive-file"}),{status:200,headers:{"content-type":"application/json"}});const result=await queryGoogleDriveUploadStatus("opaque-session",4);assert.deepEqual(result,{kind:"complete",metadata:{id:"drive-file"}});});

test("Drive may receive the file when browser PUT throws and status completes",async()=>{let calls=0;globalThis.fetch=async()=>{calls++;if(calls===1)throw new TypeError("Failed to fetch");return new Response(JSON.stringify({id:"existing-drive-file"}),{status:200});};const result=await uploadToGoogleDriveSession(file,"opaque-session",()=>undefined);assert.equal(result.id,"existing-drive-file");assert.equal(calls,2);});

test("308 status resumes from the acknowledged byte without creating a session",async()=>{let calls=0;globalThis.fetch=async(_url,init)=>{calls++;if(calls===1)return new Response(null,{status:308,headers:{range:"bytes=0-1"}});assert.equal(init.headers["Content-Range"],"bytes 2-3/4");return new Response(JSON.stringify({id:"resumed"}),{status:200});};const result=await uploadToGoogleDriveSession(file,"opaque-session",()=>undefined);assert.equal(result.id,"resumed");assert.equal(calls,2);});

test("expired session is explicit and never silently creates a replacement",async()=>{globalThis.fetch=async()=>new Response(null,{status:410});await assert.rejects(()=>uploadToGoogleDriveSession(file,"opaque-session",()=>undefined,undefined,true),/süresi doldu/);assert.doesNotMatch(uploader,/createDriveResumableSession/);});

test("unreadable completion stays recoverable instead of claiming failure",async()=>{globalThis.fetch=async()=>new Response("",{status:200});await assert.rejects(()=>uploadToGoogleDriveSession(file,"opaque-session",()=>undefined,undefined,true),GoogleDriveUploadUncertainError);assert.match(ui,/Dosya Google Drive’a aktarılmış olabilir ancak ARZ Studio işlemi tamamlayamadı/);assert.match(ui,/Yüklemeyi Doğrula ve Tamamla/);});

test("server repair is owner scoped and searches by stable reservation identity",()=>{assert.match(recovery,/membership\.role!=="owner"/);assert.match(recovery,/appProperties has \{ key='reservation_id'/);assert.match(recovery,/external_parent_folder_id/);assert.match(recovery,/candidates\.length!==1/);assert.match(recovery,/finalizeInitialStudioFileVersion/);assert.doesNotMatch(recovery,/createDriveResumableSession|copyDriveFile/);});

test("finalize retry is idempotent and diagnostics expose no session URL or token",()=>{assert.match(actions,/operation:"finalize_started"/);assert.match(actions,/recoverGoogleDriveFileUploadAction/);assert.doesNotMatch(uploader,/console\.(info|log|warn)\([^\n]*(sessionUrl|token)/);assert.doesNotMatch(recovery,/console\.(info|log|warn)/);});
