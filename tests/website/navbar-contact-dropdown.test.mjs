import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

const read=path=>readFile(new URL(`../../${path}`,import.meta.url),"utf8");
const [navbar,dropdown,primaryItem]=await Promise.all([read("components/Navbar.tsx"),read("components/ContactNavDropdown.tsx"),read("components/NavbarPrimaryItem.tsx")]);

test("standalone payment CTA is removed and contact keeps desktop nav position",()=>{
  assert.doesNotMatch(navbar,/CreditCard|online-payment-nav-action|navControlClasses/);
  assert.match(navbar,/if\(item\.key==="contact"\)return <ContactNavDropdown/);
  assert.match(navbar,/paymentHref=\{onlinePaymentHref\}/);
  assert.match(navbar,/<NavbarPrimaryItem/);assert.match(dropdown,/<NavbarPrimaryItem/);
  assert.doesNotMatch(dropdown,/<button/);assert.match(primaryItem,/forwardRef<HTMLAnchorElement/);
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

test("contact and primary links share typography color focus and underline implementation",()=>{
  for(const token of ["font-normal","leading-normal","tracking-[0.11em]","text-white/62","hover:text-white/90","focus-visible:text-white/90","bottom-[2px]","duration-500","group-focus-visible:w-full"]){assert.ok(primaryItem.includes(token),token);}
  assert.match(dropdown,/ml-1 text-\[12px\] leading-none opacity-70/);
});

test("dropdown themes use navbar tokens and explicit light surface",()=>{
  assert.match(navbar,/background: color-mix\(in srgb, var\(--nav-surface\)/);
  assert.match(navbar,/border-color: var\(--nav-border\)/);
  assert.match(navbar,/background: rgba\(255,255,255,\.78\)/);
  assert.match(navbar,/border-color: rgba\(255,255,255,\.48\)/);
  assert.match(navbar,/backdrop-filter: blur\(18px\)/);
  assert.match(navbar,/background:rgba\(255,255,255,\.42\)/);
  assert.doesNotMatch(navbar,/contact-nav-dropdown__panel \{[^}]*background: #fff/s);
});

test("light glass tokens retain readable neutral contrast",()=>{
  assert.match(navbar,/color: #242421/);assert.match(navbar,/color:#55534e/);assert.match(navbar,/color:#171715/);
  const alpha=Number(navbar.match(/background: rgba\(255,255,255,\.(\d+)\)/)?.[1]??0)/100;
  assert.ok(alpha>=.72&&alpha<=.82,"light glass alpha remains in the readable range");
});

test("mobile contact group exposes two touch-friendly normal links",()=>{
  assert.match(navbar,/if\(item\.key==="contact"\)return <div/);
  assert.match(navbar,/min-h-11[^\n]+>\<span>Teklif Al/);
  assert.match(navbar,/min-h-11[^\n]+>\<span>Online Ödeme/);
  assert.match(navbar,/onClick=\{\(\)=>setMenuOpen\(false\)\}/);
});
