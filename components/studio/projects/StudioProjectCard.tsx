import Link from "next/link";

import type {StudioProject} from "@/components/studio/projects/StudioProjectData";
import StudioProjectProgress from "@/components/studio/projects/StudioProjectProgress";
import StudioProjectStatusBadge from "@/components/studio/projects/StudioProjectStatusBadge";
import StudioFavoriteButton from "@/components/studio/quick-access/StudioFavoriteButton";
import StudioProjectCardMilestoneTimeline from "@/components/studio/projects/StudioProjectCardMilestoneTimeline";
import {StudioCard} from "@/components/studio/StudioDesignSystem";
import {StudioBadge,StudioIconSurface,type StudioIconTone} from "@/components/studio/ui";
import type {StudioIconName} from "@/components/studio/StudioIcons";

function projectTypeVisual(category:string):{icon:StudioIconName;tone:StudioIconTone}{
 const value=category.toLocaleLowerCase("tr-TR");
 if(value.includes("villa"))return{icon:"house",tone:"green"};
 if(value.includes("dükkan")||value.includes("mağaza"))return{icon:"store",tone:"orange"};
 if(value.includes("depo")||value.includes("antrepo"))return{icon:"warehouse",tone:"slate"};
 if(value.includes("fabrika")||value.includes("sanayi"))return{icon:"factory",tone:"red"};
 if(value.includes("kafe")||value.includes("cafe"))return{icon:"coffee",tone:"orange"};
 if(value.includes("restoran"))return{icon:"utensils",tone:"red"};
 if(value.includes("otel"))return{icon:"hotel",tone:"purple"};
 if(value.includes("iç mimari"))return{icon:"armchair",tone:"purple"};
 if(value.includes("görselleştirme")||value.includes("render"))return{icon:"image",tone:"blue"};
 if(value.includes("ofis"))return{icon:"briefcase",tone:"blue"};
 if(value.includes("ticari"))return{icon:"building",tone:"blue"};
 return{icon:"building",tone:"blue"};
}

export default function StudioProjectCard({project,isFavorite=false}: {project:StudioProject;isFavorite?:boolean}){
 const visual=projectTypeVisual(project.category);
 return <StudioCard as="article" className="group relative h-full min-h-[350px] overflow-hidden p-0 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-[#d5dee7] hover:shadow-[0_14px_32px_rgba(40,57,73,.08)]">
  <div className="absolute right-4 top-4 z-10 [&_button]:h-10 [&_button]:w-10 [&_button]:border-[#e1e7ed] [&_button]:text-[#64748b]"><StudioFavoriteButton entityType="project" entityId={project.id} initialFavorite={isFavorite} compact/></div>
  <Link href={`/studio/projects/${project.id}`} className="flex h-full min-w-0 flex-col p-4 pr-16 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#64748b]">
   <header className="flex min-w-0 items-center gap-3">
    <StudioIconSurface icon={visual.icon} tone={visual.tone} size="lg" className="shrink-0"/>
    <div className="min-w-0 flex-1"><p className="truncate text-[12px] font-semibold uppercase tracking-[.08em] text-[#64748b]">{project.code}</p><p className="mt-0.5 truncate text-[12px] text-[#8a94a0]" title={project.category}>{project.category||"Proje"}</p></div>
    <StudioProjectStatusBadge status={project.status}/>
   </header>

   <div className="mt-4 min-w-0">
    <h2 className="truncate text-[17px] font-bold tracking-[-.025em] text-[#1e293b]" title={project.name}>{project.name}</h2>
    <p className="mt-1 truncate text-[12px] text-[#64748b]" title={`${project.client.name} · ${project.location} · ${project.year}`}>{project.client.name} · {project.location||"Konum belirtilmedi"} · {project.year||"—"}</p>
    {project.responsible?<p className="mt-1 truncate text-[11px] text-[#8a94a0]">{project.responsible.name} sorumlu</p>:null}
   </div>

   <div className="mt-4 flex min-w-0 items-center justify-between gap-3"><span className="text-[11px] font-medium text-[#7c8792]">Güncel Aşama</span><StudioBadge variant="info">{project.stage}</StudioBadge></div>
   <div className="mt-3"><StudioProjectProgress value={project.progress}/></div>
   <div className="mt-4"><StudioProjectCardMilestoneTimeline items={project.cardMilestones}/></div>

   <footer className="mt-auto flex min-w-0 items-center justify-between gap-3 border-t border-[#e7ecf3] pt-3 text-[11px]">
    <span className="truncate text-[#8a94a0]">Son güncelleme: {project.lastUpdate}</span>
    <span className="shrink-0 font-semibold text-[#426b82] transition-colors group-hover:text-[#274f66]">Projeye Git →</span>
   </footer>
  </Link>
 </StudioCard>;
}
