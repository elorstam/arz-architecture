import type {ProjectCardMilestone} from "@/lib/studio/projects/project-types";

const stateLabel={completed:"Tamamlandı",current:"Devam Ediyor",upcoming:"Bekliyor",cancelled:"İptal"} as const;
const stateStyle={completed:"border-[#55a66d] bg-[#55a66d]",current:"border-[#4f8fac] bg-[#4f8fac] ring-4 ring-[#dcebf2]",upcoming:"border-[#cbd5df] bg-[#eef2f5]",cancelled:"border-[#c98c82] bg-[#c98c82]"} as const;

export default function StudioProjectCardMilestoneTimeline({items}:{items:ProjectCardMilestone[]}){
 const completed=items.filter(item=>item.state==="completed").length;
 const current=items.find(item=>item.state==="current");
 const next=items.find(item=>item.state==="upcoming");
 return <section aria-label="Proje ilerlemesi">
  <span className="sr-only">Proje İlerlemesi</span>
  <div className="flex min-w-0 items-center gap-1.5" role="list" aria-label="Milestone zaman çizelgesi">{items.map(item=><span key={item.id} role="listitem" title={`${item.fullTitle}: ${stateLabel[item.state]}`} aria-label={`${item.fullTitle}: ${stateLabel[item.state]}`} className={`h-2.5 w-2.5 flex-1 rounded-full border ${stateStyle[item.state]}`}/>)}</div>
  <div className="mt-2 flex min-w-0 items-center justify-between gap-3 text-[10px] text-[#64748b]"><span className="min-w-0 truncate" title={current?.fullTitle}>Şu an: <strong className="font-semibold text-[#334155]">{current?.title??"—"}</strong></span><span className="min-w-0 truncate text-right" title={next?.fullTitle}>Sonraki: <strong className="font-semibold text-[#334155]">{next?.title??"—"}</strong></span></div>
  <span className="sr-only">{completed} / {items.length} Kilometre Taşı Tamamlandı</span>
 </section>;
}
