import {z} from "zod";
import {PROJECT_STAGES,PROJECT_STATUSES} from "../projects/project-constants.ts";
import {QUOTE_CURRENCIES,QUOTE_DISCOUNT_TYPES,QUOTE_STATUSES,QUOTE_UNITS} from "./quote-constants.ts";
import {calculateQuoteTotals} from "./quote-calculations.ts";
import type {QuoteFormValues,StudioQuoteInput} from "./quote-types.ts";

const decimal=z.string().trim().regex(/^\d+(?:[.,]\d{1,3})?$/,"Geçerli bir sayı girin.");
export const quoteStatusSchema=z.enum(QUOTE_STATUSES,{error:"Geçersiz teklif durumu."});
const itemSchema=z.object({serviceName:z.string().trim().min(1,"Hizmet adı zorunludur.").max(200),description:z.string().trim().max(4000),
 quantity:decimal.refine(value=>Number(value.replace(",","."))>0,"Miktar sıfırdan büyük olmalıdır."),
 unit:z.enum(QUOTE_UNITS,{error:"Geçersiz birim."}),unitPrice:decimal.refine(value=>Number(value.replace(",","."))>=0,"Birim fiyat negatif olamaz.")});
export const studioQuoteSchema=z.object({
 leadId:z.uuid("Geçerli bir CRM lead seçin."),title:z.string().trim().min(1,"Teklif başlığı zorunludur.").max(200),
 currency:z.enum(QUOTE_CURRENCIES,{error:"Geçersiz para birimi."}),discountType:z.enum(QUOTE_DISCOUNT_TYPES,{error:"Geçersiz indirim tipi."}),
 discountValue:decimal,taxRate:decimal.refine(value=>Number(value.replace(",","."))<=100,"Vergi oranı 100’den büyük olamaz."),
 validUntil:z.string().trim().refine(value=>!value||/^\d{4}-\d{2}-\d{2}$/.test(value),"Geçerli bir tarih girin."),
 notes:z.string().trim().max(10000),paymentTerms:z.string().trim().max(5000),
 items:z.array(itemSchema).min(1,"Teklif en az bir hizmet kalemi içermelidir.").max(100,"En fazla 100 kalem eklenebilir."),
}).superRefine((value,context)=>{
 if(value.discountType==="Percentage"&&Number(value.discountValue.replace(",","."))>100)context.addIssue({code:"custom",path:["discountValue"],message:"Yüzde indirim 100’den büyük olamaz."});
 try{calculateQuoteTotals(value);}catch(error){if(error instanceof Error&&error.message==="discount_exceeds_subtotal")context.addIssue({code:"custom",path:["discountValue"],message:"İndirim ara toplamdan büyük olamaz."});}
});
export function quoteFormValues(formData:FormData):QuoteFormValues{return{leadId:String(formData.get("leadId")??""),title:String(formData.get("title")??""),currency:String(formData.get("currency")??""),
 discountType:String(formData.get("discountType")??""),discountValue:String(formData.get("discountValue")??""),taxRate:String(formData.get("taxRate")??""),
 validUntil:String(formData.get("validUntil")??""),notes:String(formData.get("notes")??""),paymentTerms:String(formData.get("paymentTerms")??""),items:String(formData.get("items")??"[]")};}
export function parseStudioQuoteForm(formData:FormData){
 const values=quoteFormValues(formData);let items:unknown=[];try{items=JSON.parse(values.items);}catch{items=[];}
 const result=studioQuoteSchema.safeParse({...values,items});
 if(!result.success)return{success:false as const,values,fieldErrors:result.error.flatten().fieldErrors};
 return{success:true as const,values,input:result.data satisfies StudioQuoteInput};
}
export const quoteConversionSchema=z.object({name:z.string().trim().min(1,"Proje adı zorunludur.").max(200),code:z.string().trim().min(1,"Proje kodu zorunludur.").max(40),
 category:z.string().trim().max(120),stage:z.enum(PROJECT_STAGES,{error:"Geçersiz proje aşaması."}),
 status:z.enum(PROJECT_STATUSES.filter(value=>value!=="Arşivlendi") as [Exclude<(typeof PROJECT_STATUSES)[number],"Arşivlendi">,...Exclude<(typeof PROJECT_STATUSES)[number],"Arşivlendi">[]],{error:"Geçersiz proje durumu."}),
 progress:z.coerce.number().int().min(0).max(100),startDate:z.string().trim(),targetDate:z.string().trim(),currentPhase:z.string().trim().max(4000),
 responsibleUserId:z.string().trim().refine(value=>!value||z.uuid().safeParse(value).success,"Geçersiz sorumlu kullanıcı."),
}).superRefine((value,context)=>{if(value.startDate&&value.targetDate&&value.targetDate<value.startDate)context.addIssue({code:"custom",path:["targetDate"],message:"Hedef tarih başlangıç tarihinden önce olamaz."});});
export function isStudioQuoteId(value:string){return z.uuid().safeParse(value).success;}
