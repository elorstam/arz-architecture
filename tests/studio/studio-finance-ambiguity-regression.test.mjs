import assert from"node:assert/strict";
import{readFileSync}from"node:fs";
import test from"node:test";

const read=path=>readFileSync(path,"utf8");
const migration=read("supabase/migrations/052_fix_studio_finance_id_ambiguity.sql");
const page=read("app/studio/(protected)/projects/[projectId]/finance/page.tsx");
const paymentRepository=read("lib/studio/finance/payment-request-repository.ts");
const financeRepository=read("lib/studio/finance/project-finance-repository.ts");

test("Studio Finance loads the corrected payment request RPC",()=>{assert.match(page,/getProjectFinanceWorkspace\(projectId\)/);assert.match(page,/getStudioPaymentRequests\(projectId\)/);assert.match(paymentRepository,/studio_list_client_payment_requests_v2/);assert.match(migration,/create or replace function public\.studio_list_client_payment_requests_v2/);});

test("RETURNS TABLE id cannot collide with the project lookup",()=>{assert.match(migration,/returns table\(id uuid/);assert.match(migration,/select sp\.organization_id into v_org/);assert.match(migration,/where sp\.id=p_project_id and not sp\.is_archived/);assert.doesNotMatch(migration,/\bwhere id=p_project_id\b|\bselect id\b/);});

test("payment request attempt and refund identifiers use explicit aliases",()=>{assert.match(migration,/select pr\.id,pr\.title/);assert.match(migration,/pa\.payment_request_id=pr\.id/);assert.match(migration,/rf\.payment_attempt_id=pa\.id/);assert.match(migration,/pr\.organization_id=v_org and pr\.project_id=p_project_id/);});

test("finance entry identifiers remain sourced from their own base projections",()=>{assert.match(financeRepository,/studio_finance_entries"\)\.select\("id,entry_type/);assert.match(financeRepository,/studio_finance_events"\)\.select\("id,title,event_type,created_at,entry_id/);assert.match(financeRepository,/studio_finance_payments"\)\.select\("income_id,amount,payment_date/);});

test("paid installment metadata remains in the corrected RPC projection",()=>{for(const field of["pa.installment","pa.paid_price","pa.merchant_commission_rate","pa.iyzi_commission_rate_amount","pa.iyzi_commission_fee","pa.environment","rf.status"])assert.match(migration,new RegExp(field.replace(".","\\.")));assert.match(migration,/pa\.status in\('succeeded','refunded'\)/);});

test("migration is forward-only transactional and preserves the RPC grant",()=>{assert.match(migration,/^begin;/);assert.match(migration,/grant execute on function public\.studio_list_client_payment_requests_v2\(uuid\) to authenticated/);assert.match(migration,/notify pgrst,'reload schema'/);assert.match(migration,/commit;\s*$/);});
