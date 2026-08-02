import "server-only";

import {getStudioContext, type StudioRole} from "@/lib/studio/auth/get-studio-context";
import {normalizeProjectError,StudioProjectError} from "@/lib/studio/projects/project-errors";
import {mapStudioProject,projectInputToRow,type StudioProjectRow} from "@/lib/studio/projects/project-mappers";
import type {ProjectArchiveFilter,StudioProjectInput,StudioProjectMember,StudioProjectQuery} from "@/lib/studio/projects/project-types";
import {isStudioProjectId} from "@/lib/studio/projects/project-validation";
import {createStudioServerClient} from "@/lib/studio/supabase/server";

const projectSelect="id,organization_id,code,name,client_name,client_contact_name,client_email,client_phone,category,location,project_year,stage,status,progress,summary,current_phase,start_date,target_date,next_milestone,next_milestone_date,responsible_user_id,thumbnail_url,is_archived,created_at,updated_at,responsible_profile:profiles!studio_projects_responsible_user_id_fkey(id,full_name),stages:studio_project_stages(id,title,status,is_active,is_archived,sort_order)";

type ProjectContext={userId:string;organizationId:string;role:StudioRole;canManage:boolean};
async function requireProjectContext(requireOwner=false):Promise<ProjectContext>{
 const context=await getStudioContext();
 if(!context?.user||!context.membership)throw new StudioProjectError("unauthorized","Oturum gerekli.");
 const role=context.membership.role as StudioRole;
 if(requireOwner&&role!=="owner")throw new StudioProjectError("forbidden","Bu işlem yalnızca Studio sahibi tarafından yapılabilir.");
 return{userId:context.user.id,organizationId:context.membership.organization_id,role,canManage:role==="owner"};
}
export async function getStudioProjectAccess(){const context=await requireProjectContext();return{canManage:context.canManage,role:context.role};}
function applyArchiveFilter<T extends{eq:(column:string,value:unknown)=>T}>(query:T,archive:ProjectArchiveFilter="active"){
 if(archive==="active")return query.eq("is_archived",false);
 if(archive==="archived")return query.eq("is_archived",true);
 return query;
}

export async function getStudioProjects(filters:StudioProjectQuery={}){
 const context=await requireProjectContext();const supabase=await createStudioServerClient();
 let query=supabase.from("studio_projects").select(projectSelect).eq("organization_id",context.organizationId).order("updated_at",{ascending:false});
 query=applyArchiveFilter(query,filters.archive);
 if(filters.status)query=query.eq("status",filters.status);
 if(filters.stage)query=query.eq("stage",filters.stage);
 if(filters.query){
  const safe=filters.query.replace(/[,%()"'*:]/g," ").replace(/\s+/g," ").trim();
  if(safe)query=query.or(`name.ilike.%${safe}%,code.ilike.%${safe}%,client_name.ilike.%${safe}%,location.ilike.%${safe}%,category.ilike.%${safe}%`);
 }
 const{data,error}=await query;
 if(error){console.error("Studio projects could not be loaded.",{code:error.code});throw normalizeProjectError(error);}
 return(data as unknown as StudioProjectRow[]).map(row=>mapStudioProject(row,context.canManage));
}
export async function getStudioProjectById(projectId:string){
 if(!isStudioProjectId(projectId))return null;
 const context=await requireProjectContext();const supabase=await createStudioServerClient();
 const{data,error}=await supabase.from("studio_projects").select(projectSelect).eq("organization_id",context.organizationId).eq("id",projectId).maybeSingle();
 if(error){console.error("Studio project could not be loaded.",{code:error.code});throw normalizeProjectError(error);}
 return data?mapStudioProject(data as unknown as StudioProjectRow,context.canManage):null;
}
export async function getStudioProjectMembers():Promise<StudioProjectMember[]>{
 const context=await requireProjectContext();const supabase=await createStudioServerClient();
 const{data,error}=await supabase.from("organization_members")
  .select("user_id,role,profiles!organization_members_user_id_fkey(id,full_name)")
  .eq("organization_id",context.organizationId).eq("status","active").in("role",["owner","admin","team_member"]);
 if(error){console.error("Studio project members could not be loaded.",{code:error.code});throw normalizeProjectError(error);}
 return(data??[]).map(row=>{
  const profile=Array.isArray(row.profiles)?row.profiles[0]:row.profiles;
  const name=profile?.full_name||"Studio Kullanıcısı";
  return{id:row.user_id,name,initials:name.split(/\s+/).filter(Boolean).slice(0,2).map((v:string)=>v[0]?.toLocaleUpperCase("tr-TR")).join(""),role:row.role};
 });
}
export async function createStudioProject(input:StudioProjectInput){
 const context=await requireProjectContext(true);const supabase=await createStudioServerClient();
 if(input.responsibleUserId)await assertResponsibleMember(input.responsibleUserId,context.organizationId);
 const{data,error}=await supabase.from("studio_projects").insert({...projectInputToRow(input),organization_id:context.organizationId}).select("id").single();
 if(error){console.error("Studio project create failed.",{code:error.code});throw normalizeProjectError(error);}
 return data.id as string;
}
export async function updateStudioProject(projectId:string,input:StudioProjectInput){
 if(!isStudioProjectId(projectId))throw new StudioProjectError("not_found","Proje bulunamadı.");
 const context=await requireProjectContext(true);const supabase=await createStudioServerClient();
 if(input.responsibleUserId)await assertResponsibleMember(input.responsibleUserId,context.organizationId);
 const{data,error}=await supabase.from("studio_projects").update(projectInputToRow(input))
  .eq("organization_id",context.organizationId).eq("id",projectId).select("id").maybeSingle();
 if(error){console.error("Studio project update failed.",{code:error.code});throw normalizeProjectError(error);}
 if(!data)throw new StudioProjectError("not_found","Proje bulunamadı.");
}
export async function archiveStudioProject(projectId:string,archived:boolean){
 if(!isStudioProjectId(projectId))throw new StudioProjectError("not_found","Proje bulunamadı.");
 const context=await requireProjectContext(true);const supabase=await createStudioServerClient();
 const values=archived?{is_archived:true,status:"Arşivlendi"}:{is_archived:false,status:"Aktif"};
 const{data,error}=await supabase.from("studio_projects").update(values)
  .eq("organization_id",context.organizationId).eq("id",projectId).select("id").maybeSingle();
 if(error){console.error("Studio project archive failed.",{code:error.code});throw normalizeProjectError(error);}
 if(!data)throw new StudioProjectError("not_found","Proje bulunamadı.");
}
async function assertResponsibleMember(userId:string,organizationId:string){
 const supabase=await createStudioServerClient();
 const{data,error}=await supabase.from("organization_members").select("id").eq("organization_id",organizationId)
  .eq("user_id",userId).eq("status","active").in("role",["owner","admin","team_member"]).maybeSingle();
 if(error)throw normalizeProjectError(error);
 if(!data)throw new StudioProjectError("invalid_responsible","Seçilen sorumlu bu organizasyonda aktif değil.");
}
