import StudioCrmPage from "@/components/studio/crm/StudioCrmPage";
import {LEAD_SERVICE_TYPES,LEAD_STAGES,LEAD_STATUSES} from "@/lib/studio/crm/lead-constants";
import {getStudioLeadAccess,getStudioLeadMembers,getStudioLeads} from "@/lib/studio/crm/lead-repository";
import type {LeadArchiveFilter} from "@/lib/studio/crm/lead-types";

export const dynamic="force-dynamic";
type SearchParams=Promise<{q?:string;stage?:string;status?:string;serviceType?:string;assignedUserId?:string;archive?:string}>;
export default async function CrmPage({searchParams}:{searchParams:SearchParams}){
 const params=await searchParams;const query=params.q?.trim().slice(0,120)||"";
 const stage=LEAD_STAGES.find(value=>value===params.stage);const status=LEAD_STATUSES.find(value=>value===params.status);
 const serviceType=LEAD_SERVICE_TYPES.find(value=>value===params.serviceType);
 const archive=(["active","archived","all"].includes(params.archive??"")?params.archive:"active") as LeadArchiveFilter;
 const members=await getStudioLeadMembers();const assignedUserId=members.some(member=>member.id===params.assignedUserId)?params.assignedUserId:undefined;
 const filters={query,stage,status,serviceType,assignedUserId,archive};
 const[leads,allLeads,access]=await Promise.all([getStudioLeads(filters),getStudioLeads({archive:"all"}),getStudioLeadAccess()]);
 return <StudioCrmPage leads={leads} totalCount={allLeads.length} canManage={access.canManage} filters={filters} members={members}/>;
}
