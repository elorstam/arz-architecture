import Link from "next/link";
import StudioProjectCard from "@/components/studio/projects/StudioProjectCard";
import type {StudioProject} from "@/components/studio/projects/StudioProjectData";
import StudioProjectsHeader from "@/components/studio/projects/StudioProjectsHeader";
import StudioProjectsFilters, {type ProjectFilters} from "@/components/studio/projects/StudioProjectsFilters";
import {studioButtonClass} from "@/components/studio/StudioButton";

export default function StudioProjectsPage({projects, totalCount, filters,canManage,favoriteKeys}: {
  projects: StudioProject[];
  totalCount: number;
  canManage:boolean;
  filters: ProjectFilters;
  favoriteKeys:Set<string>;
}) {
  return (
    <section className="mx-auto min-w-0 max-w-[1540px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
      <StudioProjectsHeader count={totalCount} canManage={canManage} />
      <StudioProjectsFilters filters={filters} />
      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="text-[9px] uppercase tracking-[.1em] text-[#9a9993]">{projects.length} proje gösteriliyor</p>
        <p className="text-[8px] text-[#aaa69e]">Son güncellenenler önce</p>
      </div>
      {projects.length ? (
        <div className="mt-3 grid min-w-0 gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {projects.map((project) => <StudioProjectCard key={project.id} project={project} isFavorite={favoriteKeys.has(`project:${project.id}`)} />)}
        </div>
      ) : (
        <div className="mt-3 rounded-xl border border-dashed border-[#d7d1c6] bg-white/55 px-6 py-16 text-center">
          <h2 className="text-[16px] font-semibold text-[#3f474c]">{totalCount===0?"Henüz bir proje oluşturulmadı.":"Eşleşen proje bulunamadı"}</h2>
          <p className="mx-auto mt-2 max-w-md text-[10px] leading-5 text-[#92938e]">{totalCount===0?"İlk projenizi oluşturarak proje süreçlerini ARZ Studio üzerinden takip etmeye başlayın.":"Arama ifadesini veya filtreleri değiştirerek yeniden deneyin."}</p>
          {totalCount===0&&canManage?<Link href="/studio/projects/new" className={studioButtonClass("primary", "md", "mt-5")}>İlk Projeyi Oluştur</Link>:null}
        </div>
      )}
    </section>
  );
}
