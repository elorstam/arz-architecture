import Link from "next/link";
import type {StudioLeadSummary} from "@/lib/studio/crm/lead-types";

const definitions:Array<{key:keyof StudioLeadSummary;label:string;detail:string}>=[
 {key:"total",label:"Toplam Lead",detail:"Arşivlenmemiş kayıtlar"},
 {key:"newLeads",label:"Yeni Lead",detail:"İlk değerlendirme bekliyor"},
 {key:"awaitingQuote",label:"Teklif Bekleyen",detail:"Hazırlanıyor veya gönderildi"},
 {key:"won",label:"Kazanılan",detail:"Olumlu kapanan süreç"},
 {key:"lost",label:"Kaybedilen",detail:"Olumsuz kapanan süreç"},
];
export default function StudioCrmSummary({summary}:{summary:StudioLeadSummary}){return <section className="mt-5 rounded-xl border border-[#dedad1] bg-white p-5 shadow-[0_4px_18px_rgba(32,39,46,.03)] sm:p-6"><div className="flex items-end justify-between gap-4 border-b border-[#ece9e3] pb-4"><div><p className="text-[9px] font-semibold uppercase tracking-[.14em] text-[#9a8253]">CRM Akışı</p><h2 className="mt-1 text-[15px] font-semibold text-[#293239]">Lead görünümü</h2></div><Link href="/studio/crm" className="text-[9px] font-medium text-[#806b45] outline-none hover:text-[#54472f] focus-visible:ring-2 focus-visible:ring-[#a58a56]/25">CRM’i Aç →</Link></div><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{definitions.map(item=><article key={item.key} className="rounded-lg border border-[#e7e3dc] bg-[#faf9f6] p-4"><p className="text-[9px] text-[#7c807c]">{item.label}</p><p className="mt-2 text-[23px] font-semibold tracking-[-.04em] text-[#273138]">{summary[item.key]}</p><p className="mt-2 text-[8px] leading-4 text-[#a09d96]">{item.detail}</p></article>)}</div></section>;}
