import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const repository = fs.readFileSync("lib/studio/notifications/notification-repository.ts", "utf8");
const flexRepository = fs.readFileSync("lib/studio/notifications/stage-flex-repository.ts", "utf8");
const page = fs.readFileSync("app/studio/(protected)/projects/[projectId]/stages/page.tsx", "utf8");
const ui = fs.readFileSync("components/studio/notifications/StudioProjectStages.tsx", "utf8");
const actions = fs.readFileSync("app/studio/(protected)/projects/[projectId]/stages/actions.ts", "utf8");

test("active and archived stages use separate organization-scoped queries", () => {
  assert.match(repository, /listActiveProjectStages/);
  assert.match(repository, /listArchivedProjectStages/);
  assert.match(repository, /\.eq\("is_archived",archived\)/);
  assert.match(page, /view === "archive" \? archivedStages : activeStages/);
});

test("archive view has counts, accessible navigation and empty states", () => {
  assert.match(ui, /aria-label="Aşama görünümü"/);
  assert.match(ui, /aria-current=/);
  assert.match(ui, /Aktif Aşamalar:/);
  assert.match(ui, /Aşama arşivinde kayıt bulunmuyor\./);
  assert.match(ui, /Bu proje için aktif aşama bulunmuyor\./);
});

test("archived cards preserve files but expose only restore mutation", () => {
  assert.match(ui, /function ArchivedStage/);
  assert.match(ui, /archived \/>/);
  assert.match(ui, /aşamasını geri al/);
  assert.doesNotMatch(ui.slice(ui.indexOf("function ArchivedStage"), ui.indexOf("export default function")), /WhatsApp ile Gönder/);
});

test("restore appends safely and never hard deletes", () => {
  assert.match(flexRepository, /eq\("project_id",s\.row\.project_id\)\.order\("sort_order"/);
  assert.match(flexRepository, /error\.code!=="23505"/);
  assert.doesNotMatch(flexRepository, /\.delete\(/);
});

test("WhatsApp copy and disabled reasons are explicit", () => {
  assert.doesNotMatch(ui, /Müşteriye Bildir/);
  assert.match(ui, /WhatsApp ile Gönder/);
  assert.match(ui, /WhatsApp Önizlemesi/);
  assert.match(ui, /Aşama henüz tamamlanmadı\./);
  assert.match(ui, /WhatsApp bildirim izni bulunmuyor\./);
  assert.match(ui, /WhatsApp telefon numarası bulunmuyor\./);
  assert.match(ui, /Gönderilecek PDF bulunmuyor\./);
  assert.match(ui, /DWG WhatsApp belge gönderiminde desteklenmiyor\./);
});

test("server rejects archived stages before sending", () => {
  assert.match(repository, /if\(data\.is_archived\)throw new Error\("stage_archived"\)/);
  assert.ok(actions.indexOf("sendStageWhatsAppDocuments") < actions.indexOf("sendStageNotification(id)"));
  assert.match(actions, /Arşivlenmiş aşamalar için WhatsApp bildirimi gönderilemez\./);
});
