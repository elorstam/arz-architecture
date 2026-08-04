import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const page=readFileSync("components/studio/files/StudioProjectFilesPage.tsx","utf8");
const browser=readFileSync("components/studio/files/StudioVisualFileBrowser.tsx","utf8");
const icon=readFileSync("components/studio/files/StudioFileTypeIcon.tsx","utf8");
const css=readFileSync("app/globals.css","utf8");

test("files workspace uses real summaries and dashboard surfaces",()=>{
 assert.match(page,/StudioPageHeader/);
 assert.match(page,/workspace\.summary\.fileCount/);
 assert.match(page,/workspace\.summary\.folderCount/);
 assert.match(page,/workspace\.summary\.storageLabel/);
 assert.match(page,/StudioIconSurface/);
 assert.match(page,/studio-files-metrics/);
 assert.doesNotMatch(page,/#faf8f3|#fbfaf7/);
});

test("file KPI content uses the dashboard vertical stack",()=>{
 assert.match(page,/studio-files-metric group relative flex h-full min-w-0 flex-col items-start p-4/);
 assert.match(page,/size="kpi" className="shrink-0"/);
 assert.match(page,/studio-files-metric__value/);
 assert.match(page,/studio-files-metric__title/);
 assert.match(page,/studio-files-metric__description/);
 assert.match(page,/studio-files-metric__arrow"/);
 assert.doesNotMatch(page,/studio-files-metric[^\n]*items-center|size="kpi" className="self-(?:start|center)/);
 assert.match(css,/studio-files-metric \{[^}]*flex-direction:column[^}]*align-items:flex-start/);
 assert.match(css,/studio-files-metric__arrow \{[^}]*position:absolute[^}]*right:1rem[^}]*bottom:1rem/);
});

test("file KPI glyphs use one semantic optical icon map",()=>{
 assert.match(page,/const FILE_KPI_ICON_MAP=/);
 assert.match(page,/totalFiles:\{Icon:FileStack,tone:"blue",iconClassName:""\}/);
 assert.match(page,/folders:\{Icon:Folder,tone:"orange",iconClassName:""\}/);
 assert.match(page,/pdf:\{Icon:FileText,tone:"red",iconClassName:""\}/);
 assert.match(page,/dwg:\{Icon:DraftingCompass,tone:"blue",iconClassName:""\}/);
 assert.match(page,/skp:\{Icon:Cuboid,tone:"purple",iconClassName:""\}/);
 assert.match(page,/render:\{Icon:Images,tone:"orange",iconClassName:""\}/);
 assert.match(page,/totalSize:\{Icon:HardDrive,tone:"slate",iconClassName:""\}/);
 assert.match(page,/config\.iconClassName/);
 assert.doesNotMatch(page,/iconKey:"dwg"[^\n]*revision|iconKey:"totalSize"[^\n]*archive/);
});

test("file browser preserves grid list routes and quick detail drawer",()=>{
 assert.match(browser,/type View="grid"\|"list"/);
 assert.match(browser,/localStorage\.setItem/);
 assert.match(browser,/StudioDrawer/);
 assert.match(browser,/setSelectedFile\(file\)/);
 assert.match(browser,/files\/\$\{selectedFile\.id\}\/download/);
 assert.match(browser,/version-upload-title/);
});

test("premium file type language and responsive grids are shared",()=>{
 for(const extension of ["pdf","dwg","skp","jpg","png","zip","docx","xlsx","mp4"])assert.match(icon,new RegExp(`${extension}:`));
 assert.match(icon,/StudioIconSurface/);
 assert.match(css,/studio-file-grid[^\n]*repeat\(4,minmax\(0,1fr\)\)/);
 assert.match(css,/@media \(max-width:639px\)[^\n]*studio-file-grid[^\n]*grid-template-columns:1fr/);
});
