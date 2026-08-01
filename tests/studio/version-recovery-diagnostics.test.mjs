import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=path=>readFileSync(path,"utf8");
const diagnostics=read("lib/studio/files/uploads/version-recovery-diagnostics.ts");
const recovery=read("lib/studio/files/uploads/google-drive-version-upload-recovery.ts");
const repository=read("lib/studio/files/versions/version-repository.ts");
const actions=read("app/studio/(protected)/projects/[projectId]/files/actions.ts");

test("recovery emits every external verification stage",()=>{
  for(const step of ["reservation loaded","Drive search started","Drive object found","appProperties verified","MIME verified","size verified","parent verified","finalize RPC called"]){
    assert.ok(recovery.includes(`step="${step}"`)||recovery.includes(`step:"${step}"`),`missing diagnostic step: ${step}`);
  }
});

test("finalize emits RPC, pointer, sync and commit stages",()=>{
  for(const step of ["finalize RPC called","finalize RPC completed","current pointer updated","sync_status updated","transaction committed"]){
    assert.ok(repository.includes(`step:"${step}"`),`missing finalize diagnostic step: ${step}`);
  }
  assert.match(repository,/if\(error\).*logVersionRecovery\(\{versionId,step:"finalize RPC completed",success:false,error,rpc:"studio_finalize_file_version"\}/s);
});

test("action boundary reports recovery failure without exposing raw provider data",()=>{
  assert.match(actions,/step:"recovery action started"/);
  assert.match(actions,/step:"recovery action completed",success:false,error/);
  assert.match(recovery,/catch\(error\).*logVersionRecovery.*throw error/s);
});

test("development diagnostic has the safe SQL contract",()=>{
  assert.match(diagnostics,/process\.env\.NODE_ENV!=="development"/);
  for(const field of ["versionId","step","success","sqlState","constraint","rpc","message"]){assert.match(diagnostics,new RegExp(`\\b${field}\\b`));}
  assert.doesNotMatch(diagnostics,/externalFileId|sessionUrl|accessToken|refreshToken|clientSecret/);
  assert.match(diagnostics,/replace\(\/https\?:/);
  assert.match(diagnostics,/replace\(\/Bearer/);
});
