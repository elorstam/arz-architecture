import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const read=path=>readFileSync(path,"utf8");
const finance=read("components/client-portal/ClientFinanceList.tsx");
const drawer=read("components/studio/ui/StudioUiPrimitives.tsx");
const financeCss=read("app/client/(portal)/finance/client-finance.css");
const projectTabs=read("components/studio/projects/StudioProjectTabs.tsx");
const sharedTabs=read("components/studio/StudioTabs.tsx");
const globals=read("app/globals.css");

test("Finance selection has exactly one non-null setter on the explicit row trigger",()=>{
 assert.equal((finance.match(/setSelectedPaymentId\(item\.id\)/g)??[]).length,1);
 assert.match(finance,/className="client-finance-row-trigger" onClick=\{\(\)=>setSelectedPaymentId\(item\.id\)\}/);
 assert.doesNotMatch(finance,/onMouse|onPointer|onFocus|onBlur|onScroll|onResize/);
});

test("blank areas and pointer movement cannot open or close the Finance drawer",()=>{
 assert.equal((finance.match(/setSelectedPaymentId\(null\)/g)??[]).length,1);
 assert.doesNotMatch(finance,/onClick=\{[^}]*setSelectedPaymentId[^}]*\}[^>]*className="client-finance-(list|surface|page)/);
 assert.match(drawer,/event\.target===event\.currentTarget\)onClose\(\)/);
});

test("Finance drawer is fixed right below the desktop Client header and mobile-safe",()=>{
 assert.match(financeCss,/\.client-portal \.studio-drawer\{top:72px;bottom:0;width:min\(100%,32rem\)\}/);
 assert.match(financeCss,/@media\(max-width:767px\)\{\.client-portal \.studio-drawer-backdrop,\.client-portal \.studio-drawer\{top:0\}/);
 assert.match(globals,/\.studio-root \.studio-drawer \{[^}]*position:fixed/);
});

test("project navigation has the final nine items and no Tasks entry",()=>{
 const labels=["Genel Bakış","Dosyalar","Render Arşivi","Harç ve Evraklar","Proje Aşamaları","Finans","Müşteri Erişimi","Revizyonlar","Takvim"];
 let cursor=-1;
 for(const label of labels){const next=projectTabs.indexOf(label);assert.ok(next>cursor,label);cursor=next;}
 assert.doesNotMatch(projectTabs,/Görevler/);
 assert.match(projectTabs,/\{label:"Takvim",icon:"calendar" as const,badge:"Yakında",disabled:true\}/);
});

test("desktop project tabs fit while smaller widths keep an inner scroll fallback",()=>{
 assert.match(globals,/@media \(min-width:1280px\) \{[^}]*studio-tabs__track--workspace-navigation[^}]*width:100%/);
 assert.match(globals,/studio-tab--workspace-navigation \{ min-height:3rem; flex:1 0 auto/);
 assert.match(sharedTabs,/overflow-x-auto overflow-y-hidden/);
 assert.doesNotMatch(sharedTabs,/shrink-0 items-center justify-center/);
});
