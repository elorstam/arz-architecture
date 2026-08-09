import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const read=path=>readFileSync(path,"utf8");
const route=read("app/client/(portal)/finance/page.tsx");
const notice=read("components/client-portal/ClientPaymentResultNotice.tsx");
const list=read("components/client-portal/ClientFinanceList.tsx");
const requests=read("components/client-portal/ClientPaymentRequests.tsx");
const page=read("components/client-portal/ClientFinancePage.tsx");

test("payment result renders one success or failure notice",()=>{assert.match(route,/ClientPaymentResultNotice result=\{payment\}/);assert.match(notice,/Ödemeniz başarıyla alındı/);assert.match(notice,/Ödeme tamamlanamadı\. Tekrar deneyebilirsiniz/);});

test("payment query is removed once without navigation refresh or reload",()=>{assert.match(notice,/useEffect\(\(\)=>/);assert.match(notice,/searchParams\.delete\("payment"\)/);assert.match(notice,/searchParams\.delete\("reason"\)/);assert.match(notice,/history\.replaceState/);assert.doesNotMatch(notice,/router\.(replace|refresh|push)|location\.(assign|replace|reload)/);});

test("payment return remounts finance with no automatically selected drawer item",()=>{assert.match(route,/key=\{`finance-\$\{payment\?\?"normal"\}`\}/);assert.match(list,/useState<ClientFinance\|null>\(null\)/);assert.doesNotMatch(route+notice,/setSelected|selectedFinance|entryId/);assert.match(list,/open=\{Boolean\(selected\)\}/);});

test("finance detail drawer remains manual only",()=>{assert.match(list,/onClick=\{\(\)=>setSelected\(item\)\}/);assert.match(list,/onClose=\{\(\)=>setSelected\(null\)\}/);});

test("paid records and finance totals retain their existing projections",()=>{assert.match(requests,/\["paid","refunded"\]\.includes/);assert.match(requests,/paidAt/);assert.match(requests,/Ödendi/);assert.match(page,/totals\(active\)/);assert.match(page,/totals\(paid\)/);assert.match(page,/\["collected","paid"\]/);});
