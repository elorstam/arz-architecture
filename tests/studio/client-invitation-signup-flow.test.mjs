import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

const read=path=>readFile(path,"utf8");

test("valid invitation signup creates a confirmed user then signs in and accepts in one request",async()=>{
  const route=await read("app/api/client/invitations/accept/route.ts");
  assert.match(route,/getInvitationPreview/);
  assert.match(route,/preview\.state!=="valid"&&preview\.state!=="accepted"/);
  assert.match(route,/auth\.admin\.createUser\(\{[\s\S]*?email:preview\.email![\s\S]*?email_confirm:true/);
  assert.match(route,/user_metadata:\{full_name:input\.data\.name\}/);
  const create=route.indexOf("auth.admin.createUser");
  const signIn=route.indexOf("signInInvitationUser(preview.email!");
  const accept=route.indexOf('rpc("studio_accept_client_invitation"');
  assert.ok(create>-1&&signIn>create&&accept>signIn);
  assert.match(route,/resolveAuthenticatedDestination\(\)[\s\S]*?destination\.kind!=="client"/);
  assert.match(route,/destination:appDestination\("client","\/client"/);
  assert.doesNotMatch(route,/auth\.signUp|status:202|doğrulamak için e-posta/);
});

test("existing and previously unconfirmed users authenticate without password overwrite",async()=>{
  const route=await read("app/api/client/invitations/accept/route.ts");
  assert.match(route,/email_exists/);
  assert.match(route,/user_already_exists/);
  assert.match(route,/signInWithPassword\(\{email,password\}\)/);
  assert.match(route,/error\?\.code==="email_not_confirmed"/);
  assert.match(route,/updateUserById\(user\.id,\{email_confirm:true\}\)/);
  assert.doesNotMatch(route,/updateUserById\([^\n]+password|admin\.updateUser[^\n]+password/);
  assert.match(route,/Davet e-postası için şifre hatalı/);
});

test("invitation identity and secrets remain server controlled",async()=>{
  const[route,form,auth]=await Promise.all([
    read("app/api/client/invitations/accept/route.ts"),
    read("components/client-portal/ClientInvitationForm.tsx"),
    read("lib/client-portal/auth.ts"),
  ]);
  assert.match(route,/normalized\(user\.email\?\?""\)!==normalized\(preview\.email\?\?""\)/);
  assert.match(route,/p_token:input\.data\.token/);
  assert.match(auth,/process\.env\.SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(form,/SUPABASE_SERVICE_ROLE_KEY|createClientInvitationAdminClient|email_confirm/);
  assert.doesNotMatch(route+auth,/console\.(log|info|warn)/);
  assert.doesNotMatch(route,/console\.error/);
  assert.doesNotMatch(route,/user_metadata:[\s\S]{0,100}(password|token)/);
});

test("client login fields remain vertically stacked and scoped away from the public site",async()=>{
  const[form,styles,layout]=await Promise.all([
    read("components/client-portal/ClientLoginForm.tsx"),
    read("app/client/client-portal.css"),
    read("app/client/layout.tsx"),
  ]);
  assert.match(form,/className="client-auth-form mt-8"/);
  assert.ok(form.indexOf('id="client-email"')<form.indexOf('id="client-password"'));
  assert.match(styles,/\.client-auth-form\s*\{[\s\S]*?display:\s*grid[\s\S]*?gap:\s*1\.25rem/);
  assert.match(styles,/\.client-auth-form \.studio-control\s*\{[\s\S]*?display:\s*block/);
  assert.match(styles,/\.client-auth-form \.studio-control > span\s*\{[\s\S]*?display:\s*block[\s\S]*?margin-bottom/);
  assert.match(styles,/\.client-auth-form \.studio-control input\s*\{[\s\S]*?width:\s*100%[\s\S]*?min-height:\s*2\.875rem/);
  assert.match(styles,/input:-webkit-autofill/);
  assert.match(layout,/\.\/client-portal\.css/);
  assert.doesNotMatch(styles,/(^|\n)\s*(input|label)\s*\{/);
  assert.doesNotMatch(styles,/@media[^}]+client-auth-form[\s\S]{0,200}(grid-template-columns|flex-direction:\s*row)/);
});
