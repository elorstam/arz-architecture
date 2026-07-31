"use server";

import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {StudioLeadError} from "@/lib/studio/crm/lead-errors";
import {archiveStudioLead,createStudioLead,updateStudioLead} from "@/lib/studio/crm/lead-repository";
import type {LeadFormState} from "@/lib/studio/crm/lead-types";
import {parseStudioLeadForm} from "@/lib/studio/crm/lead-validation";

function actionError(error:unknown,values:LeadFormState["values"]):LeadFormState{
 if(error instanceof StudioLeadError){
  if(error.code==="invalid_assignee")return{success:false,message:error.message,values,fieldErrors:{assignedUserId:[error.message]}};
  if(error.code==="forbidden"||error.code==="unauthorized")return{success:false,message:"Bu işlem için yetkiniz bulunmuyor.",values};
  if(error.code==="not_found")return{success:false,message:"Lead bulunamadı.",values};
 }
 console.error("Studio CRM action failed.",error);return{success:false,message:"CRM işlemi tamamlanamadı. Lütfen tekrar deneyin.",values};
}
export async function createStudioLeadAction(_previous:LeadFormState,formData:FormData):Promise<LeadFormState>{
 const parsed=parseStudioLeadForm(formData);if(!parsed.success)return{success:false,message:"Lütfen işaretli alanları kontrol edin.",values:parsed.values,fieldErrors:parsed.fieldErrors};
 let leadId:string;try{leadId=await createStudioLead(parsed.input);}catch(error){return actionError(error,parsed.values);}
 revalidatePath("/studio/crm");revalidatePath("/studio");redirect(`/studio/crm/${leadId}`);
}
export async function updateStudioLeadAction(leadId:string,_previous:LeadFormState,formData:FormData):Promise<LeadFormState>{
 const parsed=parseStudioLeadForm(formData);if(!parsed.success)return{success:false,message:"Lütfen işaretli alanları kontrol edin.",values:parsed.values,fieldErrors:parsed.fieldErrors};
 try{await updateStudioLead(leadId,parsed.input);}catch(error){return actionError(error,parsed.values);}
 revalidatePath("/studio/crm");revalidatePath(`/studio/crm/${leadId}`);revalidatePath("/studio");redirect(`/studio/crm/${leadId}`);
}
export async function setStudioLeadArchivedAction(leadId:string,archived:boolean){
 await archiveStudioLead(leadId,archived);revalidatePath("/studio/crm");revalidatePath(`/studio/crm/${leadId}`);revalidatePath("/studio");
 redirect(archived?"/studio/crm?archive=archived":`/studio/crm/${leadId}`);
}
