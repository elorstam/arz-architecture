import Link from "next/link";

import type {StudioProject} from "@/components/studio/projects/StudioProjectData";
import StudioProjectProgress from "@/components/studio/projects/StudioProjectProgress";
import StudioProjectStatusBadge from "@/components/studio/projects/StudioProjectStatusBadge";
import StudioFavoriteButton from "@/components/studio/quick-access/StudioFavoriteButton";
import StudioProjectCardMilestoneTimeline from "@/components/studio/projects/StudioProjectCardMilestoneTimeline";
import {StudioCard} from "@/components/studio/StudioDesignSystem";

export default function StudioProjectCard({project,isFavorite=false}: {project: StudioProject;isFavorite?:boolean}) {
  return (
    <StudioCard as="article" className="group relative overflow-hidden p-0 transition-transform duration-200 hover:-translate-y-0.5">
      <div className="absolute right-4 top-4 z-10"><StudioFavoriteButton entityType="project" entityId={project.id} initialFavorite={isFavorite} compact/></div><Link href={`/studio/projects/${project.id}`} className="block outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#9e8452]">
        <div className="relative h-36 overflow-hidden bg-[#1b2731] sm:h-40">
          {project.thumbnail?<div className="absolute inset-0 bg-cover bg-center opacity-55 grayscale transition-[opacity,transform] duration-300 group-hover:scale-[1.015] group-hover:opacity-65" style={{backgroundImage:`url("${project.thumbnail}")`}}/>:<div className="absolute inset-0 bg-[linear-gradient(135deg,#25343f_0%,#17242e_55%,#34414a_100%)]"/>}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_25%,rgba(15,24,32,.82)_100%)]" />
          <div className="absolute left-4 top-4 flex max-w-[calc(100%-64px)] items-center gap-2">
            <span className="rounded-md border border-white/15 bg-[#121d26]/80 px-2.5 py-1 text-[9px] font-semibold tracking-[.1em] text-[#dbc28d] backdrop-blur-sm">{project.code}</span>
            <StudioProjectStatusBadge status={project.status} />
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-[9px] uppercase tracking-[.12em] text-white/45">{project.category}</p>
            <h2 className="mt-1.5 truncate text-[16px] font-semibold tracking-[-.02em] text-white">{project.name}</h2>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-[9px]">
            <div className="min-w-0"><p className="text-[#aaa69e]">Müşteri</p><p className="mt-1 truncate font-medium text-[#50575b]">{project.client.name}</p></div>
            <div className="min-w-0"><p className="text-[#aaa69e]">Konum</p><p className="mt-1 truncate font-medium text-[#50575b]">{project.location}</p></div>
            <div><p className="text-[#aaa69e]">Aşama</p><p className="mt-1 font-medium text-[#50575b]">{project.stage}</p></div>
            <div><p className="text-[#aaa69e]">Yıl</p><p className="mt-1 font-medium text-[#50575b]">{project.year}</p></div>
          </div>
          <div className="mt-5"><StudioProjectProgress value={project.progress} /></div>
          <div className="mt-5"><StudioProjectCardMilestoneTimeline items={project.cardMilestones}/></div>
        </div>
      </Link>
    </StudioCard>
  );
}
