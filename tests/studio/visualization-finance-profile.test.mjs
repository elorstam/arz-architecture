import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const read=path=>readFile(path,"utf8");

test("visualization finance is server-derived and reuses project finance",async()=>{
 const[route,repo,ui]=await Promise.all([read("app/studio/(protected)/projects/[projectId]/finance/page.tsx"),read("lib/studio/finance/project-finance-repository.ts"),read("components/studio/finance/StudioVisualizationFinanceProfile.tsx")]);
 assert.match(repo,/visualizationProject/);assert.match(route,/data\.isVisualization/);assert.match(ui,/Görselleştirme Finans Profili/);assert.match(ui,/Anlaşılan Bedel/);assert.match(ui,/Render Metrikleri/);
});
test("visualization migration contains scoped time, revision and no-delete contracts",async()=>{
 const sql=await read("supabase/migrations/027_visualization_finance_profile.sql");
 for(const table of ["studio_visualization_time_entries","studio_visualization_revisions"]){assert.match(sql,new RegExp(`create table if not exists public\\.${table}`));}
 for(const field of ["included_revision_count","extra_revision_unit_price","duration_minutes","render_id","file_version_id"]){assert.match(sql,new RegExp(field));}
 assert.match(sql,/studio_is_organization_member/);assert.match(sql,/studio_has_organization_role/);assert.match(sql,/revoke delete/i);assert.doesNotMatch(sql,/delete\s+from|drop\s+table/i);
});
test("visualization AI operations are controlled and usage-trackable",async()=>{const[types,actions,prompt]=await Promise.all([read("lib/studio/ai/ai-writing-types.ts"),read("app/studio/(protected)/ai-writing-actions.ts"),read("lib/studio/ai/ai-writing-prompts.ts")]);for(const op of ["visualization_finance_summary","visualization_expense_description","visualization_profitability_insight"]){for(const text of [types,actions,prompt])assert.match(text,new RegExp(op));}});
