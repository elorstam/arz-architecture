import Link from "next/link";
import StudioProjectCard from "@/components/studio/projects/StudioProjectCard";
import type {StudioProject} from "@/components/studio/projects/StudioProjectData";
import StudioProjectsHeader from "@/components/studio/projects/StudioProjectsHeader";
import StudioProjectsFilters, {type ProjectFilters} from "@/components/studio/projects/StudioProjectsFilters";
import {studioButtonClass} from "@/components/studio/StudioButton";
import {StudioEmptyState} from "@/components/studio/ui";

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
        <div className="mt-3 grid min-w-0 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => <StudioProjectCard key={project.id} project={project} isFavorite={favoriteKeys.has(`project:${project.id}`)} />)}
        </div>
      ) : (
        <div className="mt-3"><StudioEmptyState icon="building" title={totalCount===0?"Henüz bir proje oluşturulmadı.":"Eşleşen proje bulunamadı"} description={totalCount===0?"İlk projenizi oluşturarak proje süreçlerini ARZ Studio üzerinden takip etmeye başlayın.":"Arama ifadesini veya filtreleri değiştirerek yeniden deneyin."} action={totalCount===0&&canManage?<Link href="/studio/projects/new" className={studioButtonClass("primary","md")}>İlk Projeyi Oluştur</Link>:undefined}/></div>
      )}
    </section>
  );
}
