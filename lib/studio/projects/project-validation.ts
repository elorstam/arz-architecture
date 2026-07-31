import {z} from "zod";
import {PROJECT_STAGES,PROJECT_STATUSES} from "./project-constants.ts";
import type {ProjectFormValues,StudioProjectInput} from "./project-types.ts";

const optionalDate=z.string().trim().refine(v=>!v||/^\d{4}-\d{2}-\d{2}$/.test(v),"Geçerli bir tarih girin.");
export const studioProjectSchema=z.object({
 name:z.string().trim().min(1,"Proje adı zorunludur.").max(200,"Proje adı en fazla 200 karakter olabilir."),
 code:z.string().trim().min(1,"Proje kodu zorunludur.").max(40,"Proje kodu en fazla 40 karakter olabilir."),
 category:z.string().trim().max(120),location:z.string().trim().max(160),
 projectYear:z.string().trim().max(10),
 clientName:z.string().trim().max(200),clientContactName:z.string().trim().max(160),
 clientEmail:z.string().trim().refine(v=>!v||z.email().safeParse(v).success,"Geçerli bir e-posta adresi girin."),
 clientPhone:z.string().trim().max(50),
 stage:z.enum(PROJECT_STAGES,{error:"Geçersiz proje aşaması."}),
 status:z.enum(PROJECT_STATUSES,{error:"Geçersiz proje durumu."}),
 progress:z.coerce.number().int("İlerleme tam sayı olmalıdır.").min(0,"İlerleme değeri 0 ile 100 arasında olmalıdır.").max(100,"İlerleme değeri 0 ile 100 arasında olmalıdır."),
 startDate:optionalDate,targetDate:optionalDate,
 summary:z.string().trim().max(4000),currentPhase:z.string().trim().max(4000),
 nextMilestone:z.string().trim().max(240),nextMilestoneDate:optionalDate,
 responsibleUserId:z.string().trim().refine(v=>!v||z.uuid().safeParse(v).success,"Geçersiz sorumlu kullanıcı."),
}).superRefine((value,ctx)=>{
 if(value.startDate&&value.targetDate&&value.targetDate<value.startDate)ctx.addIssue({code:"custom",path:["targetDate"],message:"Hedef tarih başlangıç tarihinden önce olamaz."});
 if(value.status==="Arşivlendi")ctx.addIssue({code:"custom",path:["status"],message:"Arşiv durumu yalnızca arşivleme işlemiyle değiştirilebilir."});
});

const fields=["name","code","category","location","projectYear","clientName","clientContactName","clientEmail","clientPhone","stage","status","progress","startDate","targetDate","summary","currentPhase","nextMilestone","nextMilestoneDate","responsibleUserId"] as const;
export function projectFormValues(formData:FormData):ProjectFormValues{
 return Object.fromEntries(fields.map(field=>[field,String(formData.get(field)??"")])) as ProjectFormValues;
}
export function parseStudioProjectForm(formData:FormData){
 const values=projectFormValues(formData);const result=studioProjectSchema.safeParse(values);
 if(!result.success)return{success:false as const,values,fieldErrors:result.error.flatten().fieldErrors};
 return{success:true as const,values,input:result.data satisfies StudioProjectInput};
}
export function isStudioProjectId(value:string){return z.uuid().safeParse(value).success;}
