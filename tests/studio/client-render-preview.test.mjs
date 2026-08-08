import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const read=path=>readFileSync(path,"utf8");
const preview=read("lib/client-portal/renders/client-render-preview.ts");
const route=read("app/client/(portal)/renders/[renderId]/preview/route.ts");
const gallery=read("components/client-portal/ClientRenderGallery.tsx");
const projection=read("supabase/migrations/035_client_portal_security_foundation.sql");

test("authorized preview starts with the canonical client render projection",()=>{
 assert.match(preview,/getClientPortalContext\(\)/);
 assert.match(preview,/client_portal_list_renders/);
 assert.match(preview,/item\.id===renderId/);
 assert.match(preview,/render\?\.logical_file_id/);
 assert.match(projection,/studio_client_can_access_project\(auth\.uid\(\),p_project_id\)/);
 assert.match(projection,/r\.is_client_visible and r\.archived_at is null/);
});

test("project and organization identities are bound before privileged file access",()=>{
 assert.match(preview,/fileId:render\.logical_file_id/);
 assert.match(preview,/\.eq\("id",authorized\.fileId\)/);
 assert.match(preview,/\.eq\("project_id",authorized\.projectId\)/);
 assert.match(preview,/\.eq\("organization_id",organizationId\)/);
 assert.match(preview,/\.eq\("status","ready"\)/);
 assert.match(preview,/\.eq\("is_archived",false\)/);
});

test("revoked passive and cross-project access cannot reach a render",()=>{
 assert.match(projection,/a\.revoked_at is null and m\.status='active' and m\.role='client'/);
 assert.match(preview,/for\(const project of context\.projects\)/);
 assert.doesNotMatch(preview,/studio_project_renders|\.from\("studio_project_renders"\)/);
});

test("only a ready current raster image version can be streamed",()=>{
 assert.match(preview,/SAFE_RENDER_MIME_TYPES/);
 assert.doesNotMatch(preview,/image\/svg\+xml/);
 assert.match(preview,/\.eq\("id",file\.current_version_id\)/);
 assert.match(preview,/\.eq\("is_current",true\)/);
 assert.match(preview,/SAFE_RENDER_MIME_TYPES\.has\(version\.mime_type\)/);
});

test("Supabase and Drive providers retain private server-side verification",()=>{
 assert.match(preview,/createSignedUrl\(version\.storage_path,STUDIO_FILE_SIGNED_URL_SECONDS\)/);
 assert.match(preview,/fetch\(signed\.signedUrl,\{cache:"no-store",redirect:"error"\}\)/);
 assert.match(preview,/googleDriveStorageProvider\.verifyFileExists/);
 assert.match(preview,/metadata\.trashed/);
 assert.match(preview,/metadata\.parents\.includes\(version\.external_parent_folder_id\)/);
 assert.match(preview,/metadata\.mimeType!==version\.mime_type/);
 assert.doesNotMatch(route,/signedUrl|storage_path|SUPABASE_SERVICE_ROLE_KEY|service.role|getPublicUrl/i);
});

test("invalid and unauthorized identifiers are enumeration safe",()=>{
 assert.match(preview,/if\(!UUID\.test\(renderId\)\)throw new ClientRenderPreviewError\(404\)/);
 assert.match(route,/status===404\?"Render önizlemesi bulunamadı veya erişim reddedildi\./);
 assert.match(route,/Cache-Control":"private, no-store"/);
 assert.match(route,/X-Content-Type-Options":"nosniff"/);
 assert.match(route,/Cross-Origin-Resource-Policy":"same-origin"/);
});

test("gallery keeps real RPC records and replaces broken images with the existing visual fallback",()=>{
 assert.match(gallery,/renders\.filter/);
 assert.match(gallery,/render\.logical_file_id/);
 assert.match(gallery,/\/client\/renders\/\$\{encodeURIComponent\(render\.id\)\}\/preview/);
 assert.match(gallery,/onError=\{\(\)=>setFailed\(true\)\}/);
 assert.match(gallery,/StudioIconSurface/);
 assert.doesNotMatch(gallery,/mock|placeholder\.com|data:image|object\/public|getPublicUrl/i);
});
