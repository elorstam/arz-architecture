import Link from "next/link";

import {StudioIcon,type StudioIconName} from "@/components/studio/StudioIcons";
import {StudioCard,StudioIconSurface,type StudioIconTone} from "@/components/studio/ui";
import type {StudioLeadSummary} from "@/lib/studio/crm/lead-types";
import type {FinanceDashboard} from "@/lib/studio/finance/finance-types";
import {money} from "@/lib/studio/finance/finance-validation";
import type {StudioQuickAccessData} from "@/lib/studio/quick-access/quick-access-types";
import type {StudioQuoteSummary} from "@/lib/studio/quotes/quote-types";

type Widget={title:string;value:string;detail:string;href:string;icon:StudioIconName};
type Shortcut={label:string;href:string;icon:StudioIconName;tone:StudioIconTone};

export default function StudioCompactWidgets({finance,quotes,crm,renderCount,quickAccess}:{finance:FinanceDashboard;quotes:StudioQuoteSummary;crm:StudioLeadSummary;renderCount:number;quickAccess:StudioQuickAccessData}){
  const quickCount=quickAccess.available?quickAccess.favorites.length+quickAccess.recent.length:0;
  const items:Widget[]=[
    {title:"Finans",value:finance.available?money(finance.summary.monthCollected):"—",detail:"Bu ay tahsilat",href:"/studio/finance",icon:"payments"},
    {title:"Teklifler",value:String(quotes.awaitingApproval),detail:"Onay bekliyor",href:"/studio/quotes",icon:"receipt"},
    {title:"CRM",value:String(crm.newLeads),detail:"Yeni lead",href:"/studio/crm",icon:"clients"},
    {title:"Render Kuyruğu",value:String(renderCount),detail:"Güncel çalışma",href:"/studio/projects?stage=Görselleştirme",icon:"render"},
    {title:"AI Kullanımı",value:"Görüntüle",detail:"Kullanım özeti",href:"/studio/ai-usage",icon:"sparkles"},
    {title:"Hızlı Erişim",value:String(quickCount),detail:"Kayıtlı ve son açılan",href:"/studio/quick-access",icon:"star"},
  ];
  const shortcuts:Shortcut[]=[
    {label:"Projeler",href:"/studio/projects",icon:"folder",tone:"blue"},
    {label:"Teklifler",href:"/studio/quotes",icon:"receipt",tone:"gold"},
    {label:"CRM",href:"/studio/crm",icon:"clients",tone:"green"},
    {label:"Finans",href:"/studio/finance",icon:"wallet",tone:"purple"},
    {label:"Render",href:"/studio/projects?stage=Görselleştirme",icon:"render",tone:"amber"},
    {label:"Ayarlar",href:"/studio/settings/project-types",icon:"settings",tone:"slate"},
  ];
  return <><section aria-labelledby="dashboard-widgets-title"><div className="mb-4"><p className="studio-eyebrow">Ofis Modülleri</p><h2 id="dashboard-widgets-title" className="mt-1 text-xl font-semibold tracking-[-.03em] text-[#283640]">Hızlı görünüm</h2></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">{items.map(item=><StudioCard as="article" key={item.title} className="p-0"><Link href={item.href} className="flex min-h-32 flex-col rounded-[inherit] p-4 outline-none transition hover:bg-[#f8fafb] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#668ba0]"><StudioIcon name={item.icon} className="h-5 w-5 text-[#668ba0]"/><p className="mt-3 text-xs font-semibold uppercase tracking-[.08em] text-[#8e969a]">{item.title}</p><p className="mt-1 truncate text-lg font-semibold text-[#2f3c44]">{item.value}</p><p className="mt-auto pt-2 text-[10px] text-[#92999d]">{item.detail}</p></Link></StudioCard>)}</div></section><StudioCard as="section" className="p-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="studio-eyebrow">Hızlı Erişim</p><h2 className="mt-1 text-xl font-semibold tracking-[-.03em] text-[#283640]">Çalışma alanları</h2></div><Link href="/studio/quick-access" className="text-xs font-semibold text-[#55798c]">Tümünü Gör →</Link></div><nav aria-label="Dashboard hızlı erişim" className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{shortcuts.map(shortcut=><Link key={shortcut.label} href={shortcut.href} className="group flex min-h-28 flex-col items-center justify-center rounded-[20px] border border-[#e2e7eb] bg-[#fafbfc] p-4 text-center shadow-[0_6px_18px_rgba(40,57,73,.04)] outline-none transition duration-150 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_12px_28px_rgba(40,57,73,.09)] focus-visible:ring-2 focus-visible:ring-[#668ba0]"><StudioIconSurface icon={shortcut.icon} tone={shortcut.tone} size="lg"/><span className="mt-3 text-sm font-semibold text-[#4d5a62]">{shortcut.label}</span></Link>)}</nav></StudioCard></>;
}
