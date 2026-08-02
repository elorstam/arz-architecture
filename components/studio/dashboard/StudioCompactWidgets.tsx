import Link from "next/link";

import {type StudioIconName} from "@/components/studio/StudioIcons";
import {StudioCard,StudioIconSurface,type StudioIconTone} from "@/components/studio/ui";
import type {StudioLeadSummary} from "@/lib/studio/crm/lead-types";
import type {FinanceDashboard} from "@/lib/studio/finance/finance-types";
import {money} from "@/lib/studio/finance/finance-validation";
import type {StudioQuickAccessData} from "@/lib/studio/quick-access/quick-access-types";
import type {StudioQuoteSummary} from "@/lib/studio/quotes/quote-types";

type Widget={title:string;value:string;detail:string;href:string;icon:StudioIconName;tone:StudioIconTone};

const shortcuts:Array<{label:string;href:string;icon:StudioIconName;tone:StudioIconTone}>=[
  {label:"Projeler",href:"/studio/projects",icon:"folder",tone:"blue"},
  {label:"CRM",href:"/studio/crm",icon:"clients",tone:"green"},
  {label:"Finans",href:"/studio/finance",icon:"wallet",tone:"purple"},
  {label:"Ayarlar",href:"/studio/settings/project-types",icon:"settings",tone:"slate"},
];

export default function StudioCompactWidgets({finance,quotes,crm,renderCount,quickAccess}:{finance:FinanceDashboard;quotes:StudioQuoteSummary;crm:StudioLeadSummary;renderCount:number;quickAccess:StudioQuickAccessData}){
  const quickCount=quickAccess.available?quickAccess.favorites.length+quickAccess.recent.length:0;
  const items:Widget[]=[
    {title:"Finans",value:finance.available?money(finance.summary.monthCollected):"—",detail:"Bu ay tahsilat",href:"/studio/finance",icon:"payments",tone:"blue"},
    {title:"Teklifler",value:String(quotes.awaitingApproval),detail:"Onay bekliyor",href:"/studio/quotes",icon:"receipt",tone:"gold"},
    {title:"CRM",value:String(crm.newLeads),detail:"Yeni lead",href:"/studio/crm",icon:"clients",tone:"green"},
    {title:"Render Kuyruğu",value:String(renderCount),detail:"Güncel çalışma",href:"/studio/projects?stage=Görselleştirme",icon:"render",tone:"amber"},
    {title:"AI Kullanımı",value:"Görüntüle",detail:"Kullanım özeti",href:"/studio/ai-usage",icon:"sparkles",tone:"purple"},
  ];
  return <section aria-labelledby="dashboard-widgets-title"><div className="mb-3"><p className="studio-eyebrow">Ofis Modülleri</p><h2 id="dashboard-widgets-title" className="mt-0.5 text-base font-semibold tracking-[-.025em] text-[#283640]">Hızlı görünüm</h2></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 min-[1440px]:grid-cols-6">{items.map(item=><StudioCard as="article" key={item.title} className="p-0"><Link href={item.href} className="flex min-h-[116px] flex-col rounded-[inherit] p-4 outline-none transition hover:bg-[#f8fafb] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#668ba0]"><div className="flex items-center justify-between gap-2"><StudioIconSurface icon={item.icon} tone={item.tone} size="sm"/><p className="truncate text-lg font-semibold text-[#2f3c44]">{item.value}</p></div><p className="mt-2 text-xs font-semibold text-[#4d5960]">{item.title}</p><p className="mt-auto truncate pt-1 text-[11px] text-[#92999d]">{item.detail}</p></Link></StudioCard>)}<StudioCard as="article" className="min-h-[116px] p-3"><div className="flex items-center justify-between gap-2"><div><p className="text-xs font-semibold text-[#4d5960]">Hızlı Erişim</p><p className="text-[11px] text-[#92999d]">{quickCount} kayıt</p></div><Link href="/studio/quick-access" className="text-[11px] font-semibold text-[#55798c]">Tümü →</Link></div><nav aria-label="Dashboard hızlı erişim" className="mt-3 flex items-center justify-between gap-1">{shortcuts.map(shortcut=><Link key={shortcut.label} href={shortcut.href} aria-label={shortcut.label} title={shortcut.label} className="rounded-xl outline-none transition hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#668ba0]"><StudioIconSurface icon={shortcut.icon} tone={shortcut.tone} size="sm"/></Link>)}</nav></StudioCard></div></section>;
}
