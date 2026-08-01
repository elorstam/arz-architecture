import "server-only";
import { getStudioContext } from "@/lib/studio/auth/get-studio-context";
import { createStudioServerClient } from "@/lib/studio/supabase/server";
import { generateStudioAiText } from "@/lib/studio/ai/ai-writing-service";

export async function generateAiStageDescription(stageId: string, currentDescription: string) {
  const context = await getStudioContext();
  if (!context?.user || !context.membership || context.membership.role !== "owner") throw new Error("forbidden");
  const db = await createStudioServerClient();
  const { data, error } = await db.from("studio_project_stages").select("id,title,is_archived,project:studio_projects!inner(name,category,organization_id)").eq("id", stageId).eq("organization_id", context.membership.organization_id).single();
  if (error || !data) throw new Error("stage_not_found");
  if (data.is_archived) throw new Error("stage_archived");
  const project = Array.isArray(data.project) ? data.project[0] : data.project;
  const safeCurrent = currentDescription.normalize("NFC").replace(/[<>]/g, "").trim().slice(0, 1500);
  const result=await generateStudioAiText({organizationId:context.membership.organization_id,userId:context.user.id,module:"project_stages",operation:"stage_ai_description",context:{stageTitle:data.title,projectName:project.name,projectType:project.category||null},currentText:safeCurrent,options:{maxOutputTokens:350},metadata:{project_id:data.id,source_record_id:stageId,locale:"tr",tone:"customer_friendly"}});
  return {description:result.text,generatedBy:result.fallbackUsed?"template" as const:"ai" as const};
}
