import Link from "next/link";

import StudioDashboardIconSurface,{type DashboardIconName,type DashboardIconTone} from "@/components/studio/dashboard/StudioDashboardIconSurface";
import {StudioCard} from "@/components/studio/ui";
import type {StudioLeadSummary} from "@/lib/studio/crm/lead-types";
import type {FinanceDashboard} from "@/lib/studio/finance/finance-types";
import {money} from "@/lib/studio/finance/finance-validation";
import type {StudioQuickAccessData} from "@/lib/studio/quick-access/quick-access-types";
import type {StudioQuoteSummary} from "@/lib/studio/quotes/quote-types";

type LauncherItem={title:string;value:string;detail:string;href:string;icon:DashboardIconName;tone:DashboardIconTone};

const shortcuts:Array<{label:string;href:string;icon:DashboardIconName;tone:DashboardIconTone}>=[
  {label:"Dosyalar",href:"/studio/quick-access",icon:"folder",tone:"blue"},
  {label:"Takvim",href:"/studio/projects?archive=active",icon:"calendar",tone:"orange"},
  {label:"CRM",href:"/studio/crm",icon:"users",tone:"green"},
  {label:"Finans",href:"/studio/finance",icon:"wallet",tone:"purple"},
  {label:"Render",href:"/studio/projects?stage=Görselleştirme",icon:"image",tone:"yellow"},
  {label:"Ayarlar",href:"/studio/settings/project-types",icon:"settings",tone:"slate"},
];

export default function StudioCompactWidgets({finance,quotes,crm,renderCount,quickAccess}:{finance:FinanceDashboard;quotes:StudioQuoteSummary;crm:StudioLeadSummary;renderCount:number;quickAccess:StudioQuickAccessData}){
  const quickCount=quickAccess.available?quickAccess.favorites.length+quickAccess.recent.length:0;
  const items:LauncherItem[]=[
    {title:"Finans",value:finance.available?money(finance.summary.monthCollected):"—",detail:"Bu ay tahsilat",href:"/studio/finance",icon:"wallet",tone:"blue"},
    {title:"Teklifler",value:String(quotes.awaitingApproval),detail:"Onay bekliyor",href:"/studio/quotes",icon:"receipt",tone:"yellow"},
    {title:"CRM",value:String(crm.newLeads),detail:"Yeni müşteri adayı",href:"/studio/crm",icon:"users",tone:"green"},
    {title:"Render",value:String(renderCount),detail:"Kuyruktaki çalışma",href:"/studio/projects?stage=Görselleştirme",icon:"image",tone:"orange"},
    {title:"AI Kullanımı",value:"Aç",detail:"Kullanım özeti",href:"/studio/ai-usage",icon:"sparkles",tone:"purple"},
  ];
  return <section aria-label="Ofis modülleri ve hızlı erişim" className="grid min-w-0 gap-3 min-[1280px]:grid-cols-[minmax(0,1fr)_320px]">
    <StudioCard className="min-w-0 p-3.5"><div className="mb-2.5 flex items-end justify-between gap-3"><div><h2 className="text-[15px] font-bold text-[#27343d]">Ofis Modülleri</h2><p className="text-[11px] font-medium text-[#8a949b]">Günlük çalışma alanları</p></div></div><div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-5">{items.map(item=><Link key={item.title} href={item.href} className="group flex min-h-[104px] min-w-0 items-center gap-3 rounded-[17px] border border-[#e8ebee] bg-[#fbfcfd] p-3 outline-none transition duration-180 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_10px_22px_rgba(40,57,73,.08)] focus-visible:ring-2 focus-visible:ring-[#668ba0]"><StudioDashboardIconSurface icon={item.icon} tone={item.tone}/><div className="min-w-0"><p className="truncate text-[13px] font-bold text-[#34414a]">{item.title}</p><p className="mt-1 truncate text-sm font-semibold text-[#56636c]">{item.value}</p><p className="mt-0.5 truncate text-[10px] text-[#929ba0]">{item.detail}</p></div></Link>)}</div></StudioCard>
    <StudioCard className="p-3.5"><div className="mb-2 flex items-end justify-between gap-2"><div><h2 className="text-[15px] font-bold text-[#27343d]">Hızlı Erişim</h2><p className="text-[11px] font-medium text-[#8a949b]">{quickCount} kayıtlı öğe</p></div><Link href="/studio/quick-access" className="text-[11px] font-semibold text-[#55798c]">Tümü →</Link></div><nav aria-label="Dashboard hızlı erişim" className="grid grid-cols-2 gap-2">{shortcuts.map(shortcut=><Link key={shortcut.label} href={shortcut.href} className="group flex min-h-12 items-center gap-2.5 rounded-[15px] border border-[#e8ebee] bg-[#fbfcfd] px-2.5 outline-none transition duration-180 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_8px_18px_rgba(40,57,73,.07)] focus-visible:ring-2 focus-visible:ring-[#668ba0]"><StudioDashboardIconSurface icon={shortcut.icon} tone={shortcut.tone} size="sm"/><span className="truncate text-xs font-semibold text-[#536069]">{shortcut.label}</span></Link>)}</nav></StudioCard>
  </section>;
}
