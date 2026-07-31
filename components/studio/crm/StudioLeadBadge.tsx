import type {LeadStage,LeadStatus} from "@/lib/studio/crm/lead-types";

export function StudioLeadStageBadge({stage}:{stage:LeadStage}){
 return <span className="inline-flex rounded-full border border-[#d9d1c1] bg-[#f5f1e9] px-2.5 py-1 text-[9px] font-medium text-[#806b45]">{stage}</span>;
}
export function StudioLeadStatusBadge({status}:{status:LeadStatus}){
 return <span className="inline-flex rounded-full border border-[#dfe1dd] bg-[#f5f6f3] px-2.5 py-1 text-[9px] text-[#626965]">{status}</span>;
}
