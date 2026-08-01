import "server-only";
import { getStudioContext } from "@/lib/studio/auth/get-studio-context";
import { createStudioServerClient } from "@/lib/studio/supabase/server";
import { fallbackStageDescription, validateStageDescription } from "./stage-description-generator";

export async function generateAiStageDescription(stageId: string, currentDescription: string) {
  const context = await getStudioContext();
  if (!context?.user || !context.membership || context.membership.role !== "owner") throw new Error("forbidden");
  const db = await createStudioServerClient();
  const { data, error } = await db.from("studio_project_stages").select("id,title,is_archived,project:studio_projects!inner(name,category,organization_id)").eq("id", stageId).eq("organization_id", context.membership.organization_id).single();
  if (error || !data) throw new Error("stage_not_found");
  if (data.is_archived) throw new Error("stage_archived");
  const project = Array.isArray(data.project) ? data.project[0] : data.project;
  const safeCurrent = currentDescription.normalize("NFC").replace(/[<>]/g, "").trim().slice(0, 1500);
  const fallback = fallbackStageDescription({ stageTitle: data.title, projectName: project.name, projectType: project.category, currentDescription: safeCurrent });
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { description: fallback, generatedBy: "template" as const };
  try {
    const response = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ model: process.env.OPENAI_PROJECT_MODEL || "gpt-5-mini", instructions: "ARZ Mimarlık proje aşaması için profesyonel, kısa, açık ve müşteri dostu bir Türkçe açıklama yaz. Teknik olarak ölçülü ol; gerçekleşmemiş bir işi tamamlanmış gibi sunma. 50-150 kelime kullan. HTML, markdown, başlık veya madde işareti kullanma. Yalnız açıklama metnini döndür.", input: JSON.stringify({ stage_title: data.title, project_name: project.name, project_type: project.category || null, current_description: safeCurrent || null }), max_output_tokens: 350 }), signal: AbortSignal.timeout(30_000), cache: "no-store" });
    if (!response.ok) return { description: fallback, generatedBy: "template" as const };
    const body = await response.json() as { output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
    const output = body.output_text ?? body.output?.flatMap((item) => item.content ?? []).find((item) => item.type === "output_text")?.text;
    return { description: validateStageDescription(output ?? ""), generatedBy: "ai" as const };
  } catch {
    return { description: fallback, generatedBy: "template" as const };
  }
}
