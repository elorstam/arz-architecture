import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const read=path=>readFileSync(new URL(`../../${path}`,import.meta.url),"utf8");
const page=read("app/studio/login/page.tsx");
const form=read("components/studio/StudioLoginForm.tsx");
const css=read("app/globals.css");
const clientPage=read("app/client/login/page.tsx");
const clientForm=read("components/client-portal/ClientLoginForm.tsx");
const homeLink=read("components/AuthHomeLink.tsx");

test("Studio login reuses the approved auth card composition and Studio branding",()=>{
  assert.match(page,/arz-auth-root studio-login-root flex min-h-screen items-center justify-center bg-\[#F7F9FC\] p-5 text-\[#17232e\]/);
  assert.match(page,/StudioCard className="w-full max-w-\[460px\] border border-\[#e4eaf0\] bg-white p-7 shadow-\[0_24px_70px_rgba\(31,48,65,\.09\)\] sm:p-10"/);
  assert.match(page,/arz-logo-final\.png/);
  assert.match(page,/ARZ Studio/);
  assert.match(page,/Ekibiniz için güvenli çalışma alanı/);
  assert.doesNotMatch(page,/Müşteri Portalı|Studio Core|theme-dark-surface|StudioIconSurface|studio-root studio-login-root/);
});

test("email and password are accessible full-width vertical Studio controls",()=>{
  assert.ok(form.indexOf('id="studio-email"')<form.indexOf('id="studio-password"'));
  assert.match(form,/className="studio-auth-form mt-8"/);
  assert.match(form,/StudioInput id="studio-email" label="E-posta"/);
  assert.match(form,/StudioInput id="studio-password" label="Şifre"/);
  assert.match(css,/\.studio-auth-form \{[^}]*display:grid;[^}]*gap:1\.25rem/);
  assert.match(css,/\.studio-auth-form \.studio-control>span \{[^}]*display:block;[^}]*margin-bottom:\.5rem/);
  assert.match(css,/\.studio-auth-form \.studio-control input \{[^}]*width:100%;[^}]*min-height:2\.875rem/);
});

test("Studio login error, focus and autofill remain readable",()=>{
  assert.match(form,/role="alert" className="rounded-xl bg-\[#fff1f0\] px-4 py-3 text-sm text-\[#9f3a38\]"/);
  assert.match(css,/studio-auth-form \.studio-control input:focus/);
  assert.match(css,/studio-auth-form \.studio-control input:-webkit-autofill/);
  assert.match(css,/-webkit-text-fill-color:#17232e/);
});

test("Studio login has scoped light and dark responsive surfaces",()=>{
  assert.match(clientPage,/arz-auth-root client-login-root flex min-h-screen/);
  assert.match(css,/html\[data-theme="light"\] \.arz-auth-root \{ background:#f7f9fc!important; color:#17232e/);
  assert.match(css,/html\[data-theme="light"\] \.arz-auth-root>\.studio-card-v2 \{ border-color:#d1dae3!important; background:#fff!important/);
  assert.match(css,/html\[data-theme="light"\] \.arz-auth-root \.auth-login-logo \{ filter:invert\(1\); \}/);
  assert.match(css,/html\[data-theme="dark"\] \.arz-auth-root \.auth-login-logo \{ filter:none; \}/);
  assert.match(css,/html\[data-theme="dark"\] :where\(\.studio-login-root,\.client-login-root\) \{ background:#0f1720!important/);
  assert.match(css,/html\[data-theme="dark"\] :where\(\.studio-login-root,\.client-login-root\)>\.studio-card-v2/);
  assert.match(css,/html\[data-theme="dark"\] \.client-login-root>\.studio-card-v2>h1/);
  assert.doesNotMatch(css,/\.studio-root \.studio-login-card/);
});

test("auth, subdomain routing and Client login implementation remain intact",()=>{
  assert.match(form,/fetch\("\/api\/studio\/auth\/login"/);
  assert.match(form,/router\.replace\(result\.destination\|\|"\/studio"\)/);
  assert.match(page,/redirect\("\/studio"\)/);
  assert.match(read("proxy.ts"),/getHostRouteDecision/);
  assert.match(read("components/PublicSiteChrome.tsx"),/internalAppHost/);
  assert.match(clientPage,/Müşteri Portalı/);
  assert.match(clientForm,/client-auth-form mt-8/);
});

test("Studio and Client login use identical master geometry",()=>{
  const clientMain=clientPage.match(/<main className="arz-auth-root client-login-root ([^"]+)"/)?.[1];
  const studioMain=page.match(/<main className="arz-auth-root studio-login-root ([^"]+)"/)?.[1];
  assert.equal(studioMain,clientMain);
  const card=/StudioCard className="([^"]+)"/;
  assert.equal(page.match(card)?.[1],clientPage.match(card)?.[1]);
  for(const className of['mt-10 text-[11px] font-semibold uppercase tracking-[.24em] text-[#6b8290]','mt-2 text-3xl font-semibold tracking-[-.035em]','mt-3 text-sm leading-6 text-[#64748b]']){
    assert.ok(page.includes(className));
    assert.ok(clientPage.includes(className));
  }
  assert.match(page,/min-h-14/);
  assert.doesNotMatch(page,/StudioIconSurface/);
  assert.match(form,/studioButtonClass\("primary"\).*w-full justify-center/);
  assert.match(clientForm,/studioButtonClass\("primary"\).*w-full justify-center/);
});

test("Studio and Client login share one responsive public home link outside card geometry",()=>{
  assert.match(page,/<AuthHomeLink \/>/);
  assert.match(clientPage,/<AuthHomeLink \/>/);
  assert.match(homeLink,/appOrigin\("public"\)/);
  assert.match(homeLink,/isLocalHostname\(requestHost\)/);
  assert.match(homeLink,/new URL\(`\$\{protocol\}:\/\/\$\{requestHost\}`\)\.origin/);
  assert.match(homeLink,/Anasayfaya dön/);
  assert.match(homeLink,/auth-home-link fixed left-5 top-5 z-\[9999\]/);
  assert.match(homeLink,/sm:left-7 sm:top-7/);
  assert.match(homeLink,/"Century Gothic", Arial, Helvetica, sans-serif/);
  assert.doesNotMatch(css,/\.auth-home-link \{[^}]*position:/);
  assert.match(css,/data-theme="dark"[^}]*auth-home-link/);
});

test("login logos keep their existing box while preserving source aspect ratio",()=>{
  for(const source of [page,clientPage]){
    assert.match(source,/width=\{116\} height=\{38\} priority className="auth-login-logo h-\[38px\] w-\[116px\] object-contain object-left"/);
  }
});
