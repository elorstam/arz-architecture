import assert from "node:assert/strict";
import {access,readFile} from "node:fs/promises";
import test from "node:test";

const read=path=>readFile(path,"utf8");
const missing=async path=>{try{await access(path);return false;}catch{return true;}};

test("Studio route transitions have no large segment skeleton boundaries",async()=>{
  for(const path of[
    "app/studio/(protected)/crm/loading.tsx",
    "app/studio/(protected)/projects/loading.tsx",
    "app/studio/(protected)/projects/[projectId]/files/loading.tsx",
    "app/studio/(protected)/quotes/loading.tsx",
  ])assert.equal(await missing(path),true,`${path} should not replace retained Studio content`);
});

test("Studio shell and sidebar remain shared during route transitions",async()=>{
  const[shell,sidebar]=await Promise.all([read("components/studio/StudioShell.tsx"),read("components/studio/StudioSidebar.tsx")]);
  assert.match(shell,/StudioSidebar/);
  assert.match(shell,/StudioHeader/);
  assert.match(shell,/<main>\{children\}<\/main>/);
  assert.match(sidebar,/<Link href=\{hrefFor\(item\.href\)\}/);
  assert.doesNotMatch(sidebar,/prefetch=\{false\}|router\.(refresh|push|replace)/);
});

test("Studio header reuses the persisted ARZ theme toggle",async()=>{
  const[header,toggle,root]=await Promise.all([read("components/studio/StudioHeader.tsx"),read("components/ThemeToggle.tsx"),read("app/layout.tsx")]);
  assert.match(header,/ThemeToggle className="studio-theme-toggle"/);
  assert.match(toggle,/document\.documentElement\.dataset\.theme = nextTheme/);
  assert.match(toggle,/persistThemePreference\(nextTheme\)/);
  assert.match(root,/const key = "arz-theme"/);
  assert.match(root,/localStorage\.getItem\(key\)/);
});

test("Studio light isolation and dark variables cover shared primitives",async()=>{
  const css=await read("app/globals.css");
  for(const value of["--studio-workspace: #f7f9fc","--studio-surface: #fff","--studio-border: #e3e9ef"])assert.ok(css.includes(value));
  assert.match(css,/html\[data-theme="dark"\] \.studio-root:not\(\.client-portal\) \{/);
  for(const value of["--studio-workspace:#0f1720","--studio-surface:#17212b","--studio-surface-muted:#1c2935","--studio-border:#2c3a47","--studio-text-primary:#f2f6fa","color-scheme:dark"])assert.ok(css.includes(value));
  for(const primitive of["studio-card-v2","studio-control input","studio-modal","studio-drawer","studio-tab-inactive","studio-badge--neutral","studio-dashboard-v3 .studio-kpi-v2","studio-files-metric","studio-finance-page"])assert.ok(css.includes(primitive));
  assert.doesNotMatch(css,/(^|\n)\s*(input|button|label|table|\.bg-white)\s*\{/);
});

test("Studio dark scope cannot alter public or Client Portal theme scopes",async()=>{
  const[css,clientCss,chrome]=await Promise.all([read("app/globals.css"),read("app/client/client-portal.css"),read("components/PublicSiteChrome.tsx")]);
  assert.match(css,/\.studio-root:not\(\.client-portal\)/);
  assert.match(clientCss,/html\[data-theme="dark"\] \.client-portal\.studio-root/);
  assert.match(chrome,/pathname\.startsWith\("\/studio"\)/);
});
