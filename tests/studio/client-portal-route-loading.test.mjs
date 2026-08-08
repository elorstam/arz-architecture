import assert from "node:assert/strict";
import {access,readFile} from "node:fs/promises";
import test from "node:test";

const read=path=>readFile(path,"utf8");
const missing=async path=>{try{await access(path);return false;}catch{return true;}};

test("portal route transitions have no full-page skeleton boundaries",async()=>{
  const loadingFiles=[
    "app/client/loading.tsx",
    "app/client/(portal)/stages/loading.tsx",
    "app/client/(portal)/renders/loading.tsx",
    "app/client/(portal)/files/loading.tsx",
    "app/client/(portal)/documents/loading.tsx",
    "app/client/(portal)/finance/loading.tsx",
    "app/client/(portal)/notifications/loading.tsx",
  ];
  for(const path of loadingFiles)assert.equal(await missing(path),true,`${path} should not replace retained route content`);
});

test("portal shell and navigation remain shared while route content resolves",async()=>{
  const[shell,navigation,tabs]=await Promise.all([
    read("components/client-portal/ClientPortalShell.tsx"),
    read("components/client-portal/ClientPortalNavigation.tsx"),
    read("components/studio/StudioTabs.tsx"),
  ]);
  assert.match(shell,/ClientPortalHeader/);
  assert.match(shell,/ClientPortalNavigation/);
  assert.match(shell,/<main className="client-main">\{children\}<\/main>/);
  assert.match(navigation,/variant="workspace-navigation"/);
  assert.doesNotMatch(navigation,/router\.(refresh|push|replace)/);
  assert.match(tabs,/<Link/);
  assert.doesNotMatch(tabs,/prefetch=\{false\}/);
});

test("loading removal does not alter theme or auth form isolation",async()=>{
  const[css,header,login,invite]=await Promise.all([
    read("app/client/client-portal.css"),
    read("components/client-portal/ClientPortalHeader.tsx"),
    read("components/client-portal/ClientLoginForm.tsx"),
    read("components/client-portal/ClientInvitationForm.tsx"),
  ]);
  assert.match(css,/html\[data-theme="dark"\] \.client-portal\.studio-root/);
  assert.match(header,/ThemeToggle className="client-theme-toggle"/);
  assert.match(login,/client-auth-form/);
  assert.match(invite,/client-auth-form/);
  assert.doesNotMatch(css,/cream|#f5f1eb/i);
});
