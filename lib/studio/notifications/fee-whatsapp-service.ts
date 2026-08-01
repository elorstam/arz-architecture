import "server-only";
import { getStudioContext } from "@/lib/studio/auth/get-studio-context";
import { createStudioServerClient } from "@/lib/studio/supabase/server";
import { validateEditableFeeMessage } from "./fee-message-generator";
import { sendStudioDocumentNotification } from "./whatsapp-document-service";

export async function sendFeeAssessmentWhatsApp(id: string, editableMessage: string) {
  const context = await getStudioContext();
  if (!context?.user || !context.membership || context.membership.role !== "owner") throw new Error("forbidden");
  const db = await createStudioServerClient();
  const organizationId = context.membership.organization_id;
  const { data, error } = await db.from("studio_project_obligations").select("id,project_id,title,amount,due_date,assessment_file_id,entity_type").eq("id", id).eq("organization_id", organizationId).single();
  if (error || !data || data.entity_type !== "fee") throw new Error("fee_not_found");
  if (!data.assessment_file_id) throw new Error("assessment_required");
  const amount = Number(data.amount);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("fee_amount_required");
  const message = validateEditableFeeMessage(editableMessage);
  const result = await sendStudioDocumentNotification({ projectId: data.project_id, sourceType: "fee", sourceId: data.id, fileId: data.assessment_file_id, templateName: "fee_ai_message_document", variables: { message, fee_name: data.title, amount: String(amount), due_date: data.due_date ?? "Belirtilmedi" }, parameters: [message] });
  if (!result.idempotent) {
    const { error: updateError } = await db.from("studio_project_obligations").update({ status: "client_notified", client_notified_at: new Date().toISOString(), updated_by: context.user.id }).eq("id", id).eq("organization_id", organizationId);
    if (updateError) throw updateError;
  }
  return result;
}
