import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const source=readFileSync(new URL("../../components/studio/StudioDashboard.tsx",import.meta.url),"utf8");

test("dashboard operation panels share one desktop row with equal height",()=>{
  assert.match(source,/auto-rows-\[450px\]/);
  assert.match(source,/min-\[1440px\]:h-\[450px\]/);
  assert.match(source,/min-\[1440px\]:grid-cols-\[minmax\(0,1\.45fr\)_minmax\(0,1fr\)_minmax\(0,1fr\)\]/);
});

test("dashboard operation grid keeps laptop and tablet fallback",()=>{
  assert.match(source,/md:grid-cols-2/);
  assert.doesNotMatch(source,/flex-wrap|auto-fit/);
});
