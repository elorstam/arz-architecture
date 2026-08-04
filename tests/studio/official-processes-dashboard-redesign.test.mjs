import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const read=path=>readFileSync(path,"utf8");
const page=read("app/studio/(protected)/projects/[projectId]/official-processes/page.tsx");
const workspace=read("components/studio/official-processes/StudioOfficialProcessesWorkspace.tsx");
const kpi=read("components/studio/StudioDesignSystem.tsx");

test("official processes page uses the shared Studio operation workspace",()=>{
 for(const component of ["StudioPageHeader","StudioTabs","StudioEmptyState","StudioOfficialProcessesWorkspace"])assert.match(page,new RegExp(component));
 assert.doesNotMatch(page,/Harç Milestone/);
 assert.doesNotMatch(page,/bg-\[#faf8f3\]|bg-\[#f7f5f0\]|border-\[#d8d4ca\]/);
});

test("six real-data KPI cards reuse StudioKpiCard in one desktop row",()=>{
 for(const label of ["Bekleyen Harç","Bekleyen Evrak","Geciken Süreç","Bu Ay Tahsil Edilen","Bu Ay Başvuru","Tamamlanan Süreç"])assert.match(workspace,new RegExp(label));
 assert.match(workspace,/min-\[1280px\]:grid-cols-6/);
 assert.match(workspace,/StudioKpiCard/);
 assert.match(kpi,/tone\?:StudioIconTone/);
});

test("operation panels and activity history use shared Studio primitives",()=>{
 for(const title of ["Harç Süreçleri","Resmî Evraklar","Yaklaşan Süreçler","İşlem Geçmişi"])assert.match(workspace,new RegExp(title));
 assert.match(workspace,/xl:grid-cols-\[1\.35fr_1fr_1fr\]/);
 for(const component of ["StudioCard","StudioSectionHeader","StudioBadge","StudioActivityIcon","StudioEmptyState","StudioIconSurface"])assert.match(workspace,new RegExp(component));
 assert.match(workspace,/h-\[430px\]/);
});
