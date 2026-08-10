import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const read=path=>readFileSync(path,"utf8");
const quickCard=read("components/studio/quick-access/StudioQuickAccessCard.tsx");
const primitives=read("components/studio/ui/StudioUiPrimitives.tsx");
const globals=read("app/globals.css");
const tabs=read("components/studio/StudioTabs.tsx");
const projectTabs=read("components/studio/projects/StudioProjectTabs.tsx");

test("Quick Access cards use the canonical neutral Studio icon surface",()=>{
 assert.match(quickCard,/StudioIconSurface icon=\{iconFor\(item\.entityType\)\}/);
 assert.doesNotMatch(quickCard,/bg-\[#f2eee5\]|text-\[#8d7548\]|bg-amber|bg-stone|bg-yellow/);
 assert.match(quickCard,/border-\[#e3e9ef\]/);
});

test("drawers use a stable non-blurred compositing layer",()=>{
 assert.match(primitives,/studio-modal-backdrop studio-drawer-backdrop/);
 assert.match(globals,/\.studio-root \.studio-drawer-backdrop \{[^}]*backdrop-filter:none;[^}]*contain:layout paint;/);
 assert.match(globals,/\.studio-root \.studio-drawer \{[^}]*position:fixed;[^}]*transform:translateZ\(0\);/);
 assert.doesNotMatch(globals,/\.studio-root \.studio-drawer-backdrop \{[^}]*transition:/);
});

test("shared project navigation contains its rail without growing the page canvas",()=>{
 assert.match(projectTabs,/StudioTabs items=\{links\}/);
 assert.match(globals,/\.studio-root \.studio-project-tabs-v2 \{[^}]*max-width:100%;[^}]*overflow:hidden;/);
 assert.match(tabs,/max-w-full min-w-0 touch-pan-x overflow-x-auto overflow-y-hidden overscroll-x-contain/);
});

test("active project tab becomes visible without vertical or repeated smooth animation",()=>{
 assert.match(tabs,/activeItemRef/);
 assert.match(tabs,/viewport\.scrollBy\(\{left:/);
 assert.match(tabs,/behavior:"auto"/);
 assert.doesNotMatch(tabs,/scrollIntoView/);
});
