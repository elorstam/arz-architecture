import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const read=path=>readFileSync(path,"utf8");
const css=read("app/globals.css");
const shell=read("components/studio/StudioShell.tsx");
const clientShell=read("components/client-portal/ClientPortalShell.tsx");
const dashboard=read("components/studio/StudioDashboard.tsx");
const activity=read("components/studio/dashboard/StudioActivityFeed.tsx");

test("Studio and Client Portal share isolated workspace boundaries",()=>{
  assert.match(shell,/className="studio-root min-h-screen overflow-x-hidden"/);
  assert.match(clientShell,/className="studio-root client-portal/);
  assert.match(css,/\.studio-root \{[\s\S]*?--theme-bg: 9 9 9;[\s\S]*?--theme-fg: 255 255 255;[\s\S]*?--theme-inverse-bg: 255 255 255;[\s\S]*?--theme-inverse-fg: 9 9 9;/);
});

test("Studio dark theme is explicit and remains separate from Client Portal",()=>{
  assert.match(css,/html\[data-theme="dark"\] \.studio-root:not\(\.client-portal\)/);
  assert.match(css,/--studio-workspace:#0f1720/);
  assert.match(css,/--studio-surface:#17212b/);
  assert.match(css,/--studio-border:#2c3a47/);
  assert.match(css,/--studio-text-primary:#f2f6fa/);
});

test("public light theme cannot invert approved Studio white surfaces",()=>{
  assert.match(css,/html\[data-theme="light"\] \[class~="bg-white"\] \{ background-color: rgb\(var\(--theme-inverse-bg\)\); \}/);
  assert.match(activity,/aria-labelledby="activity-title"[^>]*bg-white/);
  assert.match(css,/\.studio-root \{[\s\S]*?--theme-inverse-bg: 255 255 255;/);
  assert.match(css,/\.studio-root \{[\s\S]*?--studio-workspace: #f7f9fc;/);
  assert.match(css,/--studio-surface: #fff;/);
  assert.match(css,/--studio-border: #e3e9ef;/);
  assert.match(css,/--studio-surface-muted: #f3f6fa;/);
});

test("dashboard composition and approved activity card remain unchanged",()=>{
  for(const component of["StudioWelcome","StudioDailyFocus","StudioProjectOverview","StudioPermitSummary","StudioActivityFeed","StudioCompactWidgets"])assert.match(dashboard,new RegExp(component));
  assert.match(activity,/rounded-\[20px\].*border-\[#e1e6ea\].*bg-white.*shadow-/);
  assert.match(activity,/text-\[#2d353b\]/);
  assert.doesNotMatch(activity,/bg-black|theme-dark-surface|data-theme/);
});

test("Client Portal styles remain scoped and do not redefine Studio surfaces",()=>{
  for(const file of["app/client/client-portal.css","app/client/(portal)/notifications/client-notifications.css","app/client/(portal)/renders/client-renders.css"]){
    const source=read(file);
    assert.doesNotMatch(source,/(^|[},]\s*)\.studio-(card|section-header|page-header)\s*\{/m);
  }
});
