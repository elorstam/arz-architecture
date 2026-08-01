import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=path=>readFileSync(path,"utf8");
const preview=read("components/studio/files/preview/StudioFilePreview.tsx");
const image=read("components/studio/files/preview/StudioImagePreview.tsx");
const pdf=read("components/studio/files/preview/StudioPdfPreview.tsx");
const unsupported=read("components/studio/files/preview/StudioUnsupportedPreview.tsx");
const toolbar=read("components/studio/files/preview/StudioPreviewToolbar.tsx");
const utils=read("lib/studio/files/preview/preview-utils.ts");
const fileRoute=read("app/studio/(protected)/projects/[projectId]/files/[fileId]/download/route.ts");
const versionRoute=read("app/studio/(protected)/projects/[projectId]/files/[fileId]/versions/[versionId]/download/route.ts");
const detail=read("components/studio/files/StudioFileDetail.tsx");

test("only approved image and PDF formats receive previews",()=>{for(const extension of ["jpg","jpeg","png","webp","svg"]){assert.ok(read("lib/studio/files/preview/preview-types.ts").includes(`"${extension}"`));}assert.match(utils,/normalized==="pdf"/);for(const extension of ["dwg","skp","ifc","zip","rvt"]){assert.doesNotMatch(utils,new RegExp(`normalized==="${extension}"`));}});
test("image preview exposes lazy loading zoom fit loading and error states",()=>{assert.match(image,/loading="lazy"/);assert.match(image,/StudioPreviewToolbar/);assert.match(image,/onLoad/);assert.match(image,/onError/);assert.match(image,/role="alert"/);});
test("PDF preview is dynamically loaded and supports page zoom and fit",()=>{assert.match(preview,/dynamic\(\(\)=>import\("\.\/StudioPdfPreview"\)/);assert.match(pdf,/#page=\$\{page\}&zoom=/);assert.match(pdf,/page-width/);assert.match(pdf,/page-fit/);assert.match(toolbar,/PDF sayfa numarası/);});
test("unsupported preview preserves secure download",()=>{assert.match(unsupported,/Dosya önizlemesi desteklenmiyor/);assert.match(unsupported,/downloadUrl/);assert.match(unsupported,/Dosyayı İndir/);});
test("version switching changes both preview and download source",()=>{assert.match(detail,/selectedVersionId/);assert.match(preview,/onSelectVersion\(event\.target\.value\)/);assert.match(preview,/buildStudioPreviewUrl\(file\.projectId,file\.id,selected\?\.id\)/);assert.match(preview,/previewUrl\.replace\("\?preview=1",""\)/);});
test("authenticated routes stream inline without public sharing",()=>{for(const route of [fileRoute,versionRoute]){assert.match(route,/searchParams\.get\("preview"\)==="1"/);assert.match(route,/inline/);assert.match(route,/Cache-Control":"private, no-store"/);assert.match(route,/new Response\(response\.body/);assert.doesNotMatch(route,/anyone|permissions|webContentLink|public/i);}});
test("inline SVG is sandboxed against same-origin script execution",()=>{for(const route of [fileRoute,versionRoute]){assert.match(route,/image\/svg/);assert.match(route,/Content-Security-Policy/);assert.match(route,/default-src 'none'; sandbox/);}});
test("legacy signed preview is proxied and never redirected to browser",()=>{assert.match(fileRoute,/if\(preview\).*fetch\(result\.url/s);assert.match(versionRoute,/if\(preview\).*fetch\(result\.url/s);});
test("owner and member use the same repository authorization boundary",()=>{assert.match(fileRoute,/createStudioProjectFileDownload\(projectId,fileId\)/);assert.match(versionRoute,/createStudioFileVersionDownload\(projectId,fileId,versionId\)/);assert.doesNotMatch(preview,/token|external_file_id|organizationId/);});
test("preview reserves stable responsive space and accessible states",()=>{assert.match(preview,/xl:grid-cols/);assert.match(image,/min-h-\[360px\]/);assert.match(pdf,/min-h-\[440px\]/);assert.match(toolbar,/role="toolbar"/);assert.match(image,/aria-busy/);assert.match(pdf,/title=\{`\$\{name\} PDF önizlemesi`\}/);});
test("one renderer owns each selected source without duplicate fetch calls",()=>{assert.equal((image.match(/src=\{src\}/g)||[]).length,1);assert.equal((pdf.match(/src=\{viewerUrl\}/g)||[]).length,1);assert.doesNotMatch(preview,/fetch\(/);});
