import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const read=path=>readFileSync(path,"utf8");
const clientNav=read("components/client-portal/ClientPortalNavigation.tsx");
const clientHeader=read("components/client-portal/ClientPortalHeader.tsx");
const clientCss=read("app/client/client-portal.css");
const sidebar=read("components/studio/StudioSidebar.tsx");
const globals=read("app/globals.css");

test("Client navigation reuses the canonical project navigation card and tab rail",()=>{
 assert.match(clientNav,/studio-project-tabs-v2 client-project-navigation/);
 assert.match(clientNav,/variant="workspace-navigation"/);
 for(const label of["Genel Bakış","Proje Aşamaları","Renderlar","Dosyalar","Evraklar","Finans \/ Ödemeler","Bildirimler","Profil"])assert.match(clientNav,new RegExp(label));
});

test("Client header shows the existing ARZ logo and subtle v1 wordmark",()=>{
 assert.match(clientHeader,/arz-logo-final\.png/);
 assert.match(clientHeader,/Client Portal <small>v1<\/small>/);
 assert.match(clientCss,/\.client-header__brand img \{ filter:invert\(1\); \}/);
 assert.doesNotMatch(clientHeader,/ThemeToggle|client-theme-toggle/);
});

test("Client Portal is light-only without touching shared theme persistence",()=>{
 assert.match(clientCss,/\.client-route-root \{[^}]*color-scheme:light/);
 assert.match(clientCss,/\.client-portal\.studio-root \{[^}]*--studio-workspace:#f7f9fc[^}]*--studio-surface:#fff[^}]*--studio-surface-muted:#f3f6fa[^}]*--studio-border:#e3e9ef/);
 assert.doesNotMatch(clientCss,/html\[data-theme="dark"\] \.client-(portal|route-root)/);
 assert.doesNotMatch(clientHeader,/persistThemePreference|dataset\.theme|localStorage/);
});

test("Studio sidebar uses neutral slate surfaces and subtle v1 branding",()=>{
 assert.match(sidebar,/ARZ STUDIO<\/span><small className="studio-product-version">v1<\/small>/);
 assert.match(sidebar,/studio-nav-item__icon/);
 assert.match(sidebar,/studio-sidebar-avatar/);
 assert.match(globals,/\.studio-root \.studio-nav-item-active \{[^}]*rgba\(75,108,132,.32\)/);
 assert.doesNotMatch(sidebar+globals,/bg-\[#d4b777\]|#bda16a|#d4b777/);
});
