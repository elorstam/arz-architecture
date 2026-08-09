import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");
const [navbar, dropdown, domains, chrome, globals] = await Promise.all([
  read("components/Navbar.tsx"),
  read("components/PortalNavDropdown.tsx"),
  read("lib/routing/app-domains.ts"),
  read("components/PublicSiteChrome.tsx"),
  read("app/globals.css"),
]);

test("desktop portal dropdown sits between Blog and Contact without changing primary items", () => {
  assert.match(navbar, /<PortalNavDropdown/);
  const desktopNav = navbar.slice(navbar.indexOf('<nav className="absolute left-1/2'), navbar.indexOf('<div className="ml-auto'));
  assert.ok(desktopNav.indexOf("<PortalNavDropdown") < desktopNav.indexOf("<ContactNavDropdown"));
  assert.match(dropdown, /aria-haspopup="menu"/);
  assert.match(dropdown, /role="menu"/);
  assert.equal((navbar.match(/key: "(?:home|about|projects|blog|contact)"/g) ?? []).length, 5);
  assert.doesNotMatch(navbar, /key: "(?:portal|client|studio)"/);
});

test("desktop utility area is restored to theme language and social controls only", () => {
  const utility = navbar.slice(navbar.indexOf('<div className="ml-auto hidden'), navbar.indexOf('<button\r\n            type="button"'));
  assert.match(utility, /<ThemeToggle \/>[\s\S]*<LanguageSwitcher[\s\S]*instagramUrl[\s\S]*linkedinUrl/);
  assert.doesNotMatch(utility, /PortalNavDropdown|clientPortalLoginUrl|studioLoginUrl/);
  assert.match(navbar, /ml-auto hidden items-center gap-3 xl:flex 2xl:gap-5/);
});

test("portal trigger reuses the exact primary navigation typography and color contract", () => {
  assert.match(dropdown, /import NavbarPrimaryItem/);
  assert.match(dropdown, /<NavbarPrimaryItem/);
  assert.match(dropdown, /active=\{open\}/);
  assert.doesNotMatch(dropdown, /navControlClasses|portal-nav-dropdown__trigger/);
});

test("portal and contact share one mutually exclusive hover state", () => {
  assert.match(navbar, /activeDesktopDropdown/);
  assert.match(navbar, /open=\{activeDesktopDropdown === "portal"\}/);
  assert.match(navbar, /open=\{activeDesktopDropdown === "contact"\}/);
  for (const source of [dropdown]) {
    assert.match(source, /onMouseEnter=\{\(\) => onOpenChange\(true\)\}/);
    assert.match(source, /onMouseLeave=\{\(\) => onOpenChange\(false\)\}/);
    assert.match(source, /top-full[^\n]+pt-2/);
    assert.doesNotMatch(source, /setTimeout|document\.addEventListener/);
  }
});

test("portal links use centralized base URLs without locale prefixes", () => {
  assert.match(navbar, /appBaseUrl\("client"\)\}\/login/);
  assert.match(navbar, /appBaseUrl\("studio"\)\}\/login/);
  assert.match(domains, /export function appBaseUrl/);
  assert.match(domains, /NEXT_PUBLIC_CLIENT_PORTAL_URL/);
  assert.match(domains, /NEXT_PUBLIC_STUDIO_URL/);
  assert.doesNotMatch(navbar, /href=["']\/(?:client|studio)\/login/);
  assert.doesNotMatch(navbar, /\/(?:tr|en)\/(?:portal|client)\/login/);
  assert.equal((dropdown.match(/target="_blank"/g) ?? []).length, 2);
  assert.equal((dropdown.match(/rel="noopener noreferrer"/g) ?? []).length, 2);
  const mobilePortal = navbar.slice(navbar.indexOf('href={clientPortalLoginUrl}', navbar.indexOf('id="mobile-navigation"')));
  assert.ok((mobilePortal.match(/target="_blank"/g) ?? []).length >= 2);
  assert.ok((mobilePortal.match(/rel="noopener noreferrer"/g) ?? []).length >= 2);
});

test("Portal preserves production navbar geometry from commit 376218e", () => {
  for (const token of [
    'h-[72px]', 'md:h-[80px]', 'h-[60px]', 'w-[126px]', 'md:h-[68px]', 'md:w-[144px]',
    'gap-8', '2xl:gap-14', 'gap-3', '2xl:gap-5', 'h-10 w-10', 'h-[21px] w-[21px]',
  ]) assert.ok(navbar.includes(token), token);
  assert.match(dropdown, /<NavbarPrimaryItem/);
});

test("mobile menu exposes both portal destinations and preserves close behavior", () => {
  assert.match(navbar, /href=\{clientPortalLoginUrl\}[\s\S]*onClick=\{\(\) => setMenuOpen\(false\)\}/);
  assert.match(navbar, /href=\{studioLoginUrl\}[\s\S]*onClick=\{\(\) => setMenuOpen\(false\)\}/);
  assert.match(navbar, /t\("portal\.client"\)/);
  assert.match(navbar, /t\("portal\.studio"\)/);
});

test("dropdown uses navbar surface tokens in both themes", () => {
  for (const token of ["--nav-surface", "--nav-foreground", "--nav-muted", "--nav-border", "--nav-hover", "--nav-blur"]) {
    assert.ok(globals.includes(token), token);
  }
  assert.match(dropdown, /navbar-dropdown__panel/);
  assert.doesNotMatch(globals, /navbar-dropdown__[^{]+\{[^}]*(?:beige|cream)/is);
});

test("public chrome remains excluded from Studio and Client hosts", () => {
  assert.match(chrome, /internalAppHost/);
  assert.match(chrome, /pathname\.startsWith\("\/studio"\)/);
  assert.match(chrome, /pathname\.startsWith\("\/client"\)/);
});
