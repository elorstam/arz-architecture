import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

const css = await readFile(new URL("../../app/globals.css", import.meta.url), "utf8");
const studioStyles = css.slice(css.indexOf("/* ARZ Studio visual system"), css.indexOf("html[data-theme=\"light\"] .site-header", css.indexOf("/* ARZ Studio visual system")));

test("Studio typography scale is scoped away from the public site", () => {
  assert.match(studioStyles, /\.studio-root \{/);
  assert.match(studioStyles, /\.studio-root \[class~="text-\[9px\]"\]/);
  assert.doesNotMatch(studioStyles, /(?:^|\n)(?:h1|h2|h3|label|input|select|textarea)\s*\{/);
});

test("Studio content and controls use readable minimum sizes", () => {
  assert.match(studioStyles, /\.studio-root \[class~="text-\[10px\]"\][\s\S]*?font-size: var\(--studio-font-helper\)/);
  assert.match(studioStyles, /\.studio-root \.text-xs[\s\S]*?font-size: \.875rem/);
  assert.match(studioStyles, /\.studio-root \.text-sm[\s\S]*?font-size: \.9375rem/);
  assert.match(studioStyles, /:where\(input, select, textarea\)[\s\S]*?font-size: var\(--studio-font-content\)/);
  assert.match(studioStyles, /\.studio-button \{[^}]*min-height:2\.875rem[^}]*font-size:\.9375rem[^}]*font-weight:650/);
  assert.match(studioStyles, /\.studio-root \.studio-button--primary \{[^}]*color:#fff !important/);
  assert.match(studioStyles, /\.studio-card__title \{[^}]*font-size:var\(--studio-font-card-title\)/);
});

test("Studio headings follow the premium hierarchy", () => {
  assert.match(studioStyles, /:where\(h1\)[\s\S]*?font-size: clamp\(1\.75rem,[^;]+2rem\)/);
  assert.match(studioStyles, /:where\(h2\)[\s\S]*?font-size: var\(--studio-font-section-title\)/);
  assert.match(studioStyles, /:where\(h3\)[\s\S]*?font-size: 1\.0625rem/);
});

test("mobile form controls retain the anti-zoom size", () => {
  assert.match(studioStyles, /@media \(max-width:639px\)/);
  assert.match(studioStyles, /\.studio-root input,\.studio-root select,\.studio-root textarea \{ font-size:1rem; \}/);
});
