import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

import {
  appBaseUrl,
  appDestination,
  clientNavigationPath,
  createClientInvitationUrl,
  getHostRouteDecision,
  isInfrastructurePath,
  scopeForHostname,
} from "../../lib/routing/app-domains.ts";

const read=path=>readFileSync(new URL(`../../${path}`,import.meta.url),"utf8");

test("app base URLs preserve local path prefixes and normalize production URLs",()=>{
  const previous={
    site:process.env.NEXT_PUBLIC_SITE_URL,
    studio:process.env.NEXT_PUBLIC_STUDIO_URL,
    client:process.env.NEXT_PUBLIC_CLIENT_PORTAL_URL,
  };
  try{
    process.env.NEXT_PUBLIC_SITE_URL="http://localhost:3000/";
    process.env.NEXT_PUBLIC_STUDIO_URL="http://localhost:3000/studio/";
    process.env.NEXT_PUBLIC_CLIENT_PORTAL_URL="http://localhost:3000/client/";
    assert.equal(appBaseUrl("public"),"http://localhost:3000");
    assert.equal(appBaseUrl("studio"),"http://localhost:3000/studio");
    assert.equal(appBaseUrl("client"),"http://localhost:3000/client");

    process.env.NEXT_PUBLIC_SITE_URL="https://arzmimarlik.net/";
    process.env.NEXT_PUBLIC_STUDIO_URL="https://portal.arzmimarlik.net/";
    process.env.NEXT_PUBLIC_CLIENT_PORTAL_URL="https://client.arzmimarlik.net/";
    assert.equal(appBaseUrl("public"),"https://arzmimarlik.net");
    assert.equal(appBaseUrl("studio"),"https://portal.arzmimarlik.net");
    assert.equal(appBaseUrl("client"),"https://client.arzmimarlik.net");
  }finally{
    for(const [key,value] of Object.entries({NEXT_PUBLIC_SITE_URL:previous.site,NEXT_PUBLIC_STUDIO_URL:previous.studio,NEXT_PUBLIC_CLIENT_PORTAL_URL:previous.client})){
      if(value===undefined)delete process.env[key];else process.env[key]=value;
    }
  }
});

test("public production host keeps public routes and redirects legacy app prefixes",()=>{
  assert.equal(getHostRouteDecision("arzmimarlik.net","/").kind,"next");
  assert.deepEqual(getHostRouteDecision("arzmimarlik.net","/studio/projects","?view=grid"),{kind:"redirect",url:"https://portal.arzmimarlik.net/projects?view=grid"});
  assert.deepEqual(getHostRouteDecision("arzmimarlik.net","/client/files","?project=abc"),{kind:"redirect",url:"https://client.arzmimarlik.net/files?project=abc"});
});

test("Studio host clean paths rewrite to the existing internal route tree",()=>{
  assert.deepEqual(getHostRouteDecision("portal.arzmimarlik.net","/"),{kind:"rewrite",pathname:"/studio"});
  assert.deepEqual(getHostRouteDecision("portal.arzmimarlik.net","/projects"),{kind:"rewrite",pathname:"/studio/projects"});
  assert.deepEqual(getHostRouteDecision("portal.arzmimarlik.net","/projects/00000000-0000-0000-0000-000000000000"),{kind:"rewrite",pathname:"/studio/projects/00000000-0000-0000-0000-000000000000"});
  assert.deepEqual(getHostRouteDecision("portal.arzmimarlik.net","/studio/projects"),{kind:"redirect",url:"https://portal.arzmimarlik.net/projects"});
});

test("Client host clean paths rewrite with dynamic tokens and query handled separately",()=>{
  assert.deepEqual(getHostRouteDecision("client.arzmimarlik.net","/"),{kind:"rewrite",pathname:"/client"});
  assert.deepEqual(getHostRouteDecision("client.arzmimarlik.net","/login"),{kind:"rewrite",pathname:"/client/login"});
  assert.deepEqual(getHostRouteDecision("client.arzmimarlik.net","/invite/TOKEN"),{kind:"rewrite",pathname:"/client/invite/TOKEN"});
  assert.deepEqual(getHostRouteDecision("client.arzmimarlik.net","/renders"),{kind:"rewrite",pathname:"/client/renders"});
  assert.deepEqual(getHostRouteDecision("client.arzmimarlik.net","/files","?project=UUID"),{kind:"rewrite",pathname:"/client/files"});
  assert.deepEqual(getHostRouteDecision("client.arzmimarlik.net","/client/renders"),{kind:"redirect",url:"https://client.arzmimarlik.net/renders"});
});

test("infrastructure and API paths are never app-prefixed",()=>{
  for(const path of ["/_next/static/app.js","/_next/image","/_vercel/insights","/api/client/profile","/favicon.ico","/robots.txt","/sitemap.xml"]){
    assert.equal(isInfrastructurePath(path),true,path);
    assert.equal(getHostRouteDecision("client.arzmimarlik.net",path).kind,"next",path);
    assert.equal(getHostRouteDecision("portal.arzmimarlik.net",path).kind,"next",path);
  }
  assert.match(read("proxy.ts"),/matcher: \["\/\(\(\?!api\|admin\|_next\|_vercel\|\.\*\\\\\.\.\*\)\.\*\)"\]/);
});

test("localhost retains slash-prefixed development routes without production redirects",()=>{
  for(const path of ["/studio","/studio/projects","/client","/client/login","/client/invite/token"]){
    assert.equal(getHostRouteDecision("localhost:3000",path).kind,"next",path);
    assert.equal(getHostRouteDecision("127.0.0.1:3000",path).kind,"next",path);
  }
  assert.equal(scopeForHostname("localhost:3000"),"local");
});

test("navigation and auth destinations are clean only on their production host",()=>{
  assert.equal(clientNavigationPath("studio","/studio/projects","/projects"),"/projects");
  assert.equal(clientNavigationPath("studio","/studio/projects","/studio"),"/studio/projects");
  assert.equal(clientNavigationPath("client","/client/renders","/renders"),"/renders");
  assert.equal(appDestination("studio","/studio/projects","portal.arzmimarlik.net"),"/projects");
  assert.equal(appDestination("client","/client","client.arzmimarlik.net"),"/");
  assert.equal(appDestination("client","/client","portal.arzmimarlik.net"),"https://client.arzmimarlik.net/");
  assert.equal(appDestination("studio","/studio","localhost:3000"),"/studio");
  for(const path of ["/client/stages","/client/files","/client/profile","/client/notifications"]){
    assert.equal(appDestination("client",path,"localhost:3000"),path);
    assert.equal(appDestination("client",path,"client.arzmimarlik.net"),path.slice("/client".length));
  }
});

test("invitation links use Client Portal origin in production and keep localhost compatibility",()=>{
  assert.equal(createClientInvitationUrl("https://portal.arzmimarlik.net/api/studio/projects/id/client-invitations","a".repeat(64)),`https://client.arzmimarlik.net/invite/${"a".repeat(64)}`);
  assert.equal(createClientInvitationUrl("http://localhost:3000/api/studio/projects/id/client-invitations","b".repeat(64)),`http://localhost:3000/client/invite/${"b".repeat(64)}`);
  const createRoute=read("app/api/studio/projects/[projectId]/client-invitations/route.ts");
  assert.match(createRoute,/createClientInvitationUrl/);
  assert.doesNotMatch(createRoute,/console\.log\([^)]*invitation_token/);
});

test("public chrome, noindex, themes and host-only Supabase cookies stay isolated",()=>{
  assert.match(read("app/layout.tsx"),/internalAppHost=\{hostScope === "studio" \|\| hostScope === "client"\}/);
  assert.match(read("components/PublicSiteChrome.tsx"),/if\(internalAppHost\|\|pathname\.startsWith\("\/admin"\)/);
  assert.match(read("app/client/layout.tsx"),/robots:\{index:false,follow:false\}/);
  assert.match(read("app/studio/\(protected\)/layout.tsx"),/robots:\{index:false,follow:false\}/);
  assert.match(read("components/studio/StudioHeader.tsx"),/ThemeToggle/);
  assert.match(read("components/client-portal/ClientPortalHeader.tsx"),/ThemeToggle/);
  assert.doesNotMatch(read("lib/studio/supabase/middleware.ts"),/domain\s*:/i);
});

test("environment contract exposes all three non-secret origins",()=>{
  const env=read(".env.example");
  assert.match(env,/NEXT_PUBLIC_SITE_URL=https:\/\/arzmimarlik\.net/);
  assert.match(env,/NEXT_PUBLIC_STUDIO_URL=https:\/\/portal\.arzmimarlik\.net/);
  assert.match(env,/NEXT_PUBLIC_CLIENT_PORTAL_URL=https:\/\/client\.arzmimarlik\.net/);
});
