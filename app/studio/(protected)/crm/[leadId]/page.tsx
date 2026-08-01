import {notFound} from "next/navigation";
import StudioLeadDetail from "@/components/studio/crm/StudioLeadDetail";
import StudioEntityTags from "@/components/studio/tags/StudioEntityTags";
import {getStudioLeadById} from "@/lib/studio/crm/lead-repository";
import {getStudioQuotes} from "@/lib/studio/quotes/quote-repository";
export const dynamic="force-dynamic";
export default async function LeadDetailPage({params}:{params:Promise<{leadId:string}>}){const{leadId}=await params;const lead=await getStudioLeadById(leadId);if(!lead)notFound();const quotes=await getStudioQuotes({leadId,archive:"all"});return <><StudioLeadDetail lead={lead} quotes={quotes}/><div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8"><StudioEntityTags entityType="crm_lead" entityId={lead.id}/></div></>;}
