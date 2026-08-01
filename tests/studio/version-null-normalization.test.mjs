import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const normalization=readFileSync("lib/studio/files/versions/version-text-normalization.ts","utf8");
const naming=readFileSync("lib/studio/files/versions/version-naming.ts","utf8");
const recovery=readFileSync("lib/studio/files/uploads/google-drive-version-upload-recovery.ts","utf8");

test("nullable revision metadata remains legitimately optional",()=>{
 assert.match(normalization,/if\(value==null\)return null/);
 for(const field of ["revision_code","revision_note","revision_title"]){assert.ok(field.length>0);}
 assert.match(naming,/normalizeOptionalText\(revisionCode,"revision_code"/);
});

test("null revision code no longer reaches String.normalize",()=>{
 assert.match(naming,/revisionCode:unknown=null/);
 assert.match(naming,/optionalRevision\?safeMarker\(optionalRevision\):""/);
 assert.doesNotMatch(naming,/safeMarker\(revisionCode\)/);
});

test("required historical identity fields return a safe typed error",()=>{
 assert.match(normalization,/typeof value!=="string".*invalidText/s);
 assert.match(normalization,/if\(!normalized\)return invalidText/);
 assert.match(normalization,/new StudioFileError\("invalid_file"/);
 for(const field of ["original_file_name","mime_type","drive_name"]){assert.ok(recovery.includes(`"${field}"`));}
});

test("valid Unicode text is normalized as NFC before physical marker sanitization",()=>{
 assert.match(normalization,/value\.normalize\("NFC"\)\.trim\(\)/);
 assert.match(naming,/value\.normalize\("NFD"\)/);
 assert.match(naming,/return`\$\{base\}__V\$\{versionNumber\}/);
});

test("recovery validates required DB and Drive identity before comparison",()=>{
 assert.match(recovery,/normalizeRequiredText\(version\.original_file_name,"original_file_name"/);
 assert.match(recovery,/normalizeRequiredText\(version\.mime_type,"mime_type"/);
 assert.match(recovery,/normalizeRequiredText\(candidate\.name,"drive_name"/);
 assert.match(recovery,/physicalVersionName\(logicalName,version\.version_number,version\.revision_code\)/);
});

test("normalization diagnostic contains field and null state but no raw value",()=>{
 assert.match(normalization,/operation,fieldName,valueWasNull:value==null,errorCode:"invalid_version_text"/);
 assert.doesNotMatch(normalization,/console\.error\([^\n]*\bvalue\b[},]/);
});
