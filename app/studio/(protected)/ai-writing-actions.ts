"use server";
import {getStudioContext} from "@/lib/studio/auth/get-studio-context";
import {generateStudioAiText} from "@/lib/studio/ai/ai-writing-service";
import type {StudioAiOperation,StudioAiOutputFormat} from "@/lib/studio/ai/ai-writing-types";
const allowed=new Set<StudioAiOperation>(["crm_ai_meeting_note","proposal_ai_description","decision_ai_summary","stage_ai_description"]);
export async function generateStudioFormTextAction(operation:StudioAiOperation,context:Record<string,string|string[]|null>,currentText:string,format:StudioAiOutputFormat){
 try{
  if(!allowed.has(operation))throw new Error("ai_operation_invalid");
  const studio=await getStudioContext();if(!studio?.user||!studio.membership||studio.membership.role!=="owner")throw new Error("forbidden");
  if(operation==="stage_ai_description"){const{generateAiStageDescription}=await import("@/lib/studio/notifications/stage-ai-description-service");const result=await generateAiStageDescription(String(context.sourceRecordId??""),currentText);return{success:true,text:result.description,fallbackUsed:result.generatedBy==="template",message:result.generatedBy==="template"?"Güvenli örnek metin hazırlandı.":undefined};}
  const safeContext=Object.fromEntries(Object.entries(context).slice(0,20).map(([key,value])=>[key,Array.isArray(value)?value.slice(0,30).map(item=>String(item).normalize("NFC").slice(0,300)):value===null?null:String(value).normalize("NFC").replace(/[<>]/g,"").slice(0,2000)]));
  const moduleName=operation==="crm_ai_meeting_note"?"crm":operation==="proposal_ai_description"?"proposals":"decision_log";
  const result=await generateStudioAiText({organizationId:studio.membership.organization_id,userId:studio.user.id,module:moduleName,operation,context:safeContext,currentText,options:{format},metadata:{locale:"tr",output_format:format,tone:"professional"}});
  return{success:true,text:result.text,fallbackUsed:result.fallbackUsed,message:result.fallbackUsed?"Güvenli örnek metin hazırlandı.":undefined};
 }catch{return{success:false,text:"",fallbackUsed:false,message:"AI metni şu anda oluşturulamadı."};}
}
