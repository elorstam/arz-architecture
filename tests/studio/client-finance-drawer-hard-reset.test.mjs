import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const list=readFileSync("components/client-portal/ClientFinanceList.tsx","utf8");
const drawer=readFileSync("components/client-portal/ClientFinancePaymentDrawer.tsx","utf8");
const css=readFileSync("app/client/(portal)/finance/client-finance.css","utf8");

test("Finance selection has only explicit row and close setter paths",()=>{assert.equal((list.match(/setSelectedPaymentId\(item\.id\)/g)??[]).length,1);assert.equal((list.match(/setSelectedPaymentId\(null\)/g)??[]).length,1);assert.match(list,/useMemo\(\(\)=>entries\.find\(payment=>payment\.id===selectedPaymentId\)\?\?null/);assert.doesNotMatch(list,/onMouse|onPointer|onFocus|onBlur|onScroll|onResize/)});
test("Finance bypasses every shared drawer and routing dependency",()=>{assert.match(list,/ClientFinancePaymentDrawer/);assert.doesNotMatch(list+drawer,/StudioDrawer|createPortal|AnimatePresence|framer-motion|useRouter|useSearchParams|router\.|window\.location/);assert.doesNotMatch(drawer,/document\.body|overflow\s*=|classList/)});
test("overlay X and one open-scoped Escape listener close directly",()=>{assert.match(drawer,/client-finance-drawer-overlay" onClick=\{onClose\}/);assert.match(drawer,/button type="button" onClick=\{onClose\}/);assert.match(drawer,/event\.key==="Escape"\)onClose\(\)/);assert.match(drawer,/addEventListener\("keydown",handleEscape\)/);assert.match(drawer,/removeEventListener\("keydown",handleEscape\)/)});
test("dedicated drawer is fixed full-height and entirely motionless",()=>{assert.match(css,/\.client-finance-drawer-overlay\{position:fixed;inset:0;[^}]*backdrop-filter:none;filter:none;transition:none;animation:none/);assert.match(css,/\.client-finance-payment-drawer\{position:fixed;top:0;right:0;bottom:0;[^}]*width:min\(520px,100vw\);height:100dvh;[^}]*overflow-y:auto;overscroll-behavior:contain/);assert.match(css,/client-finance-payment-drawer\{[^}]*transform:none;transition:none;animation:none/);assert.doesNotMatch(css,/client-finance-(?:drawer-overlay|payment-drawer)[^}]*studio-drawer/)});
