import type {ProjectFormValues,ProjectStage,ProjectStatus,StudioProject,StudioProjectInput} from "./project-types.ts";

export type StudioProjectRow={
 id:string;organization_id:string;code:string;name:string;client_name:string;client_contact_name:string;
 client_email:string|null;client_phone:string;category:string;location:string;project_year:string;
 stage:string;status:string;progress:number;summary:string;current_phase:string;start_date:string|null;
 target_date:string|null;next_milestone:string;next_milestone_date:string|null;responsible_user_id:string|null;
 thumbnail_url:string|null;is_archived:boolean;created_at:string;updated_at:string;
 responsible_profile:{id:string;full_name:string}|{id:string;full_name:string}[]|null;
};
function initials(name:string){return name.split(/\s+/).filter(Boolean).slice(0,2).map(v=>v[0]?.toLocaleUpperCase("tr-TR")).join("")||"AR";}
function formatDate(value:string|null){if(!value)return"";return new Intl.DateTimeFormat("tr-TR",{day:"numeric",month:"long",year:"numeric",timeZone:"UTC"}).format(new Date(`${value}T00:00:00Z`));}
function relativeUpdate(value:string){return new Intl.DateTimeFormat("tr-TR",{day:"numeric",month:"short",year:"numeric",timeZone:"Europe/Istanbul"}).format(new Date(value));}
export function mapStudioProject(row:StudioProjectRow,canManage:boolean):StudioProject{
 const profile=Array.isArray(row.responsible_profile)?row.responsible_profile[0]:row.responsible_profile;
 return{id:row.id,code:row.code,name:row.name,client:{name:row.client_name,contact:row.client_contact_name,email:row.client_email??"",phone:row.client_phone},
 category:row.category,location:row.location,year:row.project_year,stage:row.stage as ProjectStage,status:row.status as ProjectStatus,
 progress:row.progress,lastUpdate:relativeUpdate(row.updated_at),responsible:profile?{id:profile.id,name:profile.full_name,initials:initials(profile.full_name),role:"Proje Sorumlusu"}:null,
 nextMilestone:row.next_milestone,nextMilestoneDate:formatDate(row.next_milestone_date),thumbnail:row.thumbnail_url??"",summary:row.summary,
 currentPhase:row.current_phase,startDate:formatDate(row.start_date),targetDate:formatDate(row.target_date),
 startDateValue:row.start_date??"",targetDateValue:row.target_date??"",nextMilestoneDateValue:row.next_milestone_date??"",responsibleUserId:row.responsible_user_id??"",
 team:profile?[{id:profile.id,name:profile.full_name,initials:initials(profile.full_name),role:"Proje Sorumlusu"}]:[],
 milestones:[],activities:[],metrics:[],notes:[],isArchived:row.is_archived,canManage};
}
export function projectInputToRow(input:StudioProjectInput){
 return{code:input.code,name:input.name,client_name:input.clientName,client_contact_name:input.clientContactName,
 client_email:input.clientEmail||null,client_phone:input.clientPhone,category:input.category,location:input.location,
 project_year:input.projectYear,stage:input.stage,status:input.status,progress:input.progress,summary:input.summary,
 current_phase:input.currentPhase,start_date:input.startDate||null,target_date:input.targetDate||null,
 next_milestone:input.nextMilestone,next_milestone_date:input.nextMilestoneDate||null,
 responsible_user_id:input.responsibleUserId||null};
}
export function projectToFormValues(project:StudioProject):ProjectFormValues{
 return{name:project.name,code:project.code,category:project.category,location:project.location,projectYear:project.year,
 clientName:project.client.name,clientContactName:project.client.contact,clientEmail:project.client.email,clientPhone:project.client.phone,
 stage:project.stage,status:project.status,progress:String(project.progress),startDate:project.startDateValue,targetDate:project.targetDateValue,
 summary:project.summary,currentPhase:project.currentPhase,nextMilestone:project.nextMilestone,
 nextMilestoneDate:project.nextMilestoneDateValue,responsibleUserId:project.responsibleUserId};
}
