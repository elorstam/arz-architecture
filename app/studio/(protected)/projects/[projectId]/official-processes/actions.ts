"use server";
import { revalidatePath } from "next/cache";
import { archiveOfficialProcess, archiveCustomFee, createCustomFee, issueOfficialProcessDeletionConfirmation, notifyOfficialProcess, permanentlyDeleteOfficialProcess, restoreOfficialProcess, updateOfficialProcess } from "@/lib/studio/official-processes/official-process-repository";
import { recordOfficialProcessNotification } from "@/lib/studio/notifications/notification-repository";

export type ProcessActionState = { success: boolean; message: string };
const value = (form: FormData, key: string) => String(form.get(key) ?? "");
const file = (form: FormData, key: string) => value(form, key) || null;

export async function updateOfficialProcessAction(id: string, _state: ProcessActionState, form: FormData): Promise<ProcessActionState> {
  try {
    const projectId = await updateOfficialProcess(id, { status: value(form, "status"), amount: value(form, "amount"), dueDate: value(form, "dueDate"), responsibleParty: value(form, "responsibleParty"), description: value(form, "description"), isClientVisible: form.get("isClientVisible") === "on", assessmentFileId: file(form, "assessmentFileId"), receiptFileId: file(form, "receiptFileId"), receivedDocumentFileId: file(form, "receivedDocumentFileId") });
    revalidatePath(`/studio/projects/${projectId}/official-processes`);
    return { success: true, message: "Süreç güncellendi." };
  } catch (error) {
    if (error instanceof Error && error.message === "document_required") return { success: false, message: "Evrak Alındı durumuna geçmeden önce alınan evrakı yükleyin." };
    if (error instanceof Error && error.message === "amount_invalid") return { success: false, message: "Manuel harç tutarı pozitif bir değer olmalıdır." };
    return { success: false, message: "Resmî süreç şu anda güncellenemedi." };
  }
}

export async function createCustomFeeAction(projectId: string, _state: ProcessActionState, form: FormData): Promise<ProcessActionState> {
  try { await createCustomFee(projectId, value(form, "title")); revalidatePath(`/studio/projects/${projectId}/official-processes`); return { success: true, message: "Özel harç oluşturuldu." }; }
  catch { return { success: false, message: "Özel harç oluşturulamadı." }; }
}

export async function notifyOfficialProcessAction(id: string) { await recordOfficialProcessNotification(id); const projectId = await notifyOfficialProcess(id); revalidatePath(`/studio/projects/${projectId}/official-processes`); }
export async function archiveCustomFeeAction(id: string) { const projectId = await archiveCustomFee(id); revalidatePath(`/studio/projects/${projectId}/official-processes`); }
export async function archiveOfficialProcessAction(id: string) { const projectId = await archiveOfficialProcess(id); revalidatePath(`/studio/projects/${projectId}/official-processes`); }
export async function restoreOfficialProcessAction(id: string) { const projectId = await restoreOfficialProcess(id); revalidatePath(`/studio/projects/${projectId}/official-processes?view=archive`); }
export async function prepareOfficialProcessDeletionAction(id: string, name: string) { try { return { ok: true, token: await issueOfficialProcessDeletionConfirmation(id, name) }; } catch { return { ok: false, message: "Süreç adı doğrulanamadı." }; } }
export async function permanentlyDeleteOfficialProcessAction(id: string, token: string, reason: string) { try { await permanentlyDeleteOfficialProcess(id, token, reason); revalidatePath("/studio/projects", "layout"); return { ok: true }; } catch { return { ok: false, message: "Süreç kalıcı olarak silinemedi." }; } }

export async function generateFeeWhatsAppMessageAction(id: string) {
  try { const { generateAiFeeWhatsAppMessage } = await import("@/lib/studio/notifications/fee-ai-message-service"); return { success: true, ...(await generateAiFeeWhatsAppMessage(id)) }; }
  catch (error) { const code = error instanceof Error ? error.message : ""; return { success: false, message: "", generatedBy: "template" as const, error: code === "fee_amount_required" ? "Manuel harç tutarını girin." : "AI mesajı şu anda oluşturulamadı." }; }
}

export async function sendFeeAssessmentWhatsAppAction(id: string, message: string) {
  try {
    const { sendFeeAssessmentWhatsApp } = await import("@/lib/studio/notifications/fee-whatsapp-service");
    await sendFeeAssessmentWhatsApp(id, message);
    return { success: true, message: "Tahakkuk WhatsApp ile gönderildi." };
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const messages: Record<string, string> = { assessment_required: "Tahakkuk belgesi bağlı değil.", fee_amount_required: "Manuel harç tutarını girin.", fee_message_invalid: "Mesaj metni geçersiz.", customer_phone_missing: "Müşteri telefon numarası bulunmuyor.", crm_customer_missing: "CRM müşterisi bulunmuyor.", whatsapp_opt_in_required: "WhatsApp bildirim izni bulunmuyor.", whatsapp_not_configured: "WhatsApp henüz yapılandırılmadı." };
    return { success: false, message: messages[code] ?? "Tahakkuk WhatsApp ile gönderilemedi." };
  }
}
