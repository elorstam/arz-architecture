import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const read=path=>readFileSync(path,"utf8");
const clientRoute=read("app/api/client/auth/login/route.ts");
const studioRoute=read("app/api/studio/auth/login/route.ts");
const clientForm=read("components/client-portal/ClientLoginForm.tsx");
const studioForm=read("components/studio/StudioLoginForm.tsx");
const server=read("lib/studio/supabase/server.ts");
const env=read("lib/studio/env.ts");
const proxy=read("proxy.ts");
const iyzico=read("lib/payments/iyzico/config.ts");

test("Studio and Client login share only the Supabase server auth environment",()=>{assert.match(clientRoute,/createStudioServerClient/);assert.match(studioRoute,/createStudioServerClient/);assert.match(server,/getStudioServerEnv/);assert.match(env,/NEXT_PUBLIC_SUPABASE_URL/);assert.match(env,/NEXT_PUBLIC_SUPABASE_ANON_KEY/);assert.doesNotMatch(env,/IYZICO|SERVICE_ROLE/);});

test("invalid credentials remain 401 and distinct from service failure",()=>{for(const route of[clientRoute,studioRoute]){assert.match(route,/signInWithPassword/);assert.match(route,/status:401/);assert.match(route,/status:503/);}assert.match(clientRoute,/Client giriş servisi şu anda kullanılamıyor/);assert.match(studioRoute,/Studio giriş servisi şu anda kullanılamıyor/);});

test("Client server exceptions always return JSON and empty responses cannot leak JSON parse errors",()=>{assert.match(clientRoute,/catch\(error\)/);assert.match(clientRoute,/NextResponse\.json\(\{error:"Client giriş servisi şu anda kullanılamıyor\."\},\{status:503\}\)/);assert.match(clientForm,/await response\.text\(\)/);assert.match(clientForm,/JSON\.parse\(text\)/);assert.doesNotMatch(clientForm,/await response\.json\(\)/);assert.match(studioForm,/await response\.text\(\)/);});

test("safe next finance destination and redirect protections stay in the login boundary",()=>{assert.match(clientRoute,/safeClientNext\(input\.data\.next\)/);assert.match(clientRoute,/appDestination\("client"/);});

test("auth APIs are excluded from proxy matching and iyzico configuration is lazy payment-only",()=>{assert.match(proxy,/matcher:\s*\["\/\(\(\?!api\|/);assert.doesNotMatch(clientRoute+studioRoute+server+env,/IYZICO_/);assert.match(iyzico,/IYZICO_API_KEY/);});
