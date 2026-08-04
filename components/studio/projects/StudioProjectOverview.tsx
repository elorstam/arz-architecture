import type {StudioProject} from "@/components/studio/projects/StudioProjectData";
import StudioProjectActivity from "@/components/studio/projects/StudioProjectActivity";
import StudioProjectClientCard from "@/components/studio/projects/StudioProjectClientCard";
import StudioProjectMilestones from "@/components/studio/projects/StudioProjectMilestones";
import StudioProjectTeam from "@/components/studio/projects/StudioProjectTeam";
import {StudioBadge,StudioCard,StudioEmptyState,StudioIconSurface,StudioSectionHeader} from "@/components/studio/ui";

export default function StudioProjectOverview({project}:{project:StudioProject}){
 return <div className="mt-4 space-y-4">
  <div className="grid min-w-0 items-stretch gap-4 lg:grid-cols-2 xl:grid-cols-3">
   <StudioCard as="section" className="h-full p-4"><StudioSectionHeader title="Proje Özeti" description="Kapsam ve mevcut çalışma fazı" icon="building"/><p className="mt-4 text-[13px] leading-6 text-[#56636b]">{project.summary||"Proje özeti henüz eklenmedi."}</p><div className="mt-4 border-t border-[#e7ecf3] pt-3"><div className="flex items-center justify-between gap-3"><span className="text-[11px] text-[#82909a]">Mevcut faz</span><StudioBadge variant="info">{project.stage}</StudioBadge></div><p className="mt-2 text-[12px] leading-5 text-[#64748b]">{project.currentPhase||"Faz açıklaması bulunmuyor."}</p></div></StudioCard>
   <StudioCard as="section" className="h-full p-4"><StudioSectionHeader title="Sıradaki Adım" description="Yaklaşan proje aksiyonu" icon="chevron-right"/><div className="mt-4 flex items-start gap-3"><StudioIconSurface icon="calendar" tone="blue" size="lg"/><div className="min-w-0"><p className="text-[11px] text-[#82909a]">Şu anki aşama</p><p className="mt-0.5 truncate text-[13px] font-semibold text-[#1e293b]">{project.stage}</p><p className="mt-3 text-[11px] text-[#82909a]">Sonraki aşama</p><p className="mt-0.5 truncate text-[14px] font-semibold text-[#1e293b]">{project.nextMilestone||"Belirtilmedi"}</p></div></div><div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#e7ecf3] pt-3 text-[11px]"><div><p className="text-[#82909a]">Beklenen tarih</p><p className="mt-1 font-semibold text-[#334155]">{project.nextMilestoneDate}</p></div><div><p className="text-[#82909a]">Durum</p><div className="mt-1"><StudioBadge variant="warning">{project.status}</StudioBadge></div></div></div><div className="mt-3 flex items-center justify-between text-[11px]"><span className="text-[#64748b]">İlerleme</span><strong>%{project.progress}</strong></div><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#e8eef4]"><span className="block h-full rounded-full bg-[#4f8fac]" style={{width:`${project.progress}%`}}/></div></StudioCard>
   <StudioProjectTeam members={project.team}/>
  </div>

  <div className="grid min-w-0 items-stretch gap-4 lg:grid-cols-2 xl:grid-cols-3">
   <StudioProjectClientCard client={project.client} location={project.location}/>
   <StudioProjectMilestones project={project}/>
   <StudioProjectActivity items={project.activities}/>
  </div>

  <StudioCard as="section" className="p-4"><StudioSectionHeader title="Proje Notları" description="Projeye ait salt okunur notlar" icon="file-text" count={project.notes.length}/>{project.notes.length?<div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{project.notes.map((note,index)=><StudioCard as="article" key={`${index}-${note}`} className="bg-[#f8fafc] p-4 shadow-none"><div className="flex items-center justify-between gap-3 text-[11px] text-[#82909a]"><span>Proje notu</span><span>Tarih —</span></div><p className="mt-3 text-[13px] leading-5 text-[#475569]">{note}</p><p className="mt-3 text-[11px] text-[#94a3b8]">Yazan kişi bilgisi mevcut değil</p></StudioCard>)}</div>:<div className="mt-4"><StudioEmptyState icon="file-text" title="Proje notu bulunmuyor" description="Bu proje için kayıtlı not bulunmuyor."/></div>}</StudioCard>
 </div>;
}
