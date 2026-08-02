import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const read=path=>readFile(path,"utf8");

test("project profitability uses one server aggregate source",async()=>{
 const [repo,dashboard,widget]=await Promise.all([read("lib/studio/finance/finance-repository.ts"),read("components/studio/finance/StudioFinanceDashboard.tsx"),read("components/studio/dashboard/StudioFinanceSummary.tsx")]);
 assert.match(repo,/paidExpense/);assert.match(repo,/pendingExpense/);assert.match(repo,/cashContribution/);assert.match(repo,/grossProfit/);assert.match(repo,/averageMargin/);assert.match(dashboard,/totalExpected/);assert.match(widget,/getFinanceDashboard|FinanceDashboard/);
});

test("profitability formulas preserve negative profit and exclude cancelled expenses",async()=>{
 const repo=await read("lib/studio/finance/finance-repository.ts");assert.match(repo,/status!=="cancelled"/);assert.match(repo,/profit=expected-expense/);assert.match(repo,/expected>0\?profit\/expected\*100:null/);assert.match(repo,/collected-paidExpense/);
});

test("paid expense support is additive and rollback-safe",async()=>{
 const [sql,rollback]=await Promise.all([read("supabase/migrations/024_project_profitability_paid_expenses.sql"),read("supabase/migrations/024_project_profitability_paid_expenses.rollback.sql")]);for(const text of[sql,rollback]){assert.equal((text.match(/\bbegin;/gi)||[]).length,1);assert.equal((text.match(/\bcommit;/gi)||[]).length,1)}assert.match(sql,/add column if not exists paid_amount/);assert.match(sql,/create index if not exists/);assert.match(rollback,/drop column if exists paid_amount/);assert.doesNotMatch(sql,/delete from|drop table/i);
});

test("main dashboard and project finance route reuse the finance aggregate",async()=>{
 const [page,route]=await Promise.all([read("app/studio/(protected)/page.tsx"),read("app/studio/(protected)/projects/[projectId]/finance/page.tsx")]);assert.match(page,/getFinanceDashboard/);assert.match(page,/finance=\{finance\}/);assert.match(route,/projectId/);assert.match(route,/StudioProjectFinanceWorkspace/);
});
