import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fallbackStageDescription, validateStageDescription } from "../../lib/studio/notifications/stage-description-generator.ts";
import { validateOptionalStageDates } from "../../lib/studio/notifications/stage-validation.ts";

const ui = readFileSync("components/studio/notifications/StudioProjectStages.tsx", "utf8");
const actions = readFileSync("app/studio/(protected)/projects/[projectId]/stages/actions.ts", "utf8");
const repository = readFileSync("lib/studio/notifications/stage-flex-repository.ts", "utf8");
const aiService = readFileSync("lib/studio/notifications/stage-ai-description-service.ts", "utf8");
const sharedAiService = readFileSync("lib/studio/ai/ai-writing-service.ts", "utf8");
const sharedDialog = readFileSync("components/studio/ai/StudioAiWritingDialog.tsx", "utf8");

test("both stage dates are optional independently and together", () => {
  const updateStageRepository = repository.slice(
    repository.indexOf("export async function updateFlexibleStage"),
    repository.indexOf("export async function duplicateStage"),
  );
  assert.deepEqual(validateOptionalStageDates("", ""), { startedAt: null, completedAt: null });
  assert.deepEqual(validateOptionalStageDates("2026-08-02", ""), { startedAt: "2026-08-02", completedAt: null });
  assert.deepEqual(validateOptionalStageDates("", "2026-08-03"), { startedAt: null, completedAt: "2026-08-03" });
  assert.match(repository, /started_at:dates\.startedAt,completed_at:dates\.completedAt/);
  assert.doesNotMatch(updateStageRepository, /new Date\(\)\.toISOString\(\)/);
});

test("entered dates must be real and completion cannot precede start", () => {
  assert.throws(() => validateOptionalStageDates("2026-02-30", ""), /stage_start_date_invalid/);
  assert.throws(() => validateOptionalStageDates("", "not-a-date"), /stage_completion_date_invalid/);
  assert.throws(() => validateOptionalStageDates("2026-08-03", "2026-08-02"), /stage_date_order_invalid/);
  assert.deepEqual(validateOptionalStageDates("2026-08-02", "2026-08-02"), { startedAt: "2026-08-02", completedAt: "2026-08-02" });
});

test("fallback description is professional, bounded and project aware", () => {
  const description = fallbackStageDescription({ stageTitle: "Mimari Proje Hazırlandı", projectName: "Villa A", projectType: "Konut" });
  const words = description.split(/\s+/).length;
  assert.ok(words >= 50 && words <= 150);
  assert.match(description, /Villa A/);
  assert.match(description, /Mimari Proje Hazırlandı/);
  assert.equal(validateStageDescription(description), description);
});

test("AI generation is owner scoped, server-only and has safe fallback", () => {
  assert.match(aiService, /server-only/);
  assert.match(aiService, /membership\.role !== "owner"/);
  assert.match(aiService, /organization_id/);
  assert.match(aiService, /generateStudioAiText/);
  assert.match(sharedAiService, /api\.openai\.com\/v1\/responses/);
  assert.match(sharedAiService, /fallbackStudioAiText/);
  assert.doesNotMatch(ui, /OPENAI_API_KEY|Bearer/);
});

test("AI description dialog supports edit regenerate use and cancel without immediate form mutation", () => {
  assert.match(ui, /triggerLabel="AI ile Oluştur"/);
  assert.match(ui, /StudioAiWritingDialog/);
  assert.match(sharedDialog, /role="dialog"/);
  assert.match(sharedDialog, /Yeniden Oluştur/);
  assert.match(sharedDialog, />Kullan</);
  assert.match(sharedDialog, />İptal</);
  assert.match(sharedDialog, /onUse\(text\)/);
});

test("date errors are safe Turkish field messages", () => {
  assert.match(actions, /Başlangıç tarihi geçersiz\./);
  assert.match(actions, /Tamamlanma tarihi geçersiz\./);
  assert.match(actions, /Tamamlanma tarihi başlangıç tarihinden önce olamaz\./);
  assert.doesNotMatch(ui, /Tarih zorunludur/);
  assert.match(ui, /opsiyonel/);
});
