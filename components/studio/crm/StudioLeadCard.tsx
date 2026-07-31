import Link from "next/link";
import {StudioLeadStageBadge,StudioLeadStatusBadge} from "@/components/studio/crm/StudioLeadBadge";
import type {StudioLead} from "@/lib/studio/crm/lead-types";

function budget(lead:StudioLead){if(!lead.budgetAmount)return"Belirtilmedi";return new Intl.NumberFormat("tr-TR",{style:"currency",currency:lead.budgetCurrency,maximumFractionDigits:2}).format(Number(lead.budgetAmount));}
export default function StudioLeadCard({lead}:{lead:StudioLead}){
 const location=[lead.city,lead.district].filter(Boolean).join(" / ")||"Konum belirtilmedi";
 return <Link href={`/studio/crm/${lead.id}`} className="group block min-w-0 rounded-xl border border-[#dedad1] bg-white p-5 shadow-[0_4px_18px_rgba(32,39,46,.03)] outline-none transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-[#cbc3b3] hover:shadow-[0_10px_28px_rgba(32,39,46,.06)] focus-visible:ring-2 focus-visible:ring-[#a58a56]/30">
  <article className="min-w-0">
   <div className="flex min-w-0 items-start justify-between gap-3"><div className="min-w-0"><h2 className="truncate text-[15px] font-semibold tracking-[-.02em] text-[#263038]">{lead.fullName}</h2><p className="mt-1 truncate text-[10px] text-[#858783]">{lead.companyName||"Bireysel müşteri"}</p></div><StudioLeadStageBadge stage={lead.stage}/></div>
   <div className="mt-5 grid gap-4 border-y border-[#efede8] py-4 sm:grid-cols-2">
    <div><p className="text-[8px] uppercase tracking-[.12em] text-[#aaa79f]">Telefon</p><p className="mt-1 break-words text-[10px] font-medium text-[#4a5255]">{lead.phone}</p></div>
    <div><p className="text-[8px] uppercase tracking-[.12em] text-[#aaa79f]">Hizmet</p><p className="mt-1 text-[10px] text-[#4a5255]">{lead.serviceType}</p></div>
    <div><p className="text-[8px] uppercase tracking-[.12em] text-[#aaa79f]">Konum</p><p className="mt-1 truncate text-[10px] text-[#4a5255]">{location}</p></div>
    <div><p className="text-[8px] uppercase tracking-[.12em] text-[#aaa79f]">Sonraki takip</p><p className="mt-1 text-[10px] text-[#4a5255]">{lead.nextFollowUpLabel||"Planlanmadı"}</p></div>
   </div>
   <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><StudioLeadStatusBadge status={lead.status}/><span className="text-[9px] text-[#8b8d88]">{lead.assignedUser?.name||"Sorumlu atanmadı"}</span></div><span className="text-[10px] font-medium text-[#665b47]">{budget(lead)}</span></div>
  </article>
 </Link>;
}
