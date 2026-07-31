import Link from "next/link";
import StudioCrmFilters from "@/components/studio/crm/StudioCrmFilters";
import StudioLeadCard from "@/components/studio/crm/StudioLeadCard";
import StudioLeadEmptyState from "@/components/studio/crm/StudioLeadEmptyState";
import type {LeadQueryFilters,StudioLead,StudioLeadMember} from "@/lib/studio/crm/lead-types";
import {studioButtonClass} from "@/components/studio/StudioButton";

export default function StudioCrmPage({leads,totalCount,canManage,filters,members}:{leads:StudioLead[];totalCount:number;canManage:boolean;filters:LeadQueryFilters;members:StudioLeadMember[]}){
 const filtered=Boolean(filters.query||filters.stage||filters.status||filters.serviceType||filters.assignedUserId||filters.archive==="archived");
 return <section className="mx-auto min-w-0 max-w-[1540px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
  <header className="flex flex-col justify-between gap-5 border-b border-[#ddd8ce] pb-6 sm:flex-row sm:items-end"><div><p className="text-[9px] font-semibold uppercase tracking-[.16em] text-[#9a8253]">Müşteri İlişkileri</p><h1 className="mt-2 text-[28px] font-semibold tracking-[-.04em] text-[#1e272f]">CRM Lead Yönetimi</h1><p className="mt-2 max-w-2xl text-[11px] leading-5 text-[#747875]">İlk temastan teklif kararına kadar potansiyel müşterilerinizi tek, sakin bir çalışma alanında izleyin.</p><p className="mt-3 text-[9px] uppercase tracking-[.1em] text-[#9a9b96]">{totalCount} toplam lead</p></div>
   {canManage?<Link href="/studio/crm/new" className={studioButtonClass("primary")}>Yeni Lead</Link>:null}
  </header>
  <StudioCrmFilters filters={filters} members={members}/>
  {leads.length?<div className="mt-5 grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">{leads.map(lead=><StudioLeadCard key={lead.id} lead={lead}/>)}</div>:<StudioLeadEmptyState filtered={filtered||totalCount>0} canManage={canManage}/>}
 </section>;
}
