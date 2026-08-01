import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const card = readFileSync("components/studio/official-processes/StudioOfficialProcessCard.tsx", "utf8");
const statusBadge = readFileSync("components/studio/official-processes/StudioOfficialProcessStatusBadge.tsx", "utf8");
const documentStatus = readFileSync("components/studio/official-processes/StudioOfficialProcessDocumentStatus.tsx", "utf8");
const timeline = readFileSync("components/studio/official-processes/StudioOfficialProcessTimeline.tsx", "utf8");
const summaryGrid = readFileSync("components/studio/official-processes/StudioOfficialProcessSummaryGrid.tsx", "utf8");
const customFee = readFileSync("components/studio/official-processes/StudioCustomFeeForm.tsx", "utf8");

test("official process cards are compact accessible accordions", () => {
  assert.match(card, /useState\(false\)/);
  assert.match(card, /aria-expanded/);
  assert.match(card, /aria-controls/);
  assert.match(card, /Detayları Aç/);
  assert.match(card, /Detayları Kapat/);
  assert.match(card, /break-words|min-w-0/);
});

test("status and overdue badges always include text", () => {
  assert.match(statusBadge, /STATUS_LABELS\[status\]/);
  assert.match(statusBadge, /Gecikti/);
  assert.match(statusBadge, /Record<OfficialProcessStatus/);
});

test("document summaries distinguish all roles and permissions", () => {
  for (const label of ["Tahakkuk", "Dekont", "Alınan Evrak"]) assert.match(card, new RegExp(label));
  assert.match(documentStatus, /✓ Var/);
  assert.match(documentStatus, /— Yok/);
  assert.match(documentStatus, /canManage/);
  assert.match(documentStatus, /Dosya Bağla/);
  assert.match(documentStatus, /Dosyayı Gör/);
});

test("quick actions preserve notification and received-document guard", () => {
  assert.match(card, /Harç Bildir/);
  assert.match(card, /Ödendi İşaretle/);
  assert.match(card, /Evrak Alındı İşaretle/);
  assert.match(card, /disabled=\{!item\.receivedDocumentFileId\}/);
  assert.match(card, /disabled=\{!item\.assessmentFileId\}/);
});

test("financial summaries exclude cancelled rows and format TRY", () => {
  assert.match(summaryGrid, /status!=="cancelled"/);
  assert.match(summaryGrid, /currency:"TRY"/);
  assert.match(summaryGrid, /Toplam Harç Tutarı/);
  assert.match(summaryGrid, /Ödenen Toplam/);
  assert.match(summaryGrid, /Bekleyen Toplam/);
});

test("timeline defaults to latest event and expands semantically", () => {
  assert.match(timeline, /events\.slice\(0,1\)/);
  assert.match(timeline, /aria-expanded/);
  assert.match(timeline, /<ol/);
  assert.match(timeline, /Timeline’ı Gör/);
});

test("custom fee form is responsive and resets after success", () => {
  assert.match(customFee, /sm:grid-cols/);
  assert.match(customFee, /required/);
  assert.match(customFee, /formRef\.current\?\.reset/);
  assert.match(customFee, /role=\{state\.success\?"status":"alert"\}/);
});
