import Link from "next/link";

import {StudioIcon} from "@/components/studio/StudioIcons";
import {StudioBadge,StudioCard,StudioSectionHeader} from "@/components/studio/ui";
import {STATUS_LABELS,type OfficialProcess} from "@/lib/studio/official-processes/official-process-types";
import type {ProjectCardMilestone,StudioProject} from "@/lib/studio/projects/project-types";

const milestoneStateStyles:Record<ProjectCardMilestone["state"],string>={
  completed:"border-[#bad2c0] bg-[#eaf4ed] text-[#477058]",
  current:"border-[#b9d0df] bg-[#eaf3f8] text-[#4d758b]",
  upcoming:"border-[#dde2e5] bg-[#f3f5f6] text-[#78848a]",
  cancelled:"border-[#e1c3bd] bg-[#f8eeec] text-[#9b5c51]",
};

function municipalityStatus(items:OfficialProcess[]){
  const active=items.filter(item=>!item.isArchived&&item.status!=="cancelled");
  const overdue=active.find(item=>item.isOverdue);
  if(overdue)return {label:"Gecikmiş işlem",variant:"danger" as const};
  const latest=active[0];
  if(!latest)return {label:"Süreç yok",variant:"neutral" as const};
  return {label:STATUS_LABELS[latest.status],variant:latest.status==="paid"||latest.status==="document_received"?"success" as const:"warning" as const};
}

function ProjectCard({project,processes}:{project:StudioProject;processes:OfficialProcess[]}){
  const municipality=municipalityStatus(processes);
  return <StudioCard as="article" className="group relative flex min-w-0 flex-col overflow-hidden p-0 transition duration-200 hover:-translate-y-0.5 hover:border-[#becfda] hover:shadow-[0_18px_42px_rgba(40,57,73,.11)]">
    <Link href={`/studio/projects/${project.id}`} aria-label={`${project.name} projesine git`} className="flex h-full min-w-0 flex-col rounded-[inherit] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#668ba0]">
      <div className="flex min-w-0 items-start justify-between gap-4 border-b border-[#e8edf0] bg-[linear-gradient(135deg,#fbfcfd_0%,#f3f7f9_100%)] p-5">
        <div className="min-w-0"><p className="text-[9px] font-semibold uppercase tracking-[.14em] text-[#9a8253]">{project.code}</p><h3 className="mt-1 truncate text-lg font-semibold tracking-[-.025em] text-[#26343d]">{project.name}</h3><p className="mt-1 truncate text-sm text-[#778188]">{project.client.name||"Müşteri bilgisi yok"}</p></div>
        <StudioBadge variant={project.status==="Aktif"?"success":"warning"} icon="activity">{project.status}</StudioBadge>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-end justify-between gap-4"><div><p className="text-xs text-[#7b858b]">İlerleme</p><p className="mt-1 text-2xl font-semibold tracking-[-.04em] text-[#283640]">%{project.progress}</p></div><p className="max-w-[55%] truncate text-right text-xs font-semibold text-[#57788a]">{project.stage}</p></div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#e9eef1]" role="progressbar" aria-label={`${project.name} ilerleme`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={project.progress}><span className="block h-full rounded-full bg-[linear-gradient(90deg,#6e9ab0,#557f94)]" style={{width:`${project.progress}%`}} /></div>
        <div className="mt-5 flex flex-wrap gap-1.5" aria-label={`${project.name} kilometre taşları`}>
          {project.cardMilestones.map(item=><span key={item.id} title={item.fullTitle} className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${milestoneStateStyles[item.state]}`}>{item.title}</span>)}
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[#e9edf0] pt-4 text-xs">
          <div><dt className="text-[#92999d]">Güncel aşama</dt><dd className="mt-1 truncate font-semibold text-[#4a565d]">{project.currentPhase||project.stage}</dd></div>
          <div><dt className="text-[#92999d]">Belediye durumu</dt><dd className="mt-1"><StudioBadge variant={municipality.variant}>{municipality.label}</StudioBadge></dd></div>
          <div><dt className="text-[#92999d]">Son işlem</dt><dd className="mt-1 truncate font-semibold text-[#4a565d]">{project.lastUpdate}</dd></div>
          <div><dt className="text-[#92999d]">Sorumlu</dt><dd className="mt-1 truncate font-semibold text-[#4a565d]">{project.responsible?.name??"Atanmadı"}</dd></div>
        </dl>
        <span className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-xl bg-[#263640] px-4 text-sm font-semibold text-white transition group-hover:bg-[#385568]">Projeye Git <StudioIcon name="chevron-right" className="h-4 w-4" /></span>
      </div>
    </Link>
  </StudioCard>;
}

export default function StudioProjectOverview({projects,officialProcessesByProject}:{projects:StudioProject[];officialProcessesByProject:Record<string,OfficialProcess[]>}){
  return <section aria-label="Aktif Projeler" className="min-w-0">
    <StudioSectionHeader title="Aktif Projeler" description="Ofiste devam eden tüm projelerin operasyon görünümü" icon="folder" count={projects.length} action={<Link href="/studio/projects" className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-[#d9d3c6] bg-white px-3.5 text-sm font-semibold text-[#34414a] transition hover:border-[#ab925f] hover:bg-[#fbfaf6]">Tüm Projeler <StudioIcon name="chevron-right" className="h-4 w-4" /></Link>} />
    {projects.length?<div className="mt-5 grid min-w-0 gap-5 md:grid-cols-2 2xl:grid-cols-3">{projects.map(project=><ProjectCard key={project.id} project={project} processes={officialProcessesByProject[project.id]??[]}/>)}</div>:<StudioCard className="studio-dashboard-empty mt-5"><StudioIcon name="folder" className="h-7 w-7"/><p className="mt-3 font-semibold text-[#33404a]">Aktif proje bulunmuyor</p><p className="mt-1 text-sm text-[#747b78]">Yeni veya arşivden çıkarılan projeler burada görünür.</p></StudioCard>}
  </section>;
}
