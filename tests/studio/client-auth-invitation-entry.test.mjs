import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

const read=(path)=>readFile(path,"utf8");

test("client login and invitation routes are isolated from Studio auth",async()=>{
 const[layout,login,invite,logout]=await Promise.all([read("app/client/(portal)/layout.tsx"),read("app/api/client/auth/login/route.ts"),read("app/api/client/invitations/accept/route.ts"),read("components/client-portal/ClientPortalHeader.tsx")]);
 assert.match(layout,/\/client\/login\?next=/);assert.doesNotMatch(layout,/studio\/login/);
 assert.match(login,/resolveAuthenticatedDestination/);assert.match(login,/kind==="staff"/);assert.match(login,/safeClientNext/);
 assert.match(invite,/studio_accept_client_invitation/);assert.match(invite,/staff_membership/);assert.match(invite,/proje erişimi doğrulanamadı/);
 assert.match(logout,/api\/client\/auth\/logout/);assert.match(logout,/client\/login/);
});

test("next validation rejects cross-origin and auth-loop targets",async()=>{
 const source=await read("lib/client-portal/auth.ts");
 assert.match(source,/startsWith\("\/\/"\)/);assert.match(source,/includes\("\\\\"\)/);assert.match(source,/parsed\.origin/);assert.match(source,/startsWith\("\/client"\)/);assert.match(source,/\/client\/invite\//);
});

test("invitation token remains hash-only and transient",async()=>{
 const[auth,owner,form]=await Promise.all([read("lib/client-portal/auth.ts"),read("app/api/studio/projects/[projectId]/client-invitations/route.ts"),read("components/studio/projects/StudioClientInvitationLink.tsx")]);
 assert.match(auth,/createHash\("sha256"\)/);assert.match(auth,/\.eq\("token_hash",hash\)/);assert.doesNotMatch(auth,/console\./);
 assert.match(owner,/studio_create_client_invitation/);assert.match(owner,/NEXT_PUBLIC_SITE_URL/);assert.doesNotMatch(owner,/from\("studio_client_invitations"\).*insert/);
 assert.match(form,/setUrl\(""\)/);assert.match(form,/navigator\.clipboard\.writeText/);assert.doesNotMatch(form,/localStorage|sessionStorage/);
});

test("no migration or RLS implementation is introduced by client entry",async()=>{
 const route=await read("app/api/client/invitations/accept/route.ts");assert.doesNotMatch(route,/create policy|alter table|migration/i);
});
