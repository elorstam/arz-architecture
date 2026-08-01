import "server-only";
import { getStudioContext } from "@/lib/studio/auth/get-studio-context";
import { createStudioServerClient } from "@/lib/studio/supabase/server";
import { generateStudioAiText } from "@/lib/studio/ai/ai-writing-service";
import { validateEditableFeeMessage } from "./fee-message-generator";

export async function generateAiFeeWhatsAppMessage(id: string) {
  const context = await getStudioContext();
  if (!context?.user || !context.membership || context.membership.role !== "owner") throw new Error("forbidden");
  const db = await createStudioServerClient();
  const { data, error } = await db.from("studio_project_obligations").select("id,title,amount,entity_type,project:studio_projects!inner(name,client_name,organization_id)").eq("id", id).eq("organization_id", context.membership.organization_id).single();
  if (error || !data || data.entity_type !== "fee") throw new Error("fee_not_found");
  const project = Array.isArray(data.project) ? data.project[0] : data.project;
  const amount = Number(data.amount);
  const result=await generateStudioAiText({organizationId:context.membership.organization_id,userId:context.user.id,module:"official_processes",operation:"fee_ai_whatsapp_message",context:{customerName:project.client_name,projectName:project.name,feeName:data.title,amount:new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY"}).format(amount)},metadata:{project_id:data.id,source_record_id:data.id,locale:"tr",tone:"professional"}});
  return {message:validateEditableFeeMessage(result.text),generatedBy:result.fallbackUsed?"template" as const:"ai" as const};
}
