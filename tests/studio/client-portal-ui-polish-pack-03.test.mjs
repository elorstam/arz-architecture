import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const read=(path)=>readFileSync(path,"utf8");
const globals=read("app/globals.css");
const clientCss=read("app/client/client-portal.css");
const filesPage=read("app/studio/(protected)/projects/[projectId]/files/page.tsx");
const fileDetailLayout=read("app/studio/(protected)/projects/[projectId]/files/[fileId]/layout.tsx");
const projectTabs=read("components/studio/projects/StudioProjectTabs.tsx");
const clientNav=read("components/client-portal/ClientPortalNavigation.tsx");

test("workspace navigation keeps the finance-size type while compacting layout",()=>{
  assert.match(globals,/@media \(min-width:1280px\)[^}]*workspace-navigation[\s\S]*?font-size:\.8125rem/);
  assert.doesNotMatch(globals,/studio-tab--workspace-navigation[^}]*font-size:\.7rem/);
  assert.match(globals,/overflow-x:auto/);
});

test("studio and client navigation share the soft dark-gray active token",()=>{
  assert.match(globals,/--studio-sidebar-bg:\s*#111923/);
  assert.match(globals,/--studio-action-primary:\s*var\(--studio-sidebar-bg\)/);
  assert.match(globals,/studio-tab--workspace-navigation\.studio-tab-active[^}]*background:var\(--studio-action-primary\)/);
  assert.match(clientNav,/variant="workspace-navigation"/);
  assert.match(clientCss,/client-project-navigation \.studio-tab--workspace-navigation \{ font-size:\.8125rem/);
});

test("client portal raises scoped supporting typography",()=>{
  assert.match(clientCss,/\.client-portal :where\(\.studio-page-description,\.studio-section-header p,\.studio-helper-text\)/);
  assert.match(clientCss,/\.client-portal \.studio-empty-v2 p \{ font-size:14px!important/);
  assert.match(clientCss,/\.client-portal :where\(\.client-project-facts dt,\.client-progress-title p\)/);
});

test("project files and nested detail pages inherit the shared Files navigation",()=>{
  assert.match(filesPage,/StudioProjectTabs projectId=\{projectId\} active="files"/);
  assert.match(fileDetailLayout,/StudioProjectTabs projectId=\{projectId\} active="files"/);
  assert.match(fileDetailLayout,/\{children\}/);
  assert.doesNotMatch(projectTabs,/Görevler/);
  assert.match(projectTabs,/label:"Takvim"/);
});
