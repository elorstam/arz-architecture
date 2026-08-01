import Link from "next/link";
import {studioButtonClass} from "@/components/studio/StudioButton";
export default function StudioLeadEmptyState({filtered,canManage}:{filtered:boolean;canManage:boolean}){
 return <div className="studio-empty-state mt-5 rounded-xl border border-dashed border-[#d3cbbc] bg-white/60"><p className="studio-helper-text font-semibold uppercase tracking-[.15em] text-[#9a8253]">CRM</p><h2 className="studio-card__title mt-3">{filtered?"Bu filtrelere uygun lead bulunamadı.":"Henüz CRM kaydı bulunmuyor."}</h2><p className="studio-helper-text mx-auto mt-3 max-w-md">{filtered?"Arama ifadesini veya filtreleri temizleyerek yeniden deneyin.":"İlk müşterinizi oluşturarak satış sürecini ARZ Studio üzerinden yönetmeye başlayın."}</p>{canManage&&!filtered?<Link href="/studio/crm/new" className={studioButtonClass("primary", "md", "mt-7")}>İlk Lead’i Oluştur</Link>:null}</div>;
}
