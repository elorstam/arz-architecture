import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const tabs=readFileSync("components/studio/projects/StudioProjectTabs.tsx","utf8");
const shared=readFileSync("components/studio/StudioTabs.tsx","utf8");
const css=readFileSync("app/globals.css","utf8");

test("project routes keep one shared icon navigation without changing hrefs",()=>{
  assert.match(tabs,/variant="workspace-navigation"/);
  for(const path of ["files","renders","official-processes","stages","finance"])assert.match(tabs,new RegExp(`/studio/projects/\\$\\{projectId\\}/${path}`));
  for(const icon of ["dashboard","folder","image","file-text","activity","wallet"])assert.match(tabs,new RegExp(`icon:"${icon}"`));
  assert.match(shared,/transitionTypes=\{workspaceNavigation\?\["studio-workspace"\]/);
  assert.match(shared,/aria-current/);
});

test("workspace navigation is sticky scrollable and motion-safe",()=>{
  assert.match(css,/studio-project-tabs-v2 \{[^}]*position:sticky[^}]*backdrop-filter:blur\(12px\)/);
  assert.match(css,/studio-tabs--workspace-navigation \{[^}]*overflow-x:auto/);
  assert.match(css,/studio-tab--workspace-navigation\.studio-tab-active \{[^}]*background:var\(--studio-navy\)[^}]*color:#fff/);
  assert.match(css,/@keyframes studio-workspace-enter/);
  assert.match(css,/prefers-reduced-motion:reduce/);
});

test("future project sections share the final navigation row",()=>{
  for(const label of ["Revizyonlar","Takvim","Müşteri"])assert.match(tabs,new RegExp(label));
  assert.doesNotMatch(tabs,/Görevler/);
  assert.doesNotMatch(tabs,/studio-project-tabs-future/);
  assert.equal((tabs.match(/badge:"Yakında"/g)??[]).length,2);
  assert.equal((tabs.match(/disabled:true/g)??[]).length,2);
  assert.match(shared,/studio-tab__badge/);
  assert.match(shared,/aria-disabled="true"/);
});
