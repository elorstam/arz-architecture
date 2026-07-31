"use server";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {StudioQuoteError} from "@/lib/studio/quotes/quote-errors";
import {approveStudioQuote,archiveStudioQuote,cancelStudioQuote,convertQuoteToProject,createStudioQuote,expireStudioQuote,markStudioQuoteSent,rejectStudioQuote,updateStudioQuote} from "@/lib/studio/quotes/quote-repository";
import type {QuoteConversionState,QuoteFormState} from "@/lib/studio/quotes/quote-types";
import {parseStudioQuoteForm,quoteConversionSchema} from "@/lib/studio/quotes/quote-validation";

function quoteError(error:unknown,values?:QuoteFormState["values"]):QuoteFormState{if(error instanceof StudioQuoteError){
 if(error.code==="invalid_lead")return{success:false,message:error.message,values,fieldErrors:{leadId:[error.message]}};
 if(error.code==="financial")return{success:false,message:error.message,values,fieldErrors:{items:[error.message]}};
 if(error.code==="forbidden"||error.code==="unauthorized")return{success:false,message:"Bu işlem için yetkiniz bulunmuyor.",values};
 if(error.code==="read_only"||error.code==="invalid_transition")return{success:false,message:error.message,values};
 }console.error("Studio quote action failed.",error);return{success:false,message:"Teklif işlemi tamamlanamadı. Lütfen tekrar deneyin.",values};}
function refreshQuote(quoteId?:string){revalidatePath("/studio/quotes");revalidatePath("/studio");revalidatePath("/studio/crm");if(quoteId)revalidatePath(`/studio/quotes/${quoteId}`);}
export async function createStudioQuoteAction(_state:QuoteFormState,formData:FormData):Promise<QuoteFormState>{const parsed=parseStudioQuoteForm(formData);if(!parsed.success)return{success:false,message:"Lütfen işaretli alanları kontrol edin.",values:parsed.values,fieldErrors:parsed.fieldErrors};
 let quoteId:string;try{quoteId=await createStudioQuote(parsed.input);}catch(error){return quoteError(error,parsed.values);}refreshQuote(quoteId);redirect(`/studio/quotes/${quoteId}`);}
export async function updateStudioQuoteAction(quoteId:string,_state:QuoteFormState,formData:FormData):Promise<QuoteFormState>{const parsed=parseStudioQuoteForm(formData);if(!parsed.success)return{success:false,message:"Lütfen işaretli alanları kontrol edin.",values:parsed.values,fieldErrors:parsed.fieldErrors};
 try{await updateStudioQuote(quoteId,parsed.input);}catch(error){return quoteError(error,parsed.values);}refreshQuote(quoteId);redirect(`/studio/quotes/${quoteId}`);}
async function statusAction(quoteId:string,operation:(id:string)=>Promise<void>){await operation(quoteId);refreshQuote(quoteId);}
export async function markStudioQuoteSentAction(quoteId:string){await statusAction(quoteId,markStudioQuoteSent);}
export async function approveStudioQuoteAction(quoteId:string){await statusAction(quoteId,approveStudioQuote);}
export async function rejectStudioQuoteAction(quoteId:string){await statusAction(quoteId,rejectStudioQuote);}
export async function expireStudioQuoteAction(quoteId:string){await statusAction(quoteId,expireStudioQuote);}
export async function cancelStudioQuoteAction(quoteId:string){await statusAction(quoteId,cancelStudioQuote);}
export async function setStudioQuoteArchivedAction(quoteId:string,archived:boolean){await archiveStudioQuote(quoteId,archived);refreshQuote(quoteId);redirect(archived?"/studio/quotes?archive=archived":`/studio/quotes/${quoteId}`);}
export async function convertStudioQuoteToProjectAction(quoteId:string,_state:QuoteConversionState,formData:FormData):Promise<QuoteConversionState>{
 const values=Object.fromEntries(["name","code","category","stage","status","progress","startDate","targetDate","currentPhase","responsibleUserId"].map(field=>[field,String(formData.get(field)??"")]));
 const parsed=quoteConversionSchema.safeParse(values);if(!parsed.success)return{success:false,message:"Proje bilgilerini kontrol edin.",fieldErrors:parsed.error.flatten().fieldErrors};
 let projectId:string;try{projectId=await convertQuoteToProject(quoteId,parsed.data);}catch(error){if(error instanceof StudioQuoteError)return{success:false,message:error.message};console.error("Quote conversion failed.",error);return{success:false,message:"Teklif projeye dönüştürülemedi."};}
 refreshQuote(quoteId);revalidatePath("/studio/projects");revalidatePath(`/studio/crm`);redirect(`/studio/projects/${projectId}`);
}
