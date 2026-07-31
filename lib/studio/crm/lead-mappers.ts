import type {LeadCurrency,LeadFormValues,LeadServiceType,LeadSource,LeadStage,LeadStatus,StudioLead,StudioLeadInput,StudioLeadSummary} from "./lead-types.ts";

export type StudioLeadRow={
 id:string;organization_id:string;first_name:string;last_name:string;company_name:string;phone:string;email:string|null;
 city:string;district:string;service_type:string;budget_amount:string|null;budget_currency:string;source:string;stage:string;status:string;
 notes:string;assigned_user_id:string|null;last_contact_at:string|null;next_follow_up_at:string|null;is_archived:boolean;
 created_at:string;updated_at:string;assigned_profile:{id:string;full_name:string}|{id:string;full_name:string}[]|null;
};
function initials(name:string){return name.split(/\s+/).filter(Boolean).slice(0,2).map(value=>value[0]?.toLocaleUpperCase("tr-TR")).join("")||"AR";}
function dateLabel(value:string|null){if(!value)return"";return new Intl.DateTimeFormat("tr-TR",{day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit",timeZone:"Europe/Istanbul"}).format(new Date(value));}
export function mapStudioLead(row:StudioLeadRow,canManage:boolean):StudioLead{
 const profile=Array.isArray(row.assigned_profile)?row.assigned_profile[0]:row.assigned_profile;
 const assignedUser=profile?{id:profile.id,name:profile.full_name,initials:initials(profile.full_name),role:"CRM Sorumlusu"}:null;
 const fullName=[row.first_name,row.last_name].filter(Boolean).join(" ");
 return{id:row.id,firstName:row.first_name,lastName:row.last_name,fullName,companyName:row.company_name,phone:row.phone,email:row.email??"",
  city:row.city,district:row.district,serviceType:row.service_type as LeadServiceType,budgetAmount:row.budget_amount??"",budgetCurrency:row.budget_currency as LeadCurrency,
  source:row.source as LeadSource,stage:row.stage as LeadStage,status:row.status as LeadStatus,notes:row.notes,assignedUser,assignedUserId:row.assigned_user_id??"",
  lastContactAt:row.last_contact_at??"",nextFollowUpAt:row.next_follow_up_at??"",lastContactLabel:dateLabel(row.last_contact_at),nextFollowUpLabel:dateLabel(row.next_follow_up_at),
  isArchived:row.is_archived,createdAt:row.created_at,updatedAt:row.updated_at,createdAtLabel:dateLabel(row.created_at),updatedAtLabel:dateLabel(row.updated_at),canManage};
}
function toIso(value:string){return value?new Date(value).toISOString():null;}
export function leadInputToRow(input:StudioLeadInput){
 return{first_name:input.firstName,last_name:input.lastName,company_name:input.companyName,phone:input.phone,email:input.email||null,
  city:input.city,district:input.district,service_type:input.serviceType,budget_amount:input.budgetAmount?input.budgetAmount.replace(",","."):null,
  budget_currency:input.budgetCurrency,source:input.source,stage:input.stage,status:input.status,notes:input.notes,
  assigned_user_id:input.assignedUserId||null,last_contact_at:toIso(input.lastContactAt),next_follow_up_at:toIso(input.nextFollowUpAt)};
}
function inputDate(value:string){if(!value)return"";const date=new Date(value);const offset=date.getTimezoneOffset();return new Date(date.getTime()-offset*60000).toISOString().slice(0,16);}
export function leadToFormValues(lead:StudioLead):LeadFormValues{return{firstName:lead.firstName,lastName:lead.lastName,companyName:lead.companyName,phone:lead.phone,email:lead.email,
 city:lead.city,district:lead.district,serviceType:lead.serviceType,budgetAmount:lead.budgetAmount,budgetCurrency:lead.budgetCurrency,source:lead.source,
 stage:lead.stage,status:lead.status,notes:lead.notes,assignedUserId:lead.assignedUserId,lastContactAt:inputDate(lead.lastContactAt),nextFollowUpAt:inputDate(lead.nextFollowUpAt)};}
export function summarizeLeadStages(rows:Array<{stage:string}>):StudioLeadSummary{return rows.reduce<StudioLeadSummary>((summary,row)=>{
 summary.total+=1;if(row.stage==="Yeni Lead")summary.newLeads+=1;
 if(row.stage==="Teklif Hazırlanıyor"||row.stage==="Teklif Gönderildi")summary.awaitingQuote+=1;
 if(row.stage==="Kazanıldı")summary.won+=1;if(row.stage==="Kaybedildi")summary.lost+=1;return summary;
},{total:0,newLeads:0,awaitingQuote:0,won:0,lost:0});}
