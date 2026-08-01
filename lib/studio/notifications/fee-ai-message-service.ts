import "server-only";
import { getStudioContext } from "@/lib/studio/auth/get-studio-context";
import { createStudioServerClient } from "@/lib/studio/supabase/server";
import { generateFeeWhatsAppMessage, validateEditableFeeMessage } from "./fee-message-generator";

export async function generateAiFeeWhatsAppMessage(id: string) {
  const context = await getStudioContext();
  if (!context?.user || !context.membership || context.membership.role !== "owner") throw new Error("forbidden");
  const db = await createStudioServerClient();
  const { data, error } = await db.from("studio_project_obligations").select("id,title,amount,entity_type,project:studio_projects!inner(name,client_name,organization_id)").eq("id", id).eq("organization_id", context.membership.organization_id).single();
  if (error || !data || data.entity_type !== "fee") throw new Error("fee_not_found");
  const project = Array.isArray(data.project) ? data.project[0] : data.project;
  const amount = Number(data.amount);
  const fallback = generateFeeWhatsAppMessage({ customerName: project.client_name, projectName: project.name, feeName: data.title, amount });
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { message: fallback, generatedBy: "template" as const };
  try {
    const response = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ model: process.env.OPENAI_PROJECT_MODEL || "gpt-5-mini", instructions: "ARZ Mimarlık adına profesyonel, kısa ve nazik bir Türkçe WhatsApp tahakkuk mesajı yaz. Verilen müşteri, proje, harç ve tutar bilgisini değiştirme. PDF belgesinin ekte olduğunu ve ödeme sonrası dekont paylaşılabileceğini belirt. Yalnız mesaj metnini döndür; HTML veya markdown kullanma.", input: JSON.stringify({ customer_name: project.client_name, project_name: project.name, fee_name: data.title, amount_try: new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(amount) }), max_output_tokens: 500 }), signal: AbortSignal.timeout(30_000), cache: "no-store" });
    if (!response.ok) return { message: fallback, generatedBy: "template" as const };
    const body = await response.json() as { output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
    const output = body.output_text ?? body.output?.flatMap((item) => item.content ?? []).find((item) => item.type === "output_text")?.text;
    return { message: validateEditableFeeMessage(output ?? ""), generatedBy: "ai" as const };
  } catch {
    return { message: fallback, generatedBy: "template" as const };
  }
}
