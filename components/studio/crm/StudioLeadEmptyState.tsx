import Link from "next/link";
import {studioButtonClass} from "@/components/studio/StudioButton";
export default function StudioLeadEmptyState({filtered,canManage}:{filtered:boolean;canManage:boolean}){
 return <div className="mt-5 rounded-xl border border-dashed border-[#d3cbbc] bg-white/60 px-6 py-12 text-center"><p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#9a8253]">CRM</p><h2 className="mt-3 text-[18px] font-semibold text-[#2c353b]">{filtered?"Bu filtrelere uygun lead bulunamadı.":"Henüz CRM kaydı bulunmuyor."}</h2><p className="mx-auto mt-3 max-w-md text-[11px] leading-5 text-[#6f7674]">{filtered?"Arama ifadesini veya filtreleri temizleyerek yeniden deneyin.":"İlk müşterinizi oluşturarak satış sürecini ARZ Studio üzerinden yönetmeye başlayın."}</p>{canManage&&!filtered?<Link href="/studio/crm/new" className={studioButtonClass("primary", "md", "mt-6")}>İlk Lead’i Oluştur</Link>:null}</div>;
}
