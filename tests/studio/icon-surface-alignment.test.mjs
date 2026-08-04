import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const component=readFileSync("components/studio/ui/StudioIconSurface.tsx","utf8");
const dashboard=readFileSync("components/studio/dashboard/StudioDashboardIconSurface.tsx","utf8");
const css=readFileSync("app/globals.css","utf8");

test("StudioIconSurface owns one centered icon wrapper",()=>{
 assert.match(component,/studio-icon-surface__content/);
 assert.match(css,/studio-icon-surface \{[^}]*display:inline-flex[^}]*flex-shrink:0[^}]*align-items:center[^}]*justify-content:center[^}]*overflow:hidden/);
 assert.match(css,/studio-icon-surface__content \{[^}]*display:flex[^}]*width:100%[^}]*height:100%[^}]*align-items:center[^}]*justify-content:center/);
});

test("dashboard Lucide surfaces use the same exact center contract",()=>{
 assert.match(dashboard,/StudioIconSurface/);
 assert.match(dashboard,/tone=\{tones\[tone\]\}/);
 assert.match(dashboard,/studio-icon-surface__icon block size-5 shrink-0/);
 assert.match(dashboard,/strokeWidth=\{2\.2\}/);
 assert.doesNotMatch(dashboard,/bg-gradient-to-br|from-\[#/);
});

test("surface SVG geometry has no positional correction",()=>{
 assert.match(css,/studio-icon-surface__icon \{[^}]*position:static[^}]*display:block[^}]*width:1\.25rem[^}]*height:1\.25rem[^}]*margin:0[^}]*transform:none[^}]*stroke-width:2\.2/);
 assert.doesNotMatch(css,/studio-icon-surface--(?:sm|md|lg|xl) \.studio-icon-surface__icon/);
 assert.match(css,/stroke-linecap:round/);
 assert.match(css,/stroke-linejoin:round/);
});

test("files KPI variant has an exact 48 to 20 pixel center stack",()=>{
 const files=readFileSync("components/studio/files/StudioProjectFilesPage.tsx","utf8");
 assert.match(files,/size="kpi" className="shrink-0"/);
 assert.doesNotMatch(files,/size="kpi" className="self-(?:start|center)"/);
 assert.match(component,/inline-grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl leading-none/);
 assert.match(component,/grid size-6 shrink-0 place-items-center leading-none/);
 assert.match(component,/block size-5 shrink-0/);
 assert.match(css,/studio-icon-surface--kpi \{[^}]*display:inline-grid[^}]*width:3rem[^}]*height:3rem[^}]*place-items:center[^}]*padding:0/);
 assert.match(css,/studio-icon-surface--kpi \.studio-icon-surface__content \{[^}]*display:grid[^}]*width:1\.5rem[^}]*height:1\.5rem[^}]*place-items:center/);
 assert.match(css,/studio-icon-surface--kpi \.studio-icon-surface__icon \{[^}]*width:1\.25rem[^}]*height:1\.25rem[^}]*margin:0[^}]*padding:0[^}]*transform:none[^}]*vertical-align:middle[^}]*stroke-width:2\.2/);
});
