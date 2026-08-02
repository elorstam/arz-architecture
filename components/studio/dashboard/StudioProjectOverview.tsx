import Link from "next/link";
import {StudioIcon} from "@/components/studio/StudioIcons";
import {StudioBadge,StudioMilestoneIcon,StudioSectionHeader,type StudioMilestoneVariant} from "@/components/studio/ui";
import type {OfficialProcess} from "@/lib/studio/official-processes/official-process-types";
import type {ProjectCardMilestone,StudioProject} from "@/lib/studio/projects/project-types";

const stateLabel:Record<ProjectCardMilestone["state"],string>={completed:"Tamamlandı",current:"Devam ediyor",upcoming:"Bekliyor",cancelled:"İptal"};
const stateVariant:Record<ProjectCardMilestone["state"],"success"|"info"|"neutral"|"danger">={completed:"success",current:"info",upcoming:"neutral",cancelled:"danger"};
const variants:StudioMilestoneVariant[]=["architecture","structural","mechanical","electrical","ground","permit","delivery"];

function Milestone({milestone,index,last}:{milestone:ProjectCardMilestone;index:number;last:boolean}) {
  return <div className="studio-dashboard-milestone">
    <StudioMilestoneIcon variant={variants[index]??"delivery"} size="xl" status={milestone.state} />
    {!last?<span aria-hidden="true" className={`studio-dashboard-milestone__line ${milestone.state==="completed"?"is-complete":""}`} />:null}
    <div className="mt-3 min-w-0">
      <p className="truncate text-sm font-semibold text-[#27333e]" title={milestone.fullTitle}>{milestone.title}</p>
      <StudioBadge variant={stateVariant[milestone.state]} icon={milestone.state==="completed"?"check":milestone.state==="cancelled"?"close":"clock"}>{stateLabel[milestone.state]}</StudioBadge>
    </div>
  </div>;
}

export default function StudioProjectOverview({projects,officialProcesses}:{projects:StudioProject[];officialProcesses:OfficialProcess[]}) {
  const project=projects[0];
  return <section aria-label="Proje Aşamaları" className="studio-dashboard-project-stages studio-card-v2">
    <StudioSectionHeader title="Proje Aşamaları" description={project?`${project.name} · ${project.client.name||"Müşteri bilgisi bulunmuyor"}`:"Aktif proje bulunmuyor"} icon="activity" count={project?.cardMilestones.length??0} action={project?<Link href={`/studio/projects/${project.id}/stages`} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-[#d9d3c6] bg-white px-3.5 text-sm font-semibold text-[#34414a] transition hover:border-[#ab925f] hover:bg-[#fbfaf6]">Tüm Aşamaları Gör <StudioIcon name="chevron-right" className="h-4 w-4" /></Link>:null} />
    {project?<>
      <div className="mt-6 flex min-w-0 items-center justify-between gap-4"><div className="min-w-0"><p className="text-sm text-[#69716f]">İlerleme</p><p className="mt-1 text-lg font-semibold text-[#26333c]">%{project.progress}</p></div><StudioBadge variant={project.status==="Aktif"?"success":"warning"} icon="activity">{project.status}</StudioBadge></div>
      <div className="studio-dashboard-milestone-track mt-6" role="list" aria-label={`${project.name} proje aşamaları`}>
        {project.cardMilestones.map((milestone,index)=><div role="listitem" key={milestone.id}><Milestone milestone={milestone} index={index} last={index===project.cardMilestones.length-1}/></div>)}
      </div>
      <p className="mt-5 text-xs text-[#858c88]">Son güncelleme: {project.lastUpdate}{officialProcesses.length?` · ${officialProcesses.length} resmi süreç`:""}</p>
    </>:<div role="status" className="studio-dashboard-empty mt-6"><StudioIcon name="folder" className="h-7 w-7"/><p className="mt-3 font-semibold text-[#33404a]">Henüz aktif proje bulunmuyor</p><p className="mt-1 text-sm text-[#747b78]">Proje oluşturduğunuzda aşama akışı burada görünecek.</p></div>}
  </section>;
}
