import Link from "next/link";
import {studioButtonClass} from "@/components/studio/StudioButton";
import StudioQuoteCard from "./StudioQuoteCard";
import StudioQuotesFilters from "./StudioQuotesFilters";
import type {QuoteQueryFilters,StudioQuote,StudioQuoteLead} from "@/lib/studio/quotes/quote-types";

export default function StudioQuotesPage({quotes,total,canManage,filters,leads}:{quotes:StudioQuote[];total:number;canManage:boolean;filters:QuoteQueryFilters;leads:StudioQuoteLead[]}) {
  const filtered=Boolean(filters.query||filters.status||filters.currency||filters.leadId||filters.createdFrom||filters.createdTo||filters.validFrom||filters.validTo||filters.archive==="archived");
  return <section className="mx-auto min-w-0 max-w-[1540px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
    <header className="flex flex-col justify-between gap-5 border-b border-[#ddd8ce] pb-6 sm:flex-row sm:items-end">
      <div><p className="text-[9px] font-semibold uppercase tracking-[.16em] text-[#9a8253]">Ticari Süreç</p><h1 className="mt-2 text-[28px] font-semibold tracking-[-.04em] text-[#1e272f]">Teklifler</h1><p className="mt-2 max-w-2xl text-[11px] leading-5 text-[#747875]">CRM lead’lerinden oluşturulan teklifleri yönetin ve onaylanan çalışmaları projeye dönüştürün.</p><p className="mt-3 text-[9px] uppercase tracking-[.1em] text-[#9a9b96]">{total} toplam teklif</p></div>
      {canManage?<Link href="/studio/quotes/new" className={studioButtonClass("primary")}>Yeni Teklif</Link>:null}
    </header>
    <StudioQuotesFilters filters={filters} leads={leads}/>
    {quotes.length?<div className="mt-5 grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">{quotes.map(quote=><StudioQuoteCard key={quote.id} quote={quote}/>)}</div>:<div className="mt-5 rounded-xl border border-dashed border-[#d3cbbc] bg-white/60 px-6 py-12 text-center"><h2 className="text-[18px] font-semibold text-[#2c353b]">{filtered||total?"Bu filtrelere uygun teklif bulunamadı.":"Henüz teklif bulunmuyor."}</h2><p className="mx-auto mt-3 max-w-md text-[11px] leading-5 text-[#6f7674]">{filtered||total?"Arama ifadesini veya filtreleri temizleyerek yeniden deneyin.":"İlk teklifinizi oluşturarak ticari süreci başlatın."}</p>{canManage&&!filtered&&!total?<Link href="/studio/quotes/new" className={studioButtonClass("primary", "md", "mt-6")}>İlk Teklifi Oluştur</Link>:null}</div>}
  </section>;
}
