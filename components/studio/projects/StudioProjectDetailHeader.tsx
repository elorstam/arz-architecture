import Link from "next/link";

import {StudioIcon} from "@/components/studio/StudioIcons";
import type {StudioProject} from "@/components/studio/projects/StudioProjectData";
import StudioProjectProgress from "@/components/studio/projects/StudioProjectProgress";
import StudioProjectStatusBadge from "@/components/studio/projects/StudioProjectStatusBadge";

export default function StudioProjectDetailHeader({project}: {project: StudioProject}) {
  return (
    <header>
      <div className="flex items-center justify-between gap-4"><Link href="/studio/projects" className="inline-flex items-center gap-2 rounded-md text-[10px] font-medium text-[#777b78] outline-none transition-colors hover:text-[#3f474b] focus-visible:ring-2 focus-visible:ring-[#9e8452]/30"><StudioIcon name="arrow" className="h-3.5 w-3.5 rotate-180"/>Projelere Dön</Link>{project.canManage?<Link href={`/studio/projects/${project.id}/edit`} className="rounded-lg border border-[#d4cec2] bg-white px-4 py-2 text-[10px] font-medium text-[#4f5659] outline-none hover:border-[#b9ab90] focus-visible:ring-2 focus-visible:ring-[#9e8452]/30">Projeyi Düzenle</Link>:null}</div>
      <div className="mt-5 overflow-hidden rounded-2xl border border-[#27333e] bg-[#17222c] text-white shadow-[0_14px_36px_rgba(25,34,43,.12)]">
        <div className="relative min-h-[260px]">
          {project.thumbnail?<div className="absolute inset-0 bg-cover bg-center opacity-25 grayscale" style={{backgroundImage:`url("${project.thumbnail}")`}}/>:<div className="absolute inset-0 bg-[linear-gradient(135deg,#1b2934_0%,#293742_45%,#18242e_100%)]"/>}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(23,34,44,.98)_0%,rgba(23,34,44,.9)_54%,rgba(23,34,44,.45)_100%)]" />
          <div className="relative grid min-h-[260px] gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,.65fr)] lg:items-end">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md border border-white/15 bg-white/[.06] px-2.5 py-1 text-[9px] font-semibold tracking-[.12em] text-[#d8bd84]">{project.code}</span>
                <StudioProjectStatusBadge status={project.status} />
                <span className="rounded-full border border-white/12 px-2.5 py-1 text-[8px] uppercase tracking-[.08em] text-white/55">{project.stage}</span>
              </div>
              <h1 className="mt-5 max-w-3xl text-[27px] font-semibold leading-tight tracking-[-.045em] sm:text-[34px]">{project.name}</h1>
              <p className="mt-3 text-[11px] text-white/50">{project.client.name} · {project.location} · {project.category}</p>
              <div className="mt-7 max-w-lg">
                <StudioProjectProgress value={project.progress} />
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-x-5 gap-y-5 border-t border-white/10 pt-5 text-[9px] lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
              <div><dt className="text-white/30">Sorumlu</dt><dd className="mt-1.5 font-medium text-white/80">{project.responsible?.name??"Atanmadı"}</dd></div>
              <div><dt className="text-white/30">Son güncelleme</dt><dd className="mt-1.5 font-medium text-white/80">{project.lastUpdate}</dd></div>
              <div className="col-span-2"><dt className="text-white/30">Sonraki kilometre taşı</dt><dd className="mt-1.5 font-medium text-[#dbc28d]">{project.nextMilestone}</dd><dd className="mt-1 text-white/35">{project.nextMilestoneDate}</dd></div>
            </dl>
          </div>
        </div>
      </div>
    </header>
  );
}
