import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const list=readFileSync("components/client-portal/ClientFinanceList.tsx","utf8");
const route=readFileSync("app/client/(portal)/finance/page.tsx","utf8");
const notice=readFileSync("components/client-portal/ClientPaymentResultNotice.tsx","utf8");

test("completed payment selection is stable local client state",()=>{
 assert.match(list,/useState<string\|null>\(null\)/);
 assert.match(list,/entries\.find\(payment=>payment\.id===selectedPaymentId\)\?\?null/);
 assert.match(list,/onClick=\{\(\)=>setSelectedPaymentId\(item\.id\)\}/);
 assert.match(list,/selectedPayment\?<ClientFinancePaymentDrawer/);
});

test("drawer close handler is stable and a different row swaps content in place",()=>{
 assert.match(list,/useCallback\(\(\)=>setSelectedPaymentId\(null\),\[\]\)/);
 assert.match(list,/onClose=\{closeDrawer\}/);
 assert.equal((list.match(/<ClientFinancePaymentDrawer /g)??[]).length,1);
 assert.doesNotMatch(list,/StudioDrawer/);
 assert.doesNotMatch(list,/key=\{(?:Date\.now\(\)|Math\.random\(\)|selected)/);
});

test("drawer interaction performs no navigation, refresh, reload, or refetch",()=>{
 assert.doesNotMatch(list,/useRouter|useSearchParams|router\.|refresh\(|location\.|window\.|fetch\(/);
 assert.doesNotMatch(route,/key=\{`finance-/);
});

test("post-payment notice keeps history-only query cleanup",()=>{
 assert.match(notice,/history\.replaceState/);
 assert.doesNotMatch(notice,/router\.(replace|refresh|push)|location\.(assign|replace|reload)/);
});

test("payment status is rendered once in each list and detail presentation",()=>{
 assert.equal((list.match(/statusLabels\[selectedPayment\.status\]\?\?selectedPayment\.status/g)??[]).length,1);
});
