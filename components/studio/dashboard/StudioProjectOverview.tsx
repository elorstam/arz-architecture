import Link from "next/link";

import {StudioIcon,type StudioIconName} from "@/components/studio/StudioIcons";
import {StudioBadge,StudioCard,StudioIconSurface,StudioSectionHeader,type StudioIconTone} from "@/components/studio/ui";
import {STATUS_LABELS,type OfficialProcess} from "@/lib/studio/official-processes/official-process-types";
import type {ProjectCardMilestone,StudioProject} from "@/lib/studio/projects/project-types";

const milestoneStyles:Record<ProjectCardMilestone["state"],string>={completed:"bg-[#55a66d]",current:"bg-[#4f8fac] ring-4 ring-[#dcebf2]",upcoming:"bg-[#d5dce0]",cancelled:"bg-[#c98c82]"};

function municipalityStatus(items:OfficialProcess[]){const active=items.filter(item=>!item.isArchived&&item.status!=="cancelled"),overdue=active.find(item=>item.isOverdue);if(overdue)return{label:"Gecikmiş işlem",variant:"danger" as const};const latest=active[0];if(!latest)return{label:"Süreç yok",variant:"neutral" as const};return{label:STATUS_LABELS[latest.status],variant:latest.status==="paid"||latest.status==="document_received"?"success" as const:"warning" as const};}

function projectIcon(project:StudioProject):{icon:StudioIconName;tone:StudioIconTone;label:string}{
  const text=`${project.name} ${project.category} ${project.summary}`.toLocaleLowerCase("tr-TR");
  if(text.includes("villa")||text.includes("konut"))return{icon:"home",tone:"green",label:"Konut"};
  if(text.includes("ofis")||text.includes("iş merkezi"))return{icon:"briefcase",tone:"blue",label:"Ofis"};
  if(text.includes("iç mimar")||text.includes("interior"))return{icon:"image",tone:"purple",label:"İç mimari"};
  if(text.includes("peyzaj")||text.includes("park"))return{icon:"sparkles",tone:"green",label:"Peyzaj"};
  if(text.includes("fabrika")||text.includes("depo")||text.includes("antrepo"))return{icon:"building",tone:"slate",label:"Endüstriyel"};
  if(text.includes("otel")||text.includes("restoran")||text.includes("kafe")||text.includes("mağaza")||text.includes("dükkan"))return{icon:"building",tone:"amber",label:"Ticari"};
  return{icon:"building",tone:"gold",label:"Mimari proje"};
}

function ProjectRow({project,processes}:{project:StudioProject;processes:OfficialProcess[]}){
  const municipality=municipalityStatus(processes),visual=projectIcon(project);
  return <article className="border-t border-[#edf0f2] p-4 transition-colors hover:bg-[#fafbfc]">
    <div className="flex min-w-0 items-start gap-3"><StudioIconSurface icon={visual.icon} tone={visual.tone} size="lg"/><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate text-sm font-semibold text-[#2e3a42]">{project.name}</h3><p className="mt-1 truncate text-xs text-[#89939a]">{project.location||visual.label}</p></div><strong className="shrink-0 text-sm text-[#43515a]">%{project.progress}</strong></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e8edf0]" role="progressbar" aria-label={`${project.name} ilerleme`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={project.progress}><span className="block h-full rounded-full bg-[#5c8fa8]" style={{width:`${project.progress}%`}}/></div></div></div>
    <div className="mt-3 flex flex-wrap items-center gap-2"><div className="mr-1 flex items-center gap-1.5" aria-label={`${project.name} kilometre taşları`}>{project.cardMilestones.map(item=><span key={item.id} title={item.fullTitle} aria-label={`${item.fullTitle}: ${item.state}`} className={`h-2 w-2 shrink-0 rounded-full ${milestoneStyles[item.state]}`}/>)}</div><StudioBadge variant="info">{project.stage}</StudioBadge><StudioBadge variant={municipality.variant}>{municipality.label}</StudioBadge></div>
    <div className="mt-3 flex min-w-0 items-center justify-between gap-3"><div className="min-w-0 text-xs text-[#89939a]"><span className="font-semibold text-[#5e6970]">{project.lastUpdate}</span><span aria-hidden="true"> · </span><span>{project.responsible?.name??"Atanmadı"}</span></div><Link href={`/studio/projects/${project.id}`} className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#55798c] outline-none hover:text-[#365d72] focus-visible:ring-2 focus-visible:ring-[#668ba0]">Projeye Git <StudioIcon name="chevron-right" className="h-3.5 w-3.5"/></Link></div>
  </article>;
}

export default function StudioProjectOverview({projects,officialProcessesByProject}:{projects:StudioProject[];officialProcessesByProject:Record<string,OfficialProcess[]>}){
  return <section id="active-projects" aria-label="Aktif Projeler" className="h-full min-h-0"><StudioCard className="flex h-full min-h-0 flex-col overflow-hidden p-0"><div className="p-6"><StudioSectionHeader title="Aktif Projeler" description="Devam eden proje operasyonları" icon="folder" count={projects.length} action={<Link href="/studio/projects" className="text-xs font-semibold text-[#55798c]">Tümü →</Link>}/></div>{projects.length?<div className="min-h-0 flex-1 overflow-y-auto">{projects.map(project=><ProjectRow key={project.id} project={project} processes={officialProcessesByProject[project.id]??[]}/>)}</div>:<div className="studio-dashboard-empty mx-5 mb-5 flex-1"><StudioIcon name="folder" className="h-7 w-7"/><p className="mt-3 font-semibold text-[#33404a]">Aktif proje bulunmuyor</p></div>}</StudioCard></section>;
}
