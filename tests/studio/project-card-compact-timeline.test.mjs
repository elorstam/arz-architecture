import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
test("project card timelines use bounded profile milestones",()=>{
 const mapper=fs.readFileSync("lib/studio/projects/project-mappers.ts","utf8");
 assert.match(mapper,/VISUAL_CARD_MILESTONES/);
 assert.match(mapper,/Modelleme.*Kaplama.*Işık.*İlk Render.*Revize.*Final Render.*Teslim/s);
 assert.doesNotMatch(mapper,/visual\?source\.map/);
});
