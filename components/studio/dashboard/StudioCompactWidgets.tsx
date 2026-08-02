import Link from "next/link";

import {StudioIcon,type StudioIconName} from "@/components/studio/StudioIcons";
import {StudioCard} from "@/components/studio/ui";
import type {StudioLeadSummary} from "@/lib/studio/crm/lead-types";
import type {FinanceDashboard} from "@/lib/studio/finance/finance-types";
import {money} from "@/lib/studio/finance/finance-validation";
import type {StudioQuickAccessData} from "@/lib/studio/quick-access/quick-access-types";
import type {StudioQuoteSummary} from "@/lib/studio/quotes/quote-types";

type Widget={title:string;value:string;detail:string;href:string;icon:StudioIconName};

export default function StudioCompactWidgets({finance,quotes,crm,renderCount,quickAccess}:{finance:FinanceDashboard;quotes:StudioQuoteSummary;crm:StudioLeadSummary;renderCount:number;quickAccess:StudioQuickAccessData}){
  const quickCount=quickAccess.available?quickAccess.favorites.length+quickAccess.recent.length:0;
  const items:Widget[]=[
    {title:"Finans",value:finance.available?money(finance.summary.monthCollected):"—",detail:"Bu ay tahsilat",href:"/studio/finance",icon:"payments"},
    {title:"Teklifler",value:String(quotes.awaitingApproval),detail:"Onay bekliyor",href:"/studio/quotes",icon:"receipt"},
    {title:"CRM",value:String(crm.newLeads),detail:"Yeni lead",href:"/studio/crm",icon:"clients"},
    {title:"Render Kuyruğu",value:String(renderCount),detail:"Güncel çalışma",href:"/studio/projects",icon:"render"},
    {title:"AI Kullanımı",value:"Görüntüle",detail:"Kullanım özeti",href:"/studio/ai-usage",icon:"sparkles"},
    {title:"Quick Access",value:String(quickCount),detail:"Kayıtlı ve son açılan",href:"/studio/quick-access",icon:"star"},
  ];
  return <section aria-labelledby="dashboard-widgets-title"><div className="mb-4"><p className="studio-eyebrow">Ofis Modülleri</p><h2 id="dashboard-widgets-title" className="mt-1 text-xl font-semibold tracking-[-.03em] text-[#283640]">Hızlı görünüm</h2></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">{items.map(item=><StudioCard as="article" key={item.title} className="p-0"><Link href={item.href} className="flex min-h-32 flex-col rounded-[inherit] p-4 outline-none transition hover:bg-[#f8fafb] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#668ba0]"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#edf3f6] text-[#55798c]"><StudioIcon name={item.icon} className="h-4 w-4"/></span><p className="mt-3 text-xs font-semibold uppercase tracking-[.08em] text-[#8e969a]">{item.title}</p><p className="mt-1 truncate text-lg font-semibold text-[#2f3c44]">{item.value}</p><p className="mt-auto pt-2 text-[10px] text-[#92999d]">{item.detail}</p></Link></StudioCard>)}</div></section>;
}
