import "server-only";
import { getStudioContext } from "@/lib/studio/auth/get-studio-context";
import { createStudioProjectFileDownload } from "@/lib/studio/files/file-repository";
import { createStudioServerClient } from "@/lib/studio/supabase/server";
import { sendWhatsAppDocument, uploadWhatsAppDocument } from "./whatsapp-media-adapter";

export async function sendStudioDocumentNotification(input: {
  projectId: string;
  sourceType: "fee" | "project_stage" | "custom";
  sourceId: string;
  fileId: string;
  templateName: string;
  variables: Record<string, string>;
  parameters?: string[];
}) {
  const context = await getStudioContext();
  if (!context?.user || !context.membership || context.membership.role !== "owner") throw new Error("forbidden");
  const db = await createStudioServerClient();
  const organizationId = context.membership.organization_id;
  const { data: project } = await db.from("studio_projects").select("name,client_name,client_phone").eq("id", input.projectId).eq("organization_id", organizationId).single();
  if (!project?.client_phone) throw new Error("customer_phone_missing");
  const { data: leads } = await db.from("studio_leads").select("id,whatsapp_opt_in,whatsapp_phone").eq("organization_id", organizationId).eq("phone", project.client_phone).eq("is_archived", false).limit(2);
  if (leads?.length !== 1) throw new Error("crm_customer_missing");
  if (!leads[0].whatsapp_opt_in) throw new Error("whatsapp_opt_in_required");
  const { data: existing } = await db.from("studio_notifications").select("id").eq("organization_id", organizationId).eq("source_type", input.sourceType).eq("source_id", input.sourceId).eq("template_name", input.templateName).in("status", ["queued", "sent", "delivered", "read"]).limit(1).maybeSingle();
  if (existing) return { ok: true as const, idempotent: true };

  const download = await createStudioProjectFileDownload(input.projectId, input.fileId);
  const response = download.kind === "stream" ? download.response : await fetch(download.url, { cache: "no-store" });
  const mime = response.headers.get("content-type")?.split(";")[0] ?? "";
  const { data: notification, error } = await db.from("studio_notifications").insert({ organization_id: organizationId, project_id: input.projectId, crm_lead_id: leads[0].id, source_type: input.sourceType, source_id: input.sourceId, channel: "whatsapp", status: "queued", template_name: input.templateName, template_version: 1, variables_snapshot: input.variables, recipient_snapshot: { phone: "***" }, created_by: context.user.id }).select("id").single();
  if (error) throw error;
  const media = await uploadWhatsAppDocument(response, download.fileName, mime);
  if (!media.ok) {
    await db.from("studio_notifications").update({ status: "failed", safe_error_code: media.errorCode }).eq("id", notification.id);
    throw new Error(media.errorCode);
  }
  const sent = await sendWhatsAppDocument({ phone: leads[0].whatsapp_phone || project.client_phone, templateName: input.templateName, parameters: input.parameters ?? Object.values(input.variables), mediaId: media.mediaId, fileName: download.fileName, mimeType:mime });
  await db.from("studio_notification_attachments").insert({ organization_id: organizationId, notification_id: notification.id, file_id: input.fileId, status: sent.ok ? "sent" : "failed", provider_media_id: media.mediaId, provider_message_id: sent.ok ? sent.messageId : null, safe_error_code: sent.ok ? null : sent.errorCode });
  await db.from("studio_notifications").update(sent.ok ? { status: "sent", provider_message_id: sent.messageId, sent_at: new Date().toISOString() } : { status: "failed", safe_error_code: sent.errorCode }).eq("id", notification.id);
  if (!sent.ok) throw new Error(sent.errorCode);
  return { ok: true as const, idempotent: false };
}
