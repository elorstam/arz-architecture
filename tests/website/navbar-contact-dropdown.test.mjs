import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

const read=path=>readFile(new URL(`../../${path}`,import.meta.url),"utf8");
const [navbar,dropdown,primaryItem,globals]=await Promise.all([read("components/Navbar.tsx"),read("components/ContactNavDropdown.tsx"),read("components/NavbarPrimaryItem.tsx"),read("app/globals.css")]);

test("standalone payment CTA is removed and contact keeps desktop nav position",()=>{
  assert.doesNotMatch(navbar,/CreditCard|online-payment-nav-action|navControlClasses/);
  assert.match(navbar,/if\s*\(item\.key\s*===\s*"contact"\)[\s\S]*?<ContactNavDropdown/);
  assert.match(navbar,/paymentHref=\{onlinePaymentHref\}/);
  assert.match(navbar,/<NavbarPrimaryItem/);assert.match(dropdown,/<NavbarPrimaryItem/);
  assert.doesNotMatch(dropdown,/<button/);assert.match(primaryItem,/forwardRef<HTMLAnchorElement/);
});

test("dropdown provides locale-aware quote and payment menu links",()=>{
  assert.match(dropdown,/role="menu"/);assert.match(dropdown,/role="menuitem"/);
  assert.match(navbar,/quoteLabel=\{t\("quote"\)\}/);assert.match(navbar,/paymentLabel=\{t\("onlinePayment"\)\}/);
  assert.match(navbar,/contactHref=\{getHref\("\/contact"\)\}/);
  assert.match(navbar,/const onlinePaymentHref = `\/\$\{locale\}\/online-odeme`/);
  assert.doesNotMatch(dropdown,/<span aria-hidden>→<\/span>/);
});

test("desktop interactions support hover click outside focus arrows and escape",()=>{
  for(const token of ["onMouseEnter","onMouseLeave","onFocusCapture","onClick","ArrowDown","Escape","firstItemRef","closeAndFocus","onOpenChange"]){assert.match(dropdown,new RegExp(token));}
  assert.doesNotMatch(dropdown,/setTimeout|document\.addEventListener|pointerdown/);
  assert.match(dropdown,/aria-haspopup="menu"/);assert.match(dropdown,/aria-expanded=\{open\}/);
  assert.match(dropdown,/top-full[^\n]+pt-2/);assert.match(dropdown,/absolute left-1\/2/);
});

test("contact and primary links share typography color focus and underline implementation",()=>{
  for(const token of ["font-normal","leading-normal","tracking-[0.11em]","text-white/62","hover:text-white/90","focus-visible:text-white/90","bottom-[2px]","duration-500","group-focus-visible:w-full"]){assert.ok(primaryItem.includes(token),token);}
  assert.match(dropdown,/ml-1 text-\[12px\] leading-none opacity-70/);
});

test("both dropdowns use the shared navbar surface tokens",()=>{
  assert.match(dropdown,/navbar-dropdown__panel/);
  assert.match(globals,/\.navbar-dropdown__panel \{/);
  assert.match(globals,/background: color-mix\(in srgb, var\(--nav-surface\)/);
  assert.match(globals,/border: 1px solid var\(--nav-border\)/);
  assert.doesNotMatch(navbar,/contact-nav-dropdown__panel|html\[data-theme="light"\][^}]*contact-nav-dropdown/s);
});

test("light dark hero and scrolled surfaces remain driven by navbar state variables",()=>{
  for(const token of ["--nav-surface","--nav-foreground","--nav-muted","--nav-border","--nav-hover","--nav-blur"]){assert.ok(globals.includes(token),token);}
  assert.doesNotMatch(globals,/navbar-dropdown__panel[^}]*#(?:fff|f3f2ee|f5f1eb)/s);
});

test("mobile contact group exposes two touch-friendly normal links",()=>{
  assert.match(navbar,/if\s*\(item\.key\s*===\s*"contact"\)[\s\S]*?<div/);
  assert.match(navbar,/min-h-11[\s\S]*?<span>\{t\("quote"\)\}<\/span>/);
  assert.match(navbar,/min-h-11[\s\S]*?<span>\{t\("onlinePayment"\)\}<\/span>/);
  assert.match(navbar,/onClick=\{\(\)\s*=>\s*setMenuOpen\(false\)\}/);
});
