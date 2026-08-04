import Link from "next/link";
import type {ReactNode} from "react";

import {StudioIcon} from "@/components/studio/StudioIcons";
import type {StudioProject} from "@/components/studio/projects/StudioProjectData";
import StudioProjectStatusBadge from "@/components/studio/projects/StudioProjectStatusBadge";
import {StudioBadge,StudioCard,StudioIconSurface} from "@/components/studio/ui";

export default function StudioProjectDetailHeader({project,favoriteAction,dangerAction}:{project:StudioProject;favoriteAction:ReactNode;dangerAction?:ReactNode}){
 const info=[
  {label:"Sorumlu kişi",value:project.responsible?.name??"Atanmadı",detail:project.responsible?.role??"Proje sorumlusu",icon:"user" as const,tone:"blue" as const},
  {label:"Son güncelleme",value:project.lastUpdate,detail:"Son proje hareketi",icon:"activity" as const,tone:"green" as const},
  {label:"Sonraki kilometre taşı",value:project.nextMilestone||"Belirtilmedi",detail:project.nextMilestoneDate,icon:"calendar" as const,tone:"orange" as const},
  {label:"Oluşturma tarihi",value:"—",detail:"Kayıt verisinde bulunmuyor",icon:"clock" as const,tone:"slate" as const},
 ];
 return <header>
  <StudioCard as="section" className="overflow-hidden rounded-[22px] border-[#e5eaf0] bg-white p-0 shadow-[0_8px_26px_rgba(40,57,73,.055)]">
   <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-b border-[#e7ecf3] px-5 py-3">
    <Link href="/studio/projects" className="inline-flex items-center gap-2 rounded-md text-[12px] font-medium text-[#64748b] outline-none transition-colors hover:text-[#1e293b] focus-visible:ring-2 focus-visible:ring-[#64748b]/30"><StudioIcon name="arrow" className="h-4 w-4 rotate-180"/>Projelere Dön</Link>
    <div className="flex flex-wrap items-center justify-end gap-2"><span className="[&_button]:!border-[#d9e2ec] [&_button]:!bg-[#f8fafc] [&_button]:!text-[#475569] [&_button]:hover:!bg-[#eef3f8]">{favoriteAction}</span>{project.canManage?<Link href={`/studio/projects/${project.id}/edit`} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#d9e2ec] bg-[#f8fafc] px-4 text-[11px] font-semibold text-[#475569] transition hover:bg-[#eef3f8] focus-visible:ring-2 focus-visible:ring-[#64748b]/30"><StudioIcon name="settings" className="h-4 w-4"/>Projeyi Düzenle</Link>:null}{dangerAction}</div>
   </div>
   <div className="grid min-w-0 gap-5 bg-[#f7f9fc] p-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(420px,.85fr)] lg:items-stretch">
    <div className="flex min-w-0 flex-col justify-center rounded-2xl border border-[#e5eaf0] bg-white p-5">
     <div className="flex flex-wrap items-center gap-2"><span className="rounded-lg bg-[#eef3f8] px-2.5 py-1 text-[11px] font-semibold tracking-[.08em] text-[#526b7a]">{project.code}</span><StudioProjectStatusBadge status={project.status}/><StudioBadge variant="info">{project.stage}</StudioBadge></div>
     <h1 className="mt-4 max-w-3xl text-[30px] font-bold leading-tight tracking-[-.045em] text-[#1e293b] sm:text-[34px]">{project.name}</h1>
     <p className="mt-2 text-[13px] text-[#64748b]">{project.client.name} · {project.location||"Konum belirtilmedi"} · {project.category}</p>
     <div className="mt-6 max-w-xl"><div className="flex items-center justify-between text-[12px]"><span className="font-medium text-[#64748b]">İlerleme</span><strong className="text-[#1e293b]">%{project.progress}</strong></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e8eef4]"><span className="block h-full rounded-full bg-[#4f8fac]" style={{width:`${project.progress}%`}}/></div></div>
    </div>
    <dl className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">{info.map(item=><div key={item.label} className="flex min-w-0 items-center gap-3 rounded-2xl border border-[#e5eaf0] bg-white p-4"><StudioIconSurface icon={item.icon} tone={item.tone} size="md"/><div className="min-w-0"><dt className="text-[11px] font-medium text-[#82909a]">{item.label}</dt><dd className="mt-0.5 truncate text-[13px] font-semibold text-[#1e293b]" title={item.value}>{item.value}</dd><dd className="mt-0.5 truncate text-[10px] text-[#94a3b8]">{item.detail}</dd></div></div>)}</dl>
   </div>
  </StudioCard>
 </header>;
}
