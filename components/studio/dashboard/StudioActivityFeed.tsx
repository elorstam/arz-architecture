import Link from "next/link";

import {StudioActivityIcon,type StudioActivityVariant} from "@/components/studio/ui";

export type DashboardActivity={projectId:string;project:string;event:string;type:string;actor:string;time:string};

function activityVariant(type:string):StudioActivityVariant{
  const normalized=type.toLocaleLowerCase("tr-TR");
  if(normalized.includes("render"))return "render";
  if(normalized.includes("revizyon"))return "revision";
  if(normalized.includes("dosya")||normalized.includes("yükle"))return "file";
  if(normalized.includes("ödeme")||normalized.includes("finans"))return "finance";
  return "project";
}

export default function StudioActivityFeed({items}: {items:DashboardActivity[]}) {
  return <section aria-labelledby="activity-title" className="overflow-hidden rounded-[20px] border border-[#e1e6ea] bg-white shadow-[0_10px_30px_rgba(40,57,73,.05)]">
    <div className="border-b border-[#edf0f2] px-5 py-5"><h2 id="activity-title" className="text-lg font-semibold tracking-[-.025em] text-[#2d353b]">Son Aktiviteler</h2><p className="mt-1 text-sm text-[#89939a]">Aktif projelerdeki son işlemler</p></div>
    <div className="px-5 py-1">{items.length?items.map((item,index)=><Link key={`${item.projectId}-${item.event}-${index}`} href={`/studio/projects/${item.projectId}`} className="group relative flex gap-4 py-4 outline-none focus-visible:ring-2 focus-visible:ring-[#668ba0]">
      {index<items.length-1?<span aria-hidden="true" className="absolute left-[27px] top-14 h-[calc(100%-1rem)] w-px bg-[#e5e9ec]"/>:null}
      <StudioActivityIcon variant={activityVariant(item.type)} size="lg" className="relative z-10"/>
      <div className="min-w-0 flex-1 pt-0.5"><div className="flex items-start justify-between gap-3"><p className="truncate text-sm font-semibold text-[#354149]">{item.project}</p><span className="shrink-0 text-xs text-[#a0a7ab]">{item.time}</span></div><p className="mt-1 text-sm leading-5 text-[#657078]">{item.event}</p><div className="mt-2 flex items-center justify-between gap-3"><p className="text-xs text-[#91999e]">{item.actor} · {item.type}</p><span aria-hidden="true" className="text-[#a6afb4] transition-transform duration-150 group-hover:translate-x-0.5">→</span></div></div>
    </Link>):<p role="status" className="py-8 text-center text-sm text-[#89939a]">Henüz proje aktivitesi bulunmuyor.</p>}</div>
  </section>;
}
