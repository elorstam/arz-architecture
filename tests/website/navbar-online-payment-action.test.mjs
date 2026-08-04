import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

const navbar=await readFile(new URL("../../components/Navbar.tsx",import.meta.url),"utf8");

test("desktop order places online payment immediately after logo and keeps utilities ordered",()=>{
  const desktop=navbar.slice(navbar.indexOf('className="relative mx-auto flex h-[72px]'),navbar.indexOf('id="mobile-navigation"'));
  assert.ok(desktop.indexOf("localizedHomeHref")<desktop.indexOf("onlinePaymentHref"));
  assert.ok(desktop.indexOf("onlinePaymentHref")<desktop.indexOf('<nav className="absolute left-1/2'));
  assert.ok(desktop.indexOf('<nav className="absolute left-1/2')<desktop.indexOf("<ThemeToggle"));
  assert.ok(desktop.indexOf("<ThemeToggle")<desktop.indexOf("<LanguageSwitcher"));
  assert.ok(desktop.indexOf("<LanguageSwitcher")<desktop.indexOf("instagramUrl"));
  assert.ok(desktop.indexOf("instagramUrl")<desktop.indexOf("linkedinUrl"));
});

test("action has icon, accessible state and keyboard focus",()=>{
  assert.match(navbar,/import \{ CreditCard \} from "lucide-react"/);
  assert.match(navbar,/aria-label="Güvenli Online Ödeme"/);
  assert.match(navbar,/aria-current=\{isOnlinePaymentActive/);
  assert.match(navbar,/online-payment-nav-action:focus-visible/);
  assert.match(navbar,/online-payment-nav-action\[aria-disabled="true"\]/);
});

test("light and dark surfaces have explicit adaptive colors",()=>{
  assert.match(navbar,/html\[data-theme="light"\] \.site-header \.online-payment-nav-action/);
  assert.match(navbar,/background: #fff !important/);
  assert.match(navbar,/color: #242421 !important/);
  assert.match(navbar,/background: rgba\(255, 255, 255, 0\.055\) !important/);
});

test("mobile menu exposes action before primary navigation and preserves close behavior",()=>{
  const mobile=navbar.slice(navbar.indexOf('id="mobile-navigation"'));
  assert.ok(mobile.indexOf("onlinePaymentHref")<mobile.indexOf('<nav className="mobile-menu-border'));
  assert.match(mobile,/onClick=\{\(\) => setMenuOpen\(false\)\}/);
  assert.match(mobile,/online-payment-nav-action--mobile/);
});

test("tablet and compact desktop use a two-line fixed-width action without overflow",()=>{
  assert.match(navbar,/ml-5 hidden w-\[108px\][^\n]+md:inline-flex xl:ml-6/);
  assert.match(navbar,/<span className="block">Güvenli<\/span>/);
  assert.match(navbar,/<span className="block whitespace-nowrap">Online Ödeme<\/span>/);
  assert.match(navbar,/w-full gap-3 px-5/);
});
