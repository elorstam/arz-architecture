import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const read=path=>readFileSync(path,"utf8");
const page=read("app/studio/(protected)/projects/[projectId]/page.tsx");
const header=read("components/studio/projects/StudioProjectDetailHeader.tsx");
const overview=read("components/studio/projects/StudioProjectOverview.tsx");
const activity=read("components/studio/projects/StudioProjectActivity.tsx");
const team=read("components/studio/projects/StudioProjectTeam.tsx");
const client=read("components/studio/projects/StudioProjectClientCard.tsx");
const milestones=read("components/studio/projects/StudioProjectMilestones.tsx");

test("project overview removes tag management without changing other project routes",()=>{
 assert.doesNotMatch(page,/StudioEntityTags/);
 assert.doesNotMatch(page,/components\/studio\/tags/);
 assert.match(page,/StudioProjectTabs/);
 assert.doesNotMatch(page,/StudioOfficialProcessSummary/);
});

test("project hero uses the light dashboard surface with real project context",()=>{
 assert.match(header,/bg-\[#f7f9fc\]/);
 assert.match(header,/StudioIconSurface/);
 assert.doesNotMatch(header,/bg-\[#15212d\]/);
 for(const label of["Sorumlu kişi","Son güncelleme","Sonraki kilometre taşı","Oluşturma tarihi","İlerleme"])assert.match(header,new RegExp(label));
 assert.match(header,/StudioProjectStatusBadge/);
 assert.match(header,/StudioBadge variant="info"/);
});

test("project overview follows the three-row dashboard card hierarchy",()=>{
 for(const title of["Proje Özeti","Sıradaki Adım","Proje Ekibi","Müşteri Bilgileri","Önemli Tarihler","Son Aktivite","Proje Notları"])assert.match(`${overview}${activity}${team}${client}${milestones}`,new RegExp(title));
 assert.match(overview,/xl:grid-cols-3/);
 assert.match(overview,/StudioCard/);
 assert.match(overview,/StudioIconSurface/);
 assert.match(activity,/StudioActivityIcon/);
 assert.doesNotMatch(overview,/textarea/);
});
