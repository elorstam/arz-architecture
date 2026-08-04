import type {StudioProject} from "@/components/studio/projects/StudioProjectData";
import {StudioCard,StudioEmptyState,StudioIconSurface,StudioSectionHeader} from "@/components/studio/ui";

export default function StudioProjectMilestones({project}:{project:StudioProject}){
 const dates=[
  {title:"Başlangıç",date:project.startDate,description:"Proje başlangıç tarihi",state:"completed" as const},
  ...project.milestones,
  {title:project.nextMilestone||"Sıradaki adım",date:project.nextMilestoneDate,description:"Beklenen sonraki kilometre taşı",state:"current" as const},
  {title:"Teslim",date:project.targetDate,description:"Hedef proje teslimi",state:"upcoming" as const},
 ].filter(item=>item.date&&item.date!=="—");
 return <StudioCard as="section" className="h-full overflow-hidden p-0"><div className="p-4"><StudioSectionHeader title="Önemli Tarihler" description="Proje takvimi ve kilometre taşları" icon="calendar" count={dates.length}/></div>{dates.length?<div className="max-h-[300px] overflow-y-auto border-t border-[#e7ecf3] px-4">{dates.map((item,index)=><article key={`${item.title}-${index}`} className="relative grid min-h-[58px] grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3 border-b border-[#e7ecf3] py-2 last:border-0"><StudioIconSurface icon={item.state==="completed"?"check":item.state==="current"?"activity":"clock"} tone={item.state==="completed"?"green":item.state==="current"?"blue":"slate"} size="sm"/><div className="min-w-0"><h3 className="truncate text-[12px] font-semibold text-[#1e293b]">{item.title}</h3><p className="truncate text-[11px] text-[#82909a]">{item.description}</p></div><time className="shrink-0 text-[11px] font-medium text-[#64748b]">{item.date}</time></article>)}</div>:<StudioEmptyState icon="calendar" title="Önemli tarih bulunmuyor" description="Bu proje için takvim bilgisi bulunmuyor."/>}</StudioCard>;
}
