import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

test("project finance tab preserves project scope and active state",async()=>{
 const [tabs,page]=await Promise.all([readFile("components/studio/projects/StudioProjectTabs.tsx","utf8"),readFile("components/studio/finance/StudioFinancePage.tsx","utf8")]);
 assert.match(tabs,/href: `\/studio\/projects\/\$\{projectId\}\/finance`/);
 assert.match(page,/StudioProjectTabs projectId=\{project\.id\} active="finance"/);
 assert.match(page,/getFinanceDashboard\(projectId\)/);
});

test("global finance remains a separate sidebar destination",async()=>{
 const sidebar=await readFile("components/studio/StudioSidebar.tsx","utf8");
 assert.match(sidebar,/href: "\/studio\/finance"/);
});
