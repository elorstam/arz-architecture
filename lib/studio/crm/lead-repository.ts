import "server-only";

import {getStudioContext,type StudioRole} from "@/lib/studio/auth/get-studio-context";
import {normalizeLeadError,StudioLeadError} from "@/lib/studio/crm/lead-errors";
import {leadInputToRow,mapStudioLead,summarizeLeadStages,type StudioLeadRow} from "@/lib/studio/crm/lead-mappers";
import type {LeadArchiveFilter,LeadQueryFilters,StudioLeadInput,StudioLeadMember} from "@/lib/studio/crm/lead-types";
import {isStudioLeadId} from "@/lib/studio/crm/lead-validation";
import {createStudioServerClient} from "@/lib/studio/supabase/server";

const leadSelect="id,organization_id,first_name,last_name,company_name,phone,email,city,district,service_type,budget_amount,budget_currency,source,stage,status,notes,assigned_user_id,last_contact_at,next_follow_up_at,is_archived,created_at,updated_at,assigned_profile:profiles!studio_leads_assigned_user_id_fkey(id,full_name)";
type LeadContext={userId:string;organizationId:string;role:StudioRole;canManage:boolean};
async function requireLeadContext(requireOwner=false):Promise<LeadContext>{
 const context=await getStudioContext();
 if(!context?.user||!context.membership)throw new StudioLeadError("unauthorized","Oturum gerekli.");
 const role=context.membership.role as StudioRole;
 if(requireOwner&&role!=="owner")throw new StudioLeadError("forbidden","Bu işlem yalnızca Studio sahibi tarafından yapılabilir.");
 return{userId:context.user.id,organizationId:context.membership.organization_id,role,canManage:role==="owner"};
}
export async function getStudioLeadAccess(){const context=await requireLeadContext();return{canManage:context.canManage,role:context.role};}
function applyArchiveFilter<T extends{eq:(column:string,value:unknown)=>T}>(query:T,archive:LeadArchiveFilter="active"){
 if(archive==="active")return query.eq("is_archived",false);if(archive==="archived")return query.eq("is_archived",true);return query;
}
function safeSearch(value:string){return value.replace(/[,%()"'*:]/g," ").replace(/\s+/g," ").trim().slice(0,120);}
export async function getStudioLeads(filters:LeadQueryFilters={}){
 const context=await requireLeadContext();const supabase=await createStudioServerClient();
 let query=supabase.from("studio_leads").select(leadSelect).eq("organization_id",context.organizationId).order("updated_at",{ascending:false});
 query=applyArchiveFilter(query,filters.archive);
 if(filters.stage)query=query.eq("stage",filters.stage);if(filters.status)query=query.eq("status",filters.status);
 if(filters.serviceType)query=query.eq("service_type",filters.serviceType);if(filters.assignedUserId)query=query.eq("assigned_user_id",filters.assignedUserId);
 if(filters.query){const search=safeSearch(filters.query);if(search)query=query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,company_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%,city.ilike.%${search}%,district.ilike.%${search}%`);}
 const{data,error}=await query;if(error){console.error("Studio leads could not be loaded.",{code:error.code});throw normalizeLeadError(error);}
 return(data as unknown as StudioLeadRow[]).map(row=>mapStudioLead(row,context.canManage));
}
export async function getStudioLeadById(leadId:string){
 if(!isStudioLeadId(leadId))return null;const context=await requireLeadContext();const supabase=await createStudioServerClient();
 const{data,error}=await supabase.from("studio_leads").select(leadSelect).eq("organization_id",context.organizationId).eq("id",leadId).maybeSingle();
 if(error){console.error("Studio lead could not be loaded.",{code:error.code});throw normalizeLeadError(error);}
 return data?mapStudioLead(data as unknown as StudioLeadRow,context.canManage):null;
}
export async function getStudioLeadMembers():Promise<StudioLeadMember[]>{
 const context=await requireLeadContext();const supabase=await createStudioServerClient();
 const{data,error}=await supabase.from("organization_members").select("user_id,role,profiles!organization_members_user_id_fkey(id,full_name)")
  .eq("organization_id",context.organizationId).eq("status","active").in("role",["owner","admin","team_member"]);
 if(error){console.error("Studio lead members could not be loaded.",{code:error.code});throw normalizeLeadError(error);}
 return(data??[]).map(row=>{const profile=Array.isArray(row.profiles)?row.profiles[0]:row.profiles;const name=profile?.full_name||"Studio Kullanıcısı";
  return{id:row.user_id,name,initials:name.split(/\s+/).filter(Boolean).slice(0,2).map((part:string)=>part[0]?.toLocaleUpperCase("tr-TR")).join(""),role:row.role};});
}
async function assertAssignedMember(userId:string,organizationId:string){
 const supabase=await createStudioServerClient();const{data,error}=await supabase.from("organization_members").select("id").eq("organization_id",organizationId)
  .eq("user_id",userId).eq("status","active").in("role",["owner","admin","team_member"]).maybeSingle();
 if(error)throw normalizeLeadError(error);if(!data)throw new StudioLeadError("invalid_assignee","Seçilen sorumlu kullanıcı bu organizasyona ait değil.");
}
export async function createStudioLead(input:StudioLeadInput){
 const context=await requireLeadContext(true);const supabase=await createStudioServerClient();
 if(input.assignedUserId)await assertAssignedMember(input.assignedUserId,context.organizationId);
 const{data,error}=await supabase.from("studio_leads").insert({...leadInputToRow(input),organization_id:context.organizationId}).select("id").single();
 if(error){console.error("Studio lead create failed.",{code:error.code});throw normalizeLeadError(error);}return data.id as string;
}
export async function updateStudioLead(leadId:string,input:StudioLeadInput){
 if(!isStudioLeadId(leadId))throw new StudioLeadError("not_found","Lead bulunamadı.");
 const context=await requireLeadContext(true);const supabase=await createStudioServerClient();
 if(input.assignedUserId)await assertAssignedMember(input.assignedUserId,context.organizationId);
 const{data,error}=await supabase.from("studio_leads").update(leadInputToRow(input)).eq("organization_id",context.organizationId).eq("id",leadId).eq("is_archived",false).select("id").maybeSingle();
 if(error){console.error("Studio lead update failed.",{code:error.code});throw normalizeLeadError(error);}
 if(!data)throw new StudioLeadError("not_found","Lead bulunamadı.");
}
export async function archiveStudioLead(leadId:string,archived:boolean){
 if(!isStudioLeadId(leadId))throw new StudioLeadError("not_found","Lead bulunamadı.");
 const context=await requireLeadContext(true);const supabase=await createStudioServerClient();
 const{data,error}=await supabase.from("studio_leads").update({is_archived:archived}).eq("organization_id",context.organizationId).eq("id",leadId).select("id").maybeSingle();
 if(error){console.error("Studio lead archive failed.",{code:error.code});throw normalizeLeadError(error);}if(!data)throw new StudioLeadError("not_found","Lead bulunamadı.");
}
export async function getStudioLeadSummary(){
 const context=await requireLeadContext();const supabase=await createStudioServerClient();
 const{data,error}=await supabase.from("studio_leads").select("stage").eq("organization_id",context.organizationId).eq("is_archived",false);
 if(error){console.error("Studio lead summary could not be loaded.",{code:error.code});throw normalizeLeadError(error);}
 return summarizeLeadStages(data??[]);
}
