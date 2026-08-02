"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import {
  archiveStageAction,
  attachStageFileAction,
  createStageAction,
  duplicateStageAction,
  removeStageFileAction,
  reorderStageAction,
  sendStageNotificationAction,
  toggleStageFileVisibilityAction,
  updateStageAction,
} from "@/app/studio/(protected)/projects/[projectId]/stages/actions";
import { studioButtonClass } from "@/components/studio/StudioButton";
import StudioAiWritingDialog from "@/components/studio/ai/StudioAiWritingDialog";
import {
  PROJECT_STAGE_STATUSES,
  PROJECT_STAGE_STATUS_LABELS,
  type NotificationActionState,
  type StudioNotification,
  type StudioProjectStage,
} from "@/lib/studio/notifications/notification-types";

const initial: NotificationActionState = { success: false, message: "" };
type Attachment = { id: string; stageId: string; fileId: string; name: string; extension: string; customerVisible: boolean };
type FileOption = { id: string; name: string; extension: string };
type WhatsAppReadiness = { hasCustomer: boolean; hasPhone: boolean; hasOptIn: boolean; configured: boolean; templateReady: boolean };

function Create({ projectId }: { projectId: string }) {
  const [state, action, pending] = useActionState(createStageAction.bind(null, projectId), initial);
  return (
    <form action={action} className="mt-5 flex min-w-0 flex-col gap-3 sm:flex-row">
      <label className="min-w-0 flex-1">
        <span className="sr-only">Yeni aşama başlığı</span>
        <input name="title" required minLength={2} maxLength={180} placeholder="Yeni aşama başlığı" className="h-12 w-full min-w-0 rounded-lg border px-4" />
      </label>
      <button disabled={pending} className={studioButtonClass("primary", "md", "shrink-0")}>Yeni Aşama Ekle</button>
      {state.message ? <p role={state.success ? "status" : "alert"}>{state.message}</p> : null}
    </form>
  );
}

function Attach({ projectId, stageId, files }: { projectId: string; stageId: string; files: FileOption[] }) {
  const [state, action, pending] = useActionState(attachStageFileAction.bind(null, projectId, stageId), initial);
  return (
    <form action={action} className="mt-3 flex min-w-0 flex-wrap gap-2">
      <select name="fileId" required className="h-11 min-w-0 flex-1 rounded-lg border px-3">
        <option value="">PDF veya DWG seçin</option>
        {files.map((file) => <option key={file.id} value={file.id}>{file.name}</option>)}
      </select>
      <select name="role" className="h-11 rounded-lg border px-3"><option value="approval_document">Onay belgesi</option><option value="drawing">Çizim</option><option value="report">Rapor</option><option value="submission">Sunum</option><option value="other">Diğer</option></select>
      <label className="flex items-center gap-2"><input type="checkbox" name="visible" /> Müşteriye gönder</label>
      <button disabled={pending} className={studioButtonClass("outline", "sm")}>Dosya Bağla</button>
      {state.message ? <p role={state.success ? "status" : "alert"}>{state.message}</p> : null}
    </form>
  );
}

function whatsappDisabledReason(stage: StudioProjectStage, attachments: Attachment[], readiness: WhatsAppReadiness) {
  if (stage.status !== "completed") return "Aşama henüz tamamlanmadı.";
  if (!stage.isActive) return "Pasif aşamalar için WhatsApp bildirimi gönderilemez.";
  if (!readiness.hasCustomer) return "Projeye bağlı CRM müşterisi bulunmuyor.";
  if (!readiness.hasPhone) return "WhatsApp telefon numarası bulunmuyor.";
  if (!readiness.hasOptIn) return "WhatsApp bildirim izni bulunmuyor.";
  if (!readiness.configured) return "WhatsApp henüz yapılandırılmadı.";
  if (!readiness.templateReady) return "WhatsApp mesaj şablonu hazır değil.";
  const outgoing = attachments.filter((item) => item.customerVisible);
  if (outgoing.some((item) => item.extension.toLowerCase() === "dwg")) return "DWG WhatsApp belge gönderiminde desteklenmiyor.";
  if (!outgoing.some((item) => item.extension.toLowerCase() === "pdf")) return "Gönderilecek PDF bulunmuyor.";
  return null;
}

function AttachmentList({ projectId, attachments, canManage, archived }: { projectId: string; attachments: Attachment[]; canManage: boolean; archived: boolean }) {
  const [, start] = useTransition();
  return (
    <div className="mt-4 border-t pt-4">
      <h4 className="font-semibold">Ekler: {attachments.length}</h4>
      <ul className="mt-2 space-y-2">
        {attachments.map((attachment) => (
          <li key={attachment.id} className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
            <span className="min-w-0 flex-1 break-all">{attachment.name}</span>
            <a href={`/studio/projects/${projectId}/files/${attachment.fileId}`} className={studioButtonClass("ghost", "sm")}>Dosyayı Gör</a>
            <a href={`/studio/projects/${projectId}/files/${attachment.fileId}/download`} className={studioButtonClass("ghost", "sm")}>İndir</a>
            {canManage && !archived ? <>
              <button onClick={() => start(async () => { await toggleStageFileVisibilityAction(projectId, attachment.id, !attachment.customerVisible); })} className={studioButtonClass("outline", "sm")}>{attachment.customerVisible ? "Gönderimden Çıkar" : "Müşteriye Gönder"}</button>
              <button onClick={() => start(async () => { await removeStageFileAction(projectId, attachment.id); })} className={studioButtonClass("outline", "sm")}>Bağlantıyı Kaldır</button>
            </> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function StageDescriptionField({ stageId, initialValue }: { stageId: string; initialValue: string }) {
  const [value, setValue] = useState(initialValue);
  return <div className="grid gap-2 md:col-span-2">
    <div className="flex flex-wrap items-center justify-between gap-2"><label htmlFor={`stage-description-${stageId}`} className="text-sm font-semibold">Açıklama</label><StudioAiWritingDialog operation="stage_ai_description" title="AI Aşama Açıklaması" triggerLabel="AI ile Oluştur" currentText={value} context={{sourceRecordId:stageId}} onUse={setValue}/></div>
    <textarea id={`stage-description-${stageId}`} name="description" value={value} onChange={(event) => setValue(event.target.value)} maxLength={1500} className="min-h-28 w-full rounded-lg border p-3 text-[15px] leading-6" />
  </div>;
}

export function ActiveStage({ projectId, stage, attachments, files, canManage, whatsApp }: { projectId: string; stage: StudioProjectStage; attachments: Attachment[]; files: FileOption[]; canManage: boolean; whatsApp: WhatsAppReadiness }) {
  const [state, action, pending] = useActionState(updateStageAction.bind(null, projectId, stage.id), initial);
  const [busy, start] = useTransition();
  const [preview, setPreview] = useState(false);
  const disabledReason = whatsappDisabledReason(stage, attachments, whatsApp);
  return (
    <li className="min-w-0 rounded-xl border bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="min-w-0 break-words text-lg font-semibold">{stage.sortOrder}. {stage.title}</h3>
        {canManage ? <div className="flex flex-wrap gap-2">
          <button onClick={() => start(async () => { await reorderStageAction(projectId, stage.id, -1); })} className={studioButtonClass("ghost", "sm")}>↑ Yukarı</button>
          <button onClick={() => start(async () => { await reorderStageAction(projectId, stage.id, 1); })} className={studioButtonClass("ghost", "sm")}>↓ Aşağı</button>
          <button onClick={() => start(async () => { await duplicateStageAction(projectId, stage.id); })} className={studioButtonClass("outline", "sm")}>Çoğalt</button>
          <button onClick={() => start(async () => { await archiveStageAction(projectId, stage.id, true); })} className={studioButtonClass("outline", "sm")}>Arşivle</button>
        </div> : null}
      </div>
      {canManage ? <form action={action} className="mt-4 grid gap-3 md:grid-cols-2">
        <label>Başlık<input name="title" defaultValue={stage.title} className="h-11 w-full rounded-lg border px-3" /></label>
        <label>Durum<select name="status" defaultValue={stage.status} className="h-11 w-full rounded-lg border px-3">{PROJECT_STAGE_STATUSES.map((value) => <option key={value} value={value}>{PROJECT_STAGE_STATUS_LABELS[value]}</option>)}</select></label>
        <StageDescriptionField stageId={stage.id} initialValue={stage.description} />
        <label>Başlangıç <span className="font-normal text-slate-500">(opsiyonel)</span><input type="date" name="startedAt" defaultValue={stage.startedAt?.slice(0, 10)} className="h-11 w-full rounded-lg border px-3" /></label>
        <label>Tamamlanma <span className="font-normal text-slate-500">(opsiyonel)</span><input type="date" name="completedAt" defaultValue={stage.completedAt?.slice(0, 10)} className="h-11 w-full rounded-lg border px-3" /></label>
        <label>Not<input name="note" defaultValue={stage.note} className="h-11 w-full rounded-lg border px-3" /></label>
        <label><input type="checkbox" name="isActive" defaultChecked={stage.isActive} /> Aktif</label>
        <label><input type="checkbox" name="isClientVisible" defaultChecked={stage.isClientVisible} /> Müşteriye görünür</label>
        <button disabled={pending} className={studioButtonClass("primary", "sm")}>Aşamayı Kaydet</button>
        {state.message ? <p role={state.success ? "status" : "alert"}>{state.message}</p> : null}
      </form> : <p className="mt-3 text-sm">{stage.description}</p>}
      <AttachmentList projectId={projectId} attachments={attachments} canManage={canManage} archived={false} />
      {canManage ? <Attach projectId={projectId} stageId={stage.id} files={files} /> : null}
      {canManage ? <div className="mt-4">
        <button disabled={Boolean(disabledReason) || busy} aria-label={`WhatsApp ile gönder: ${stage.title}`} aria-describedby={disabledReason ? `whatsapp-reason-${stage.id}` : undefined} onClick={() => setPreview(true)} className={studioButtonClass("secondary", "sm")}>WhatsApp ile Gönder</button>
        {disabledReason ? <p id={`whatsapp-reason-${stage.id}`} className="mt-2 text-sm text-slate-600">{disabledReason}</p> : null}
      </div> : null}
      {preview ? <div role="dialog" aria-modal="true" aria-labelledby={`whatsapp-title-${stage.id}`} className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"><div className="w-full max-w-lg rounded-xl bg-white p-6"><h4 id={`whatsapp-title-${stage.id}`} className="text-xl font-semibold">WhatsApp Önizlemesi</h4><p className="mt-3 text-sm">Güncel aşama adı, açıklaması ve müşteriye görünür PDF ekleri WhatsApp ile gönderilecek.</p><div className="mt-4 flex flex-wrap justify-end gap-2"><button onClick={() => setPreview(false)} className={studioButtonClass("ghost", "sm")}>İptal</button><button onClick={() => start(async () => { await sendStageNotificationAction(projectId, stage.id); setPreview(false); })} className={studioButtonClass("primary", "sm")}>WhatsApp ile Gönder</button></div></div></div> : null}
    </li>
  );
}

function ArchivedStage({ projectId, stage, attachments, canManage }: { projectId: string; stage: StudioProjectStage; attachments: Attachment[]; canManage: boolean }) {
  const [busy, start] = useTransition();
  return (
    <li className="min-w-0 rounded-xl border bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0"><h3 className="break-words text-lg font-semibold">{stage.title}</h3><p className="mt-1 text-sm text-slate-600">Eski sıra: {stage.sortOrder} · Son durum: {PROJECT_STAGE_STATUS_LABELS[stage.status]}</p></div>
        {canManage ? <button disabled={busy} aria-label={`${stage.title} aşamasını geri al`} onClick={() => start(async () => { await archiveStageAction(projectId, stage.id, false); })} className={studioButtonClass("outline", "sm")}>Geri Al</button> : null}
      </div>
      {stage.description ? <p className="mt-3 break-words text-sm">{stage.description}</p> : null}
      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3"><div><dt className="font-semibold">Arşivlenme tarihi</dt><dd>{stage.archivedAt ? new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(new Date(stage.archivedAt)) : "—"}</dd></div><div><dt className="font-semibold">Arşivleyen</dt><dd>{stage.archivedByName ?? "—"}</dd></div><div><dt className="font-semibold">Timeline özeti</dt><dd>Son güncelleme: {new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(new Date(stage.updatedAt))}</dd></div></dl>
      <AttachmentList projectId={projectId} attachments={attachments} canManage={canManage} archived />
    </li>
  );
}

export default function StudioProjectStages({ projectId, stages, notifications, attachments, files, canManage, view, activeCount, archiveCount, whatsApp }: { projectId: string; stages: StudioProjectStage[]; notifications: StudioNotification[]; attachments: Attachment[]; files: FileOption[]; canManage: boolean; view: "active" | "archive"; activeCount: number; archiveCount: number; whatsApp: WhatsAppReadiness }) {
  const progressStages = stages.filter((stage) => view === "active" && stage.isSystem && stage.isActive && !stage.isArchived && stage.status !== "cancelled");
  const completed = progressStages.filter((stage) => stage.status === "completed").length;
  const progress = progressStages.length ? Math.round((completed / progressStages.length) * 100) : 0;
  return (
    <section className="mt-6 min-w-0 space-y-6">
      <div className="rounded-xl border bg-white p-5">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-4"><div><h2 className="text-xl font-semibold">{view === "archive" ? "Aşama Arşivi" : "Aktif Aşamalar"}</h2><p className="mt-1 text-sm">Aktif Aşamalar: {activeCount} · Arşiv: {archiveCount}</p></div>{view === "active" ? <div className="min-w-36"><p className="font-semibold">İlerleme %{progress}</p><div role="progressbar" aria-label="Proje aşaması ilerlemesi" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"><span className="block h-full rounded-full bg-[#9a7b40]" style={{ width: `${progress}%` }} /></div></div> : null}</div>
        <nav aria-label="Aşama görünümü" className="mt-4 flex flex-wrap gap-2">
          <Link href={`/studio/projects/${projectId}/stages`} aria-current={view === "active" ? "page" : undefined} className={studioButtonClass(view === "active" ? "primary" : "outline", "sm")}>Aktif Aşamalar <span aria-hidden="true">({activeCount})</span></Link>
          <Link href={`/studio/projects/${projectId}/stages?view=archive`} aria-current={view === "archive" ? "page" : undefined} className={studioButtonClass(view === "archive" ? "primary" : "outline", "sm")}>Aşama Arşivi <span aria-hidden="true">({archiveCount})</span></Link>
        </nav>
        {canManage && view === "active" ? <Create projectId={projectId} /> : null}
      </div>
      {stages.length === 0 ? <p role="status" className="rounded-xl border border-dashed bg-white p-6">{view === "archive" ? "Aşama arşivinde kayıt bulunmuyor." : "Bu proje için aktif aşama bulunmuyor."}</p> : <ol className="grid min-w-0 gap-4">{stages.map((stage) => { const stageAttachments = attachments.filter((item) => item.stageId === stage.id); return view === "archive" ? <ArchivedStage key={stage.id} projectId={projectId} stage={stage} attachments={stageAttachments} canManage={canManage} /> : <ActiveStage key={stage.id} projectId={projectId} stage={stage} attachments={stageAttachments} files={files} canManage={canManage} whatsApp={whatsApp} />; })}</ol>}
      <div className="rounded-xl border bg-white p-5"><h2 className="text-xl font-semibold">WhatsApp Gönderim Geçmişi</h2>{notifications.length ? <ul className="mt-3 space-y-2">{notifications.map((notification) => <li key={notification.id} className="text-sm">{notification.templateName} · {notification.status}</li>)}</ul> : <p className="mt-2 text-sm">Henüz WhatsApp bildirimi yok.</p>}</div>
    </section>
  );
}
