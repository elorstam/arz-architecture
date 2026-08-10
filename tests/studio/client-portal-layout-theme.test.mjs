import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

const read=path=>readFile(path,"utf8");

test("public site chrome never renders for any client route",async()=>{
  const[root,chrome,clientLayout]=await Promise.all([
    read("app/layout.tsx"),
    read("components/PublicSiteChrome.tsx"),
    read("app/client/layout.tsx"),
  ]);
  assert.match(root,/PublicSiteChrome/);
  assert.doesNotMatch(root,/<Navbar\s*\/>/);
  assert.match(chrome,/pathname\.startsWith\("\/client"\)/);
  assert.match(chrome,/if\([\s\S]*?\)return null/);
  assert.ok(chrome.indexOf('pathname.startsWith("/client")')<chrome.indexOf("return <Navbar/>"));
  assert.match(clientLayout,/client-route-root/);
  assert.doesNotMatch(clientLayout,/Navbar|Footer|LanguageSwitcher|Social/);
});

test("public routes retain the existing navbar and public theme control",async()=>{
  const[chrome,navbar,toggle,root,themePreference]=await Promise.all([
    read("components/PublicSiteChrome.tsx"),
    read("components/Navbar.tsx"),
    read("components/ThemeToggle.tsx"),
    read("app/layout.tsx"),
    read("lib/theme-preference.ts"),
  ]);
  assert.match(chrome,/return <Navbar\/>/);
  assert.match(navbar,/navigationItems\.map/);
  assert.match(navbar,/ThemeToggle/);
  assert.match(root,/id="theme-init"/);
  assert.match(toggle,/readThemePreference\(\)/);
  assert.match(toggle,/persistThemePreference\(nextTheme\)/);
  assert.match(themePreference,/localStorage\.getItem\(THEME_KEY\)/);
  assert.match(themePreference,/localStorage\.setItem\(THEME_KEY, theme\)/);
});

test("client header is light-only without mutating persisted Studio or public theme",async()=>{
  const[header,clientCss,toggle]=await Promise.all([read("components/client-portal/ClientPortalHeader.tsx"),read("app/client/client-portal.css"),read("components/ThemeToggle.tsx")]);
  assert.doesNotMatch(header,/ThemeToggle|client-theme-toggle|persistThemePreference/);
  assert.match(clientCss,/\.client-route-root \{[^}]*color-scheme:light/);
  assert.match(toggle,/persistThemePreference\(nextTheme\)/);
});

test("client light surfaces are explicit without weakening Studio isolation",async()=>{
  const[clientCss,globals,shell]=await Promise.all([
    read("app/client/client-portal.css"),
    read("app/globals.css"),
    read("components/client-portal/ClientPortalShell.tsx"),
  ]);
  assert.match(shell,/studio-root client-portal/);
  for(const token of["--studio-workspace:#f7f9fc","--studio-surface:#fff","--studio-surface-muted:#f3f6fa","--studio-border:#e3e9ef","color-scheme:light"])assert.match(clientCss,new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")));
  assert.doesNotMatch(clientCss,/html\[data-theme="dark"\] \.client-(portal|route-root)/);
  assert.match(globals,/\.studio-root\s*\{/);
  assert.match(globals,/color-scheme:\s*light/);
  assert.doesNotMatch(clientCss,/(^|\n)\s*(html|body|input|label|button)\s*\{/);
});

test("client navigation and auth field layout remain responsive and unchanged",async()=>{
  const[css,nav,login]=await Promise.all([
    read("app/client/client-portal.css"),
    read("components/client-portal/ClientPortalNavigation.tsx"),
    read("components/client-portal/ClientLoginForm.tsx"),
  ]);
  assert.match(nav,/variant="workspace-navigation"/);
  assert.match(css,/@media\(max-width:767px\)[\s\S]*?\.client-header/);
  assert.match(css,/\.client-auth-form\s*\{[\s\S]*?display:\s*grid/);
  assert.ok(login.indexOf('id="client-email"')<login.indexOf('id="client-password"'));
});
