import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { generateFeeWhatsAppMessage, validateEditableFeeMessage } from "../../lib/studio/notifications/fee-message-generator.ts";

const migration = readFileSync("supabase/migrations/018_update_project_system_folders.sql", "utf8");
const rollback = readFileSync("supabase/migrations/018_update_project_system_folders.rollback.sql", "utf8");
const constants = readFileSync("lib/studio/files/file-constants.ts", "utf8");
const drive = readFileSync("lib/studio/files/storage/google-drive-mapping.ts", "utf8");
const filesUi = readFileSync("components/studio/files/StudioProjectFilesPage.tsx", "utf8");
const processRepo = readFileSync("lib/studio/official-processes/official-process-repository.ts", "utf8");
const card = readFileSync("components/studio/official-processes/StudioOfficialProcessCard.tsx", "utf8");
const button = readFileSync("components/studio/official-processes/StudioFeeWhatsAppButton.tsx", "utf8");
const service = readFileSync("lib/studio/notifications/fee-whatsapp-service.ts", "utf8");
const delivery = readFileSync("lib/studio/notifications/whatsapp-document-service.ts", "utf8");
const aiService = readFileSync("lib/studio/notifications/fee-ai-message-service.ts", "utf8");
const sharedAiService = readFileSync("lib/studio/ai/ai-writing-service.ts", "utf8");

const folders = ["01 Proje", "02 Statik", "03 Mekanik-Elektrik", "04 Zemin Etüd", "05 Numarataj", "06 İSKİ", "07 Harçlar", "08 Dilekçeler", "09 Yapı Denetim", "10 Ruhsat Evrakları", "11 3D Görseller"];

test("new projects receive the exact visible system folder template", () => {
  for (const folder of folders) { assert.match(constants, new RegExp(folder)); assert.match(migration, new RegExp(folder)); }
  assert.match(migration, /if exists\([\s\S]*is_system[\s\S]*return;/);
  assert.match(migration, /where not exists/);
});

test("legacy archive behavior remains internally mapped and existing projects are untouched", () => {
  assert.match(constants, /STUDIO_INTERNAL_ARCHIVE_FOLDER="08 Arşiv"/);
  assert.match(migration, /\('08 Arşiv',900,true\)/);
  assert.match(drive, /"08 Arşiv"/);
  assert.doesNotMatch(migration, /delete from|update public\.studio_project_folders|drop table/i);
});

test("folder workspace uses the same full-width responsive container", () => {
  assert.match(filesUi, /mx-auto w-full min-w-0 max-w-\[1540px\] px-4/);
  assert.match(filesUi, /sm:px-6/);
  assert.match(filesUi, /lg:px-8/);
});

test("manual fee amount is optional but positive when supplied", () => {
  assert.match(card, /Manuel Harç Tutarı \(₺\)/);
  assert.match(card, /min="0\.01"/);
  assert.match(processRepo, /amount!==null&&\(!Number\.isFinite\(amount\)\|\|amount<=0\)/);
});

test("AI fee message is deterministic, Turkish and amount-aware", () => {
  const message = generateFeeWhatsAppMessage({ customerName: "Ayşe Çelik", projectName: "Çatı Projesi", feeName: "İmar Harcı", amount: 450000 });
  assert.match(message, /Merhaba Sayın Ayşe Çelik/);
  assert.match(message, /Çatı Projesi/);
  assert.match(message, /İmar Harcı/);
  assert.match(message, /450\.000,00/);
  assert.equal(validateEditableFeeMessage(message), message);
});

test("AI generation is server-only and safely falls back to the validated template", () => {
  assert.match(aiService, /server-only/);
  assert.match(aiService, /generateStudioAiText/);
  assert.match(sharedAiService, /api\.openai\.com\/v1\/responses/);
  assert.match(sharedAiService, /OPENAI_API_KEY/);
  assert.match(sharedAiService, /fallbackStudioAiText/);
  assert.doesNotMatch(button, /OPENAI_API_KEY|Bearer/);
});

test("preview is editable, accessible and shows recipient, phone, PDF and character count", () => {
  assert.match(button, /AI Mesaj Oluştur/);
  assert.match(button, /role="dialog"/);
  assert.match(button, /textarea/);
  assert.match(button, /2000 karakter/);
  assert.match(button, /Tahakkuk PDF’i/);
  assert.match(button, /Gönderilecek müşteri/);
  assert.match(button, /WhatsApp ile Gönder/);
});

test("server delivery preserves private PDF, notification idempotency and timeline audit", () => {
  assert.match(service, /validateEditableFeeMessage/);
  assert.match(service, /fee_ai_message_document/);
  assert.match(service, /status: "client_notified"/);
  assert.match(delivery, /createStudioProjectFileDownload/);
  assert.match(delivery, /studio_notifications/);
  assert.match(delivery, /studio_notification_attachments/);
  assert.doesNotMatch(service + delivery, /anyone-with-link|public Drive|access_token/i);
});

test("migration and rollback are transaction balanced", () => {
  assert.equal((migration.match(/\bbegin;/gi) ?? []).length, (migration.match(/\bcommit;/gi) ?? []).length);
  assert.equal((rollback.match(/\bbegin;/gi) ?? []).length, (rollback.match(/\bcommit;/gi) ?? []).length);
});
