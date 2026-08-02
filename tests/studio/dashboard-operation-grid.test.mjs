import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const source=readFileSync(new URL("../../components/studio/StudioDashboard.tsx",import.meta.url),"utf8");

test("dashboard operation panels share one desktop row with equal height",()=>{
  assert.match(source,/dashboard-operation-grid grid w-full min-w-0/);
  assert.match(source,/auto-rows-\[410px\]/);
  assert.match(source,/xl:h-\[410px\]/);
  assert.match(source,/xl:grid-cols-\[1\.35fr_1fr_1fr\]/);
  assert.match(source,/\[&>\*\]:min-w-0 \[&>\*\]:overflow-hidden/);
});

test("dashboard operation grid keeps laptop and tablet fallback",()=>{
  assert.match(source,/md:grid-cols-2/);
  assert.doesNotMatch(source,/min-\[1440px\]:grid-cols|flex-wrap|auto-fit|col-span|row-span/);
});
