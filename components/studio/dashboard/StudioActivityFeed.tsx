import Link from "next/link";

import StudioDashboardIconSurface,{type DashboardIconName,type DashboardIconTone} from "@/components/studio/dashboard/StudioDashboardIconSurface";

export type DashboardActivity={projectId:string;project:string;event:string;type:string;actor:string;time:string};

function activityVisual(type:string):{icon:DashboardIconName;tone:DashboardIconTone}{
  const normalized=type.toLocaleLowerCase("tr-TR");
  if(normalized.includes("render"))return{icon:"image",tone:"purple"};
  if(normalized.includes("revizyon"))return{icon:"activity",tone:"orange"};
  if(normalized.includes("dosya")||normalized.includes("yükle"))return{icon:"folder",tone:"blue"};
  if(normalized.includes("ödeme")||normalized.includes("finans"))return{icon:"wallet",tone:"green"};
  return{icon:"building",tone:"slate"};
}

export default function StudioActivityFeed({items}: {items:DashboardActivity[]}) {
  return <section aria-labelledby="activity-title" className="flex h-full min-h-0 flex-col overflow-hidden rounded-[20px] border border-[#e1e6ea] bg-white shadow-[0_10px_30px_rgba(40,57,73,.05)]">
    <div className="border-b border-[#edf0f2] px-4 py-4"><h2 id="activity-title" className="text-base font-semibold tracking-[-.025em] text-[#2d353b]">Son Aktiviteler</h2><p className="mt-0.5 text-xs text-[#89939a]">Aktif projelerdeki son işlemler</p></div>
    <div className={`min-h-0 flex-1 overflow-y-auto px-4 ${items.length?"py-1":"flex items-center justify-center"}`}>{items.length?items.map((item,index)=>{const visual=activityVisual(item.type);return <Link key={`${item.projectId}-${item.event}-${index}`} href={`/studio/projects/${item.projectId}`} className="group relative flex min-h-[56px] gap-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[#668ba0]">
      {index<items.length-1?<span aria-hidden="true" className="absolute left-[19px] top-10 h-[calc(100%-.25rem)] w-px bg-[#e5e9ec]"/>:null}
      <StudioDashboardIconSurface icon={visual.icon} tone={visual.tone} size="sm" className="relative z-10"/>
      <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><p className="truncate text-[13px] font-semibold text-[#354149]">{item.project}</p><span className="shrink-0 text-[11px] text-[#a0a7ab]">{item.time}</span></div><div className="mt-0.5 flex min-w-0 items-center justify-between gap-2"><p className="truncate text-[11px] leading-4 text-[#79838a]">{item.event} · {item.actor} · {item.type}</p><span aria-hidden="true" className="text-xs text-[#a6afb4] transition-transform duration-150 group-hover:translate-x-0.5">→</span></div></div>
    </Link>}):<p role="status" className="text-center text-xs text-[#89939a]">Henüz proje aktivitesi bulunmuyor.</p>}</div>
  </section>;
}
