import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const read=path=>readFile(path,"utf8");

test("026 finance schema repair is additive, repeat-safe and transaction balanced",async()=>{
  const sql=await read("supabase/migrations/026_fix_finance_schema.sql");
  const rollback=await read("supabase/rollbacks/026_fix_finance_schema.rollback.sql");
  assert.match(sql,/begin;/i); assert.match(sql,/commit;/i);
  for(const column of ["paid_amount","receipt_file_id","invoice_file_id","contract_file_id","agreed_amount"]){assert.match(sql,new RegExp(`add column if not exists ${column}`));}
  assert.match(sql,/create table if not exists public\.studio_project_finance_profiles/i);
  assert.match(sql,/pg_policies/); assert.match(sql,/revoke delete/i);
  assert.doesNotMatch(sql,/delete\s+from|drop\s+table/i);
  assert.match(rollback,/begin;/i); assert.match(rollback,/commit;/i);
  assert.doesNotMatch(rollback,/drop\s+table|delete\s+from/i);
});

test("026 restores the repository's document and category contract",async()=>{
  const[sql,repo]=await Promise.all([read("supabase/migrations/026_fix_finance_schema.sql"),read("lib/studio/finance/project-finance-repository.ts")]);
  for(const field of ["receipt_file_id","invoice_file_id","paid_amount"]){assert.match(sql,new RegExp(field));assert.match(repo,new RegExp(field));}
  for(const category of ["statik","mekanik","elektrik","zemin_etud","ozalit","harc"]){assert.match(sql,new RegExp(category));}
});
