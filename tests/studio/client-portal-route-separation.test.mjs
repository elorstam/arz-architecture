import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const read=path=>readFileSync(new URL(`../../${path}`,import.meta.url),"utf8");
const context=read("lib/client-portal/get-client-portal-context.ts");
const clientLayout=read("app/client/(portal)/layout.tsx");
const clientPage=read("app/client/(portal)/page.tsx");
const studioLayout=read("app/studio/(protected)/layout.tsx");
const loginRoute=read("app/api/studio/auth/login/route.ts");
const loginForm=read("components/studio/StudioLoginForm.tsx");
const proxy=read("proxy.ts");

test("client context is distinct and resolves projects only through canonical RPC",()=>{
 assert.match(context,/getClientPortalContext/);
 assert.match(context,/membership\.role!=="client"/);
 assert.match(context,/db\.rpc\("client_portal_list_projects"\)/);
 assert.doesNotMatch(context,/\.from\("studio_projects"\)/);
 assert.match(context,/projects\.find\(item=>item\.id===selectedProjectId\)/);
});

test("client layout requires authentication membership and one active project",()=>{
 assert.match(clientLayout,/getClientPortalContext/);
 assert.match(clientLayout,/serverAppPath\("client","\/client\/login"\)/);
 assert.match(clientLayout,/if\(!context\.membership\|\|!context\.project\)redirect\(`\$\{clientLogin\}\?error=access`\)/);
 assert.match(clientPage,/notFound\(\)/);
});

test("client role never renders the Studio shell",()=>{
 const clientGuard=studioLayout.indexOf('if (context.membership.role === "client") redirect(await serverAppPath("client","/client"))');
 const shell=studioLayout.indexOf("<StudioShell");
 assert.ok(clientGuard>0&&shell>clientGuard);
 assert.match(studioLayout,/owner: "Studio Sahibi"/);
 assert.match(studioLayout,/team_member:/);
});

test("login destination is role aware and cannot be supplied by the request",()=>{
 assert.match(loginRoute,/select\("organization_id,status,role"\)/);
 assert.match(loginRoute,/membership\.role==="client"\?appDestination\("client","\/client",host\):appDestination\("studio","\/studio",host\)/);
 assert.doesNotMatch(loginRoute,/body\.data\.(destination|role|redirect)/);
 assert.match(loginForm,/router\.replace\(result\.destination\|\|"\/studio"\)/);
});

test("session refresh covers both Studio and client route namespaces",()=>{
 assert.match(proxy,/request\.nextUrl\.pathname === "\/client"/);
 assert.match(proxy,/request\.nextUrl\.pathname\.startsWith\("\/client\/"\)/);
 assert.match(proxy,/refreshStudioSession\(request, \(\) => NextResponse\.next/);
});
