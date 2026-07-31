import Link from "next/link";
import {studioButtonClass} from "@/components/studio/StudioButton";
import {QUOTE_CURRENCIES,QUOTE_STATUSES,QUOTE_STATUS_LABELS} from "@/lib/studio/quotes/quote-constants";
import type {QuoteQueryFilters,StudioQuoteLead} from "@/lib/studio/quotes/quote-types";

export default function StudioQuotesFilters({filters,leads}:{filters:QuoteQueryFilters;leads:StudioQuoteLead[]}) {
  const input="h-10 min-w-0 rounded-lg border border-[#dcd8cf] bg-white px-3 text-[10px] outline-none focus:border-[#a58a56]";
  return <form className="mt-5 grid gap-3 rounded-xl border border-[#dedad1] bg-white p-4 sm:grid-cols-2 xl:grid-cols-6">
    <input name="q" defaultValue={filters.query} placeholder="Numara, başlık veya müşteri ara" aria-label="Teklif ara" className={`${input} sm:col-span-2`}/>
    <select name="status" defaultValue={filters.status??""} aria-label="Teklif durumu" className={input}><option value="">Tüm durumlar</option>{QUOTE_STATUSES.map(value=><option key={value} value={value}>{QUOTE_STATUS_LABELS[value]}</option>)}</select>
    <select name="currency" defaultValue={filters.currency??""} aria-label="Para birimi" className={input}><option value="">Tüm para birimleri</option>{QUOTE_CURRENCIES.map(value=><option key={value}>{value}</option>)}</select>
    <select name="leadId" defaultValue={filters.leadId??""} aria-label="CRM lead" className={input}><option value="">Tüm leadler</option>{leads.map(lead=><option key={lead.id} value={lead.id}>{lead.name}</option>)}</select>
    <select name="archive" defaultValue={filters.archive??"active"} aria-label="Arşiv görünümü" className={input}><option value="active">Aktif</option><option value="archived">Arşiv</option><option value="all">Tümü</option></select>
    <input type="date" name="createdFrom" defaultValue={filters.createdFrom} aria-label="Oluşturulma başlangıç tarihi" className={input}/>
    <input type="date" name="createdTo" defaultValue={filters.createdTo} aria-label="Oluşturulma bitiş tarihi" className={input}/>
    <input type="date" name="validFrom" defaultValue={filters.validFrom} aria-label="Geçerlilik başlangıç tarihi" className={input}/>
    <input type="date" name="validTo" defaultValue={filters.validTo} aria-label="Geçerlilik bitiş tarihi" className={input}/>
    <div className="flex flex-wrap gap-2 sm:col-span-2 xl:justify-end"><Link href="/studio/quotes" className={studioButtonClass("outline", "sm")}>Temizle</Link><button className={studioButtonClass("primary", "sm")}>Filtrele</button></div>
  </form>;
}
