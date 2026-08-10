import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const globals = readFileSync("app/globals.css", "utf8");
const client = readFileSync("app/client/client-portal.css", "utf8");
const profile = readFileSync("components/client-portal/ClientProfilePage.tsx", "utf8");

test("effective action palette resolves to the final graphite RGB contract", () => {
  const colors = Object.fromEntries(
    [...globals.matchAll(/--(studio-action-primary(?:-hover|-pressed)?):\s*(#[0-9a-f]{6})/gi)]
      .map((match) => [match[1], match[2].toLowerCase()]),
  );
  assert.deepEqual(colors, {
    "studio-action-primary": "#444b51",
    "studio-action-primary-hover": "#525a61",
    "studio-action-primary-pressed": "#393f44",
  });
  assert.equal(parseInt(colors["studio-action-primary"].slice(1, 3), 16), 68);
  assert.equal(parseInt(colors["studio-action-primary"].slice(3, 5), 16), 75);
  assert.equal(parseInt(colors["studio-action-primary"].slice(5, 7), 16), 81);
  assert.doesNotMatch(globals, /--studio-action-primary:\s*#626970/i);
});

test("shared primary, active navigation and segmented controls resolve through the token", () => {
  for (const selector of [
    "studio-button--primary",
    "studio-tab-active",
    "studio-tab--icon-navigation.studio-tab-active",
    "studio-tab--workspace-navigation.studio-tab-active",
    "studio-segmented button.is-active",
  ]) {
    assert.match(globals, new RegExp(`${selector.replaceAll(".", "\\.")}[^}]*var\\(--studio-action-primary\\)`));
  }
  assert.match(client, /client-center-tabs[\s\S]*var\(--studio-action-primary\)/);
  assert.match(profile, /studioButtonClass\("primary", "md"\)/);
  assert.doesNotMatch(profile, /bg-black/);
});

test("Client typography contract wins later route CSS through narrow scoped important floors", () => {
  assert.match(client, /studio-page-description[^}]*font-size:15px!important[^}]*line-height:1\.5!important/);
  assert.match(client, /client-project-facts dt[^}]*font-size:13px!important/);
  assert.match(client, /client-project-facts dd[^}]*font-size:14px!important/);
  assert.match(client, /client-finance-list button strong[^}]*font-size:14px!important/);
  assert.match(client, /client-finance-list button span[^}]*font-size:13px!important/);
  assert.match(client, /client-card-subtitle[^}]*font-size:15px!important/);
  assert.match(client, /studio-empty-v2 p[^}]*font-size:14px!important/);
  assert.match(client, /\[class~="text-\[10px\]"\][^}]*font-size:13px!important/);
  assert.match(client, /\[class~="text-xs"\][^}]*font-size:14px!important/);
  assert.match(client, /client-project-navigation \.studio-tab--workspace-navigation \{ font-size:\.8125rem/);
});
