import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const read=path=>readFileSync(path,"utf8");
const card=read("components/studio/projects/StudioProjectCard.tsx");
const page=read("components/studio/projects/StudioProjectsPage.tsx");
const timeline=read("components/studio/projects/StudioProjectCardMilestoneTimeline.tsx");
const icons=read("components/studio/StudioIcons.tsx");

test("project cards replace the dark thumbnail hero with a compact icon hierarchy",()=>{
 assert.doesNotMatch(card,/project\.thumbnail/);
 assert.doesNotMatch(card,/bg-\[#1b2731\]/);
 assert.match(card,/StudioIconSurface/);
 assert.match(card,/min-h-\[350px\]/);
 assert.match(card,/StudioProjectStatusBadge/);
 assert.match(card,/StudioBadge variant="info"/);
 assert.match(card,/Son güncelleme:/);
 assert.match(card,/Projeye Git/);
});

test("project category icon map is shared through StudioIcons",()=>{
 for(const icon of["house","store","warehouse","factory","coffee","utensils","hotel","armchair","image","building"]){
  assert.match(card,new RegExp(`icon:\"${icon}\"`));
  assert.match(icons,new RegExp(`(?:\\||,)${icon}(?:\"|:)`));
 }
});

test("project grid, milestones and empty state stay compact and responsive",()=>{
 assert.match(page,/md:grid-cols-2 xl:grid-cols-3/);
 assert.match(page,/StudioEmptyState/);
 assert.match(timeline,/h-2\.5 w-2\.5 flex-1 rounded-full/);
 assert.match(timeline,/title=\{`\$\{item\.fullTitle\}/);
 assert.match(timeline,/�?u an:/);
 assert.match(timeline,/Sonraki:/);
});
