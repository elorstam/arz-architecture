import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const read=path=>readFileSync(new URL(`../../${path}`,import.meta.url),"utf8");
const dashboard=read("components/studio/finance/StudioFinanceDashboard.tsx");
const financePage=read("components/studio/finance/StudioFinancePage.tsx");
const projectWorkspace=read("components/studio/finance/StudioProjectFinanceWorkspace.tsx");
const projectPage=read("app/studio/(protected)/projects/[projectId]/finance/page.tsx");
const studioShell=read("components/studio/StudioShell.tsx");
const globalCss=read("app/globals.css");

test("global finance overview uses dashboard-aligned KPI and operation grids",()=>{
  assert.match(financePage,/StudioPageHeader/);
  assert.match(dashboard,/min-\[1280px\]:grid-cols-6/);
  assert.match(dashboard,/grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3/);
  assert.match(dashboard,/\[&>\*\]:h-\[360px\]/);
  assert.doesNotMatch(dashboard,/auto-rows-\[360px\]/);
  assert.doesNotMatch(dashboard,/min-\[1280px\]:grid-cols-3/);
  assert.match(dashboard,/StudioActivityIcon variant="finance"/);
  assert.match(dashboard,/Proje Kârlılığı/);
  assert.match(dashboard,/Finans Hareketleri/);
});

test("finance forms keep existing actions inside compact collapsible surfaces",()=>{
  assert.match(dashboard,/createFinanceEntryAction/);
  assert.match(dashboard,/createFinancePaymentAction/);
  assert.match(dashboard,/<details/);
  assert.match(projectWorkspace,/saveProjectFinanceProfileAction/);
  assert.match(projectWorkspace,/createProjectExpenseAction/);
  assert.match(projectWorkspace,/<details/);
  assert.match(projectPage,/StudioVisualizationExpenseForm/);
});

test("global and project finance contexts remain explicit",()=>{
  assert.match(financePage,/Ofis Finans Merkezi/);
  assert.match(projectPage,/data\.project\.name/);
  assert.match(projectWorkspace,/Proje finans özeti/);
});

test("Studio workspace uses the neutral dashboard surface palette",()=>{
  assert.match(studioShell,/bg-\[#f7f9fc\]/);
  assert.match(globalCss,/--studio-bg: #f7f9fc/);
  assert.match(globalCss,/--studio-surface-muted: #f3f6fa/);
  assert.match(globalCss,/--studio-border: #e3e9ef/);
  assert.match(globalCss,/\.studio-root \.studio-empty-v2 \{[^}]*border:1px dashed #d9e2ec;[^}]*background:var\(--studio-workspace\)/);
  assert.match(globalCss,/\.studio-root \.studio-empty-icon \{[^}]*box-shadow:/);
  assert.match(globalCss,/\.studio-root \.studio-empty-v2 h3 \{[^}]*color:#1e293b;[^}]*font-weight:600/);
  assert.match(globalCss,/\.studio-root \.studio-empty-v2 p \{[^}]*color:#64748b/);
});
