import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const read=path=>readFileSync(new URL(`../../${path}`,import.meta.url),"utf8");
const dashboard=read("components/studio/finance/StudioFinanceDashboard.tsx");
const financePage=read("components/studio/finance/StudioFinancePage.tsx");
const projectWorkspace=read("components/studio/finance/StudioProjectFinanceWorkspace.tsx");
const projectPage=read("app/studio/(protected)/projects/[projectId]/finance/page.tsx");

test("global finance overview uses dashboard-aligned KPI and operation grids",()=>{
  assert.match(financePage,/StudioPageHeader/);
  assert.match(dashboard,/min-\[1280px\]:grid-cols-6/);
  assert.match(dashboard,/min-\[1280px\]:grid-cols-\[1\.25fr_1fr_1fr\]/);
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
