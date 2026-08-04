import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

const navbar=await readFile(new URL("../../components/Navbar.tsx",import.meta.url),"utf8");

test("desktop utility order places online payment before theme and language",()=>{
  const utility=navbar.slice(navbar.indexOf('className="ml-auto hidden'),navbar.indexOf('<button\n            type="button"',navbar.indexOf('className="ml-auto hidden')));
  assert.ok(utility.indexOf("onlinePaymentHref")<utility.indexOf("<ThemeToggle"));
  assert.ok(utility.indexOf("<ThemeToggle")<utility.indexOf("<LanguageSwitcher"));
  assert.ok(utility.indexOf("<LanguageSwitcher")<utility.indexOf("instagramUrl"));
  assert.ok(utility.indexOf("instagramUrl")<utility.indexOf("linkedinUrl"));
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

test("tablet and compact desktop avoid label overflow",()=>{
  assert.match(navbar,/hidden whitespace-nowrap[^\n]+min-\[1440px\]:inline/);
  assert.match(navbar,/xl:flex/);
  assert.match(navbar,/w-full gap-3 px-5/);
});
