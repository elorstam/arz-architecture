import Link from "next/link";

import {StudioIcon} from "@/components/studio/StudioIcons";
import {StudioBadge,StudioCard,StudioSectionHeader} from "@/components/studio/ui";
import {STATUS_LABELS,type OfficialProcess} from "@/lib/studio/official-processes/official-process-types";
import type {ProjectCardMilestone,StudioProject} from "@/lib/studio/projects/project-types";

const milestoneStyles:Record<ProjectCardMilestone["state"],string>={completed:"bg-[#55a66d]",current:"bg-[#4f8fac] ring-4 ring-[#dcebf2]",upcoming:"bg-[#d5dce0]",cancelled:"bg-[#c98c82]"};

function municipalityStatus(items:OfficialProcess[]){
  const active=items.filter(item=>!item.isArchived&&item.status!=="cancelled");
  const overdue=active.find(item=>item.isOverdue);
  if(overdue)return {label:"Gecikmiş işlem",variant:"danger" as const};
  const latest=active[0];
  if(!latest)return {label:"Süreç yok",variant:"neutral" as const};
  return {label:STATUS_LABELS[latest.status],variant:latest.status==="paid"||latest.status==="document_received"?"success" as const:"warning" as const};
}

function ProjectRow({project,processes}:{project:StudioProject;processes:OfficialProcess[]}){
  const municipality=municipalityStatus(processes);
  return <Link href={`/studio/projects/${project.id}`} aria-label={`${project.name} projesine git`} className="group grid min-w-0 items-center gap-4 border-t border-[#edf0f2] px-4 py-4 outline-none transition-colors hover:bg-[#fafbfc] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#668ba0] md:grid-cols-[minmax(220px,1.35fr)_minmax(150px,.8fr)_minmax(170px,.9fr)_minmax(130px,.72fr)] xl:grid-cols-[minmax(250px,1.35fr)_minmax(190px,.85fr)_minmax(200px,1fr)_minmax(120px,.65fr)_minmax(140px,.72fr)_minmax(125px,.65fr)]">
    <div className="flex min-w-0 items-center gap-3"><div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-[#e9edf0]">{project.thumbnail?<span className="absolute inset-0 bg-cover bg-center" style={{backgroundImage:`url("${project.thumbnail}")`}}/>:<span className="absolute inset-0 bg-[linear-gradient(135deg,#dce4e9,#eef1f3)]"/>}<span className="absolute bottom-1 left-1 rounded bg-white/90 px-1.5 py-0.5 text-[9px] font-bold text-[#66747d]">{project.code}</span></div><div className="min-w-0"><h3 className="truncate text-sm font-semibold text-[#2e3a42]">{project.name}</h3><p className="mt-1 truncate text-xs text-[#89939a]">{project.client.name||"Müşteri bilgisi yok"}</p></div></div>
    <div><div className="flex items-center justify-between gap-2 text-xs"><span className="text-[#89939a]">İlerleme</span><strong className="text-[#43515a]">%{project.progress}</strong></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e8edf0]" role="progressbar" aria-label={`${project.name} ilerleme`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={project.progress}><span className="block h-full rounded-full bg-[#5c8fa8]" style={{width:`${project.progress}%`}}/></div></div>
    <div className="flex items-center gap-2" aria-label={`${project.name} kilometre taşları`}>{project.cardMilestones.map(item=><span key={item.id} title={item.fullTitle} className={`h-2.5 w-2.5 shrink-0 rounded-full ${milestoneStyles[item.state]}`}/>)}</div>
    <div className="min-w-0"><p className="mb-1 text-[10px] font-semibold uppercase tracking-[.08em] text-[#a0a8ad] md:hidden">Güncel aşama</p><StudioBadge variant="info">{project.stage}</StudioBadge></div>
    <div className="min-w-0 md:col-span-2 xl:col-span-1"><p className="mb-1 text-[10px] font-semibold uppercase tracking-[.08em] text-[#a0a8ad] md:hidden">Belediye</p><StudioBadge variant={municipality.variant}>{municipality.label}</StudioBadge></div>
    <div className="flex min-w-0 items-center justify-between gap-3 md:col-span-2 xl:col-span-1"><div className="min-w-0"><p className="truncate text-xs font-semibold text-[#53616a]">{project.lastUpdate}</p><p className="mt-1 truncate text-[11px] text-[#929ba0]">{project.responsible?.name??"Atanmadı"}</p></div><StudioIcon name="chevron-right" className="h-4 w-4 shrink-0 text-[#a3adb2] transition-transform group-hover:translate-x-0.5"/></div>
  </Link>;
}

export default function StudioProjectOverview({projects,officialProcessesByProject}:{projects:StudioProject[];officialProcessesByProject:Record<string,OfficialProcess[]>}){
  return <section id="active-projects" aria-label="Aktif Projeler" className="min-w-0"><StudioSectionHeader title="Aktif Projeler" description="Ofiste devam eden tüm projelerin operasyon görünümü" icon="folder" count={projects.length} action={<Link href="/studio/projects" className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-[#d9dfe3] bg-white px-3.5 text-sm font-semibold text-[#34414a] transition hover:border-[#9fb4c0] hover:bg-[#fafbfc]">Tüm Projeler <StudioIcon name="chevron-right" className="h-4 w-4"/></Link>}/>
    {projects.length?<StudioCard className="mt-5 overflow-hidden p-0"><div className="hidden grid-cols-[minmax(250px,1.35fr)_minmax(190px,.85fr)_minmax(200px,1fr)_minmax(120px,.65fr)_minmax(140px,.72fr)_minmax(125px,.65fr)] gap-4 bg-[#fafbfc] px-4 py-3 text-[10px] font-semibold uppercase tracking-[.09em] text-[#929ba0] xl:grid"><span>Proje</span><span>İlerleme</span><span>Milestone</span><span>Güncel aşama</span><span>Belediye</span><span>Son işlem · Sorumlu</span></div>{projects.map(project=><ProjectRow key={project.id} project={project} processes={officialProcessesByProject[project.id]??[]}/>)}</StudioCard>:<StudioCard className="studio-dashboard-empty mt-5"><StudioIcon name="folder" className="h-7 w-7"/><p className="mt-3 font-semibold text-[#33404a]">Aktif proje bulunmuyor</p><p className="mt-1 text-sm text-[#747b78]">Yeni veya arşivden çıkarılan projeler burada görünür.</p></StudioCard>}
  </section>;
}
