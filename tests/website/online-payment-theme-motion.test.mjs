import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";
const read=path=>readFile(new URL(`../../${path}`,import.meta.url),"utf8");
const[page,css,motion]=await Promise.all([read("app/[locale]/online-odeme/page.tsx"),read("app/[locale]/online-odeme/OnlinePaymentPage.module.css"),read("components/online-payment/OnlinePaymentMotion.tsx")]);

test("online payment page uses scoped light and dark theme tokens",()=>{
  assert.match(css,/--payment-bg:#080808/);assert.match(css,/:global\(html\[data-theme="light"\]\) \.page/);
  assert.match(css,/--payment-bg:#f7f7f5/);assert.match(css,/--payment-fg:#171715/);assert.match(css,/--payment-card:#fff/);
  assert.match(css,/background:var\(--payment-bg\)/);assert.match(css,/color:var\(--payment-fg\)/);
  assert.match(page,/data-payment-page/);
});

test("GSAP reuses public context and ScrollTrigger cleanup pattern",()=>{
  assert.match(motion,/gsap\.context/);assert.match(motion,/ScrollTrigger/);assert.match(motion,/scrollTrigger:/);
  assert.match(motion,/context\.revert\(\)/);assert.match(motion,/ScrollTrigger\.refresh\(\)/);
  assert.match(motion,/opacity:0,y:30/);assert.match(motion,/stagger:/);
});

test("reduced motion never leaves content hidden",()=>{
  assert.match(motion,/prefers-reduced-motion: reduce/);assert.match(motion,/clearProps:"all"/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.doesNotMatch(css,/opacity:0/);
});

test("responsive page safeguards remain present",()=>{
  assert.match(css,/@media\(min-width:680px\)/);assert.match(css,/@media\(min-width:1024px\)/);assert.match(css,/@media\(max-width:420px\)/);
  assert.match(css,/overflow-wrap:anywhere/);
});
