import Link from "next/link";
import {LEAD_SERVICE_TYPES,LEAD_STAGES,LEAD_STATUSES} from "@/lib/studio/crm/lead-constants";
import type {LeadQueryFilters,StudioLeadMember} from "@/lib/studio/crm/lead-types";
import {studioButtonClass} from "@/components/studio/StudioButton";

export default function StudioCrmFilters({filters,members}:{filters:LeadQueryFilters;members:StudioLeadMember[]}){
 const field="h-10 min-w-0 rounded-lg border border-[#dcd8cf] bg-white px-3 text-[10px] text-[#4f5657] outline-none focus:border-[#a58a56] focus:ring-2 focus:ring-[#a58a56]/15";
 return <form method="get" className="mt-5 grid gap-3 rounded-xl border border-[#dedad1] bg-white p-4 sm:grid-cols-2 lg:grid-cols-6">
  <label className="min-w-0 sm:col-span-2"><span className="sr-only">Lead ara</span><input className={`${field} w-full`} name="q" defaultValue={filters.query} placeholder="Ad, firma, telefon, şehir ara"/></label>
  <label><span className="sr-only">Aşama</span><select className={`${field} w-full`} name="stage" defaultValue={filters.stage??""}><option value="">Tüm aşamalar</option>{LEAD_STAGES.map(value=><option key={value}>{value}</option>)}</select></label>
  <label><span className="sr-only">Durum</span><select className={`${field} w-full`} name="status" defaultValue={filters.status??""}><option value="">Tüm durumlar</option>{LEAD_STATUSES.map(value=><option key={value}>{value}</option>)}</select></label>
  <label><span className="sr-only">Hizmet tipi</span><select className={`${field} w-full`} name="serviceType" defaultValue={filters.serviceType??""}><option value="">Tüm hizmetler</option>{LEAD_SERVICE_TYPES.map(value=><option key={value}>{value}</option>)}</select></label>
  <label><span className="sr-only">Sorumlu</span><select className={`${field} w-full`} name="assignedUserId" defaultValue={filters.assignedUserId??""}><option value="">Tüm sorumlular</option>{members.map(member=><option key={member.id} value={member.id}>{member.name}</option>)}</select></label>
  <label><span className="sr-only">Arşiv görünümü</span><select className={`${field} w-full`} name="archive" defaultValue={filters.archive??"active"}><option value="active">Aktif Leadler</option><option value="archived">Arşiv</option><option value="all">Tümü</option></select></label>
  <div className="flex flex-wrap gap-2 lg:col-span-5 lg:justify-end"><Link href="/studio/crm" className={studioButtonClass("outline", "sm")}>Temizle</Link><button className={studioButtonClass("primary", "sm")}>Filtrele</button></div>
 </form>;
}
