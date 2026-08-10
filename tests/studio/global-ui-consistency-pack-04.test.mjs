import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const globals=readFileSync("app/globals.css","utf8");
const client=readFileSync("app/client/client-portal.css","utf8");
const tabs=readFileSync("components/studio/StudioTabs.tsx","utf8");
const button=readFileSync("components/studio/StudioButton.tsx","utf8");
const projectTabs=readFileSync("components/studio/projects/StudioProjectTabs.tsx","utf8");
const sidebar=readFileSync("components/studio/StudioSidebar.tsx","utf8");

test("one canonical graphite action palette drives shared controls",()=>{assert.match(globals,/--studio-action-primary:\s*#626970/);assert.match(globals,/--studio-action-primary-hover:\s*#70777e/i);assert.match(globals,/--studio-action-primary-pressed:\s*#555c62/i);for(const selector of["studio-button--primary","studio-tab-active","studio-tab--icon-navigation.studio-tab-active","studio-tab--workspace-navigation.studio-tab-active","studio-segmented button.is-active"])assert.match(globals,new RegExp(`${selector.replaceAll(".","\\.")}[^}]*var\\(--studio-action-primary\\)`))});
test("Studio and Client navigation share the token and retain geometry",()=>{assert.match(tabs,/studio-tab-active/);assert.match(client,/client-center-tabs[\s\S]*var\(--studio-action-primary\)/);assert.match(client,/client-project-navigation \.studio-tab--workspace-navigation \{ font-size:\.8125rem/);assert.doesNotMatch(projectTabs,/Görevler/);assert.match(projectTabs,/Takvim/);assert.match(globals,/@media \(min-width:1280px\)[\s\S]*font-size:\.8125rem/)});
test("semantic primary and active rules no longer use the old dark tokens",()=>{const semantic=globals.match(/\.studio-root \.studio-(?:button--primary|tab-active|tab--icon-navigation\.studio-tab-active|tab--workspace-navigation\.studio-tab-active|segmented button\.is-active)[^}]*\}/g)?.join("\n")??"";assert.doesNotMatch(semantic,/#303840|#17232e|var\(--studio-navy\)|var\(--studio-active\)/i);assert.match(button,/studio-button--\$\{variant\}/)});
test("status danger and sidebar semantics stay outside the action migration",()=>{assert.match(globals,/studio-button--destructive[^}]*#884b3c/);assert.match(globals,/studio-badge--success[^}]*#e9f3ed/);assert.match(sidebar,/studio-sidebar/);assert.doesNotMatch(sidebar,/studio-action-primary/)});
test("Client supporting typography has readable scoped floors",()=>{assert.match(client,/client-payment-request__description[^}]*font-size:\.875rem/);assert.match(client,/client-payment-request dt[^}]*font-size:\.8125rem/);assert.match(client,/client-payment-request dd[^}]*font-size:\.875rem/);assert.match(client,/studio-empty-v2 p \{ font-size:\.875rem/);assert.match(client,/client-notification-meta[^}]*font-size:\.8125rem/)});
