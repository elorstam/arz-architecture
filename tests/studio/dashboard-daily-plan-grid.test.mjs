import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const source=readFileSync(new URL("../../components/studio/dashboard/StudioDailyFocus.tsx",import.meta.url),"utf8");

test("daily plan uses one six-column row from the xl breakpoint",()=>{
  assert.match(source,/grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6/);
  assert.doesNotMatch(source,/2xl:grid-cols-6|min-\[1440px\]:grid-cols-6|xl:grid-cols-3|auto-fit|flex-wrap/);
});

test("daily plan cards remain compact without a minimum width",()=>{
  assert.match(source,/min-h-\[132px\]/);
  assert.match(source,/!rounded-\[18px\]/);
  assert.doesNotMatch(source,/min-w-\[[^\]]+\]/);
  assert.doesNotMatch(source,/item\.context[^<]*<\/p>.*truncate/);
});
