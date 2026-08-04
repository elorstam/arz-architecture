import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

const read=path=>readFile(new URL(`../../${path}`,import.meta.url),"utf8");
const [navbar,dropdown]=await Promise.all([read("components/Navbar.tsx"),read("components/ContactNavDropdown.tsx")]);

test("standalone payment CTA is removed and contact keeps desktop nav position",()=>{
  assert.doesNotMatch(navbar,/CreditCard|online-payment-nav-action|navControlClasses/);
  assert.match(navbar,/if\(item\.key==="contact"\)return <ContactNavDropdown/);
  assert.match(navbar,/paymentHref=\{onlinePaymentHref\}/);
  assert.match(navbar,/triggerClassName=\{navbarItemClassName\(active\|\|isOnlinePaymentActive\)\}/);
});

test("dropdown provides locale-aware quote and payment menu links",()=>{
  assert.match(dropdown,/role="menu"/);assert.match(dropdown,/role="menuitem"/);
  assert.match(dropdown,/>Teklif Al</);assert.match(dropdown,/>Online Ödeme</);
  assert.match(navbar,/contactHref=\{getHref\("\/contact"\)\}/);
  assert.match(navbar,/const onlinePaymentHref = `\/\$\{locale\}\/online-odeme`/);
  assert.doesNotMatch(dropdown,/<span aria-hidden>→<\/span>/);
});

test("desktop interactions support hover click outside focus arrows and escape",()=>{
  for(const token of ["onMouseEnter","onMouseLeave","onFocusCapture","onClick","pointerdown","ArrowDown","Escape","firstItemRef","closeAndFocus"]){assert.match(dropdown,new RegExp(token));}
  assert.match(dropdown,/aria-haspopup="menu"/);assert.match(dropdown,/aria-expanded=\{open\}/);
  assert.match(dropdown,/top-full[^\n]+pt-2/);assert.match(dropdown,/absolute left-1\/2/);
});

test("dropdown themes use navbar tokens and explicit light surface",()=>{
  assert.match(navbar,/background: color-mix\(in srgb, var\(--nav-surface\)/);
  assert.match(navbar,/border-color: var\(--nav-border\)/);
  assert.match(navbar,/background: #fff/);assert.match(navbar,/background:#f2f1ed/);
});

test("mobile contact group exposes two touch-friendly normal links",()=>{
  assert.match(navbar,/if\(item\.key==="contact"\)return <div/);
  assert.match(navbar,/min-h-11[^\n]+>\<span>Teklif Al/);
  assert.match(navbar,/min-h-11[^\n]+>\<span>Online Ödeme/);
  assert.match(navbar,/onClick=\{\(\)=>setMenuOpen\(false\)\}/);
});
