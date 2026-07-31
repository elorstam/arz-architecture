import {z} from "zod";
import {LEAD_CURRENCIES,LEAD_SERVICE_TYPES,LEAD_SOURCES,LEAD_STAGES,LEAD_STATUSES,TERMINAL_LEAD_STAGES} from "./lead-constants.ts";
import type {LeadFormValues,StudioLeadInput} from "./lead-types.ts";

const optionalDateTime=z.string().trim().refine(value=>!value||!Number.isNaN(Date.parse(value)),"Geçerli bir tarih ve saat girin.");
export const studioLeadSchema=z.object({
 firstName:z.string().trim().min(1,"Ad zorunludur.").max(120,"Ad en fazla 120 karakter olabilir."),
 lastName:z.string().trim().max(120,"Soyad en fazla 120 karakter olabilir."),
 companyName:z.string().trim().max(200,"Firma adı en fazla 200 karakter olabilir."),
 phone:z.string().trim().min(1,"Telefon numarası zorunludur.").max(50,"Telefon numarası en fazla 50 karakter olabilir."),
 email:z.string().trim().refine(value=>!value||z.email().safeParse(value).success,"Geçerli bir e-posta adresi girin."),
 city:z.string().trim().max(120),district:z.string().trim().max(120),
 serviceType:z.enum(LEAD_SERVICE_TYPES,{error:"Geçersiz hizmet tipi."}),
 budgetAmount:z.string().trim().refine(value=>!value||/^\d+(?:[.,]\d{1,2})?$/.test(value),"Geçerli bir tahmini bütçe girin.")
  .refine(value=>!value||Number(value.replace(",","."))>=0,"Tahmini bütçe negatif olamaz."),
 budgetCurrency:z.enum(LEAD_CURRENCIES,{error:"Geçersiz para birimi."}),
 source:z.enum(LEAD_SOURCES,{error:"Geçersiz lead kaynağı."}),
 stage:z.enum(LEAD_STAGES,{error:"Geçersiz lead aşaması."}),
 status:z.enum(LEAD_STATUSES,{error:"Geçersiz lead durumu."}),
 notes:z.string().trim().max(10000,"Not alanı en fazla 10.000 karakter olabilir."),
 assignedUserId:z.string().trim().refine(value=>!value||z.uuid().safeParse(value).success,"Geçersiz sorumlu kullanıcı."),
 lastContactAt:optionalDateTime,nextFollowUpAt:optionalDateTime,
}).superRefine((value,context)=>{
 const terminal=(TERMINAL_LEAD_STAGES as readonly string[]).includes(value.stage);
 if(terminal&&value.status!=="Kapandı")context.addIssue({code:"custom",path:["status"],message:"Kazanılan veya kaybedilen lead durumu Kapandı olmalıdır."});
 if(!terminal&&value.status==="Kapandı")context.addIssue({code:"custom",path:["status"],message:"Kapandı durumu yalnız Kazanıldı veya Kaybedildi aşamasında kullanılabilir."});
});
const fields=["firstName","lastName","companyName","phone","email","city","district","serviceType","budgetAmount","budgetCurrency","source","stage","status","notes","assignedUserId","lastContactAt","nextFollowUpAt"] as const;
export function leadFormValues(formData:FormData):LeadFormValues{return Object.fromEntries(fields.map(field=>[field,String(formData.get(field)??"")])) as LeadFormValues;}
export function parseStudioLeadForm(formData:FormData){
 const values=leadFormValues(formData);const result=studioLeadSchema.safeParse(values);
 if(!result.success)return{success:false as const,values,fieldErrors:result.error.flatten().fieldErrors};
 return{success:true as const,values,input:result.data satisfies StudioLeadInput};
}
export function isStudioLeadId(value:string){return z.uuid().safeParse(value).success;}
