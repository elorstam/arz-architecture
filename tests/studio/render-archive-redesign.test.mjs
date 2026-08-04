import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const page=readFileSync("app/studio/(protected)/projects/[projectId]/renders/page.tsx","utf8");
const gallery=readFileSync("components/studio/renders/StudioRenderArchive.tsx","utf8");
const css=readFileSync("app/globals.css","utf8");

test("render archive uses the shared Studio workspace composition",()=>{
 assert.match(page,/StudioPageHeader/);
 assert.match(page,/StudioProjectTabs/);
 assert.match(page,/StudioCard/);
 assert.match(page,/StudioIconSurface/);
 assert.match(page,/studio-render-workspace/);
 assert.doesNotMatch(page,/#fbfaf7|#fff7e8|#fdf7ec/i);
});

test("render header and filter avoid legacy warm surfaces",()=>{
 assert.match(page,/back=\{<StudioIconSurface tone="blue" size="sm"/);
 assert.match(page,/<Images className="block size-5" strokeWidth=\{2\.2\}/);
 assert.doesNotMatch(page,/title="Render Arşivi"[^\n]*icon="image"/);
 assert.match(page,/studioButtonClass\("secondary","sm","studio-render-filter-button"\)/);
 assert.match(page,/<SlidersHorizontal className="block size-4" strokeWidth=\{2\.2\}/);
 assert.match(gallery,/StudioIconSurface icon="image" tone="blue" size="sm"/);
 assert.match(css,/studio-render-workspace \.studio-render-filter-button \{[^}]*border-color:var\(--studio-border\)[^}]*background:var\(--studio-surface\)/);
 assert.match(css,/studio-render-workspace \.studio-render-filter-button:hover \{[^}]*background:var\(--studio-surface-muted\)/);
});

test("render KPIs are real-data summaries with eight responsive cards",()=>{
 for(const label of ["Toplam Render","İç Mekan","Dış Cephe","Gece Renderı","Gündüz Renderı","Sunulan","Favoriler","Toplam Depolama"])assert.match(page,new RegExp(label));
 assert.match(page,/archive\.renders\.filter\(item=>item\.presentedAt\)/);
 assert.match(page,/archive\.renders\.filter\(item=>item\.isFavorite\)/);
 assert.match(page,/reduce\(\(sum,item\)=>sum\+item\.file\.fileSize/);
 assert.match(css,/studio-render-metrics \{[^}]*repeat\(8,minmax\(0,1fr\)\)/);
 assert.match(css,/@media \(max-width:1279px\)[^\n]*studio-render-metrics[^\n]*repeat\(4,minmax\(0,1fr\)\)/);
});

test("gallery supports grid masonry hover operations and accessible selection",()=>{
 assert.match(gallery,/useState<"grid"\|"masonry">\("grid"\)/);
 assert.match(gallery,/aria-label="Galeri görünümü"/);
 assert.match(gallery,/aria-pressed=\{view==="grid"\}/);
 assert.match(gallery,/studio-render-card__overlay/);
 assert.match(gallery,/renderını seç/);
 assert.match(gallery,/sm:grid-cols-2 xl:grid-cols-3/);
 assert.match(css,/studio-render-masonry \{[^}]*columns:3 300px/);
});

test("render detail uses the shared drawer and existing routes",()=>{
 assert.match(gallery,/StudioDrawer open/);
 assert.match(gallery,/Versiyon Geçmişi/);
 assert.match(gallery,/Yeni Revizyon/);
 assert.match(gallery,/files\/\$\{render\.fileId\}\/download/);
 assert.match(gallery,/renders\/\$\{render\.id\}/);
 assert.match(gallery,/StudioEmptyState/);
});

test("existing render operations remain wired",()=>{
 for(const action of ["favoriteRenderFilesAction","setHeroRenderAction","setRenderFlagsAction","updateRenderAction","sendRenderWhatsAppAction","sendRenderBulkWhatsAppAction"])assert.match(gallery,new RegExp(action));
 assert.match(page,/attachRenderFileAction/);
 assert.match(page,/createRenderCategoryAction/);
});
