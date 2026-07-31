import {StudioIcon} from "@/components/studio/StudioIcons";
import {projectStages, projectStatuses} from "@/components/studio/projects/StudioProjectData";
import type {ProjectArchiveFilter} from "@/lib/studio/projects/project-types";
import {studioButtonClass} from "@/components/studio/StudioButton";

export type ProjectFilters = {query?: string; status?: string; stage?: string;archive?:ProjectArchiveFilter};

export default function StudioProjectsFilters({filters}: {filters: ProjectFilters}) {
  return (
    <form method="get" action="/studio/projects" className="mt-6 grid gap-3 rounded-xl border border-[#dedad1] bg-white p-4 shadow-[0_4px_18px_rgba(32,39,46,.025)] md:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_160px_160px_140px_auto]">
      <label className="relative min-w-0">
        <span className="sr-only">Projelerde ara</span>
        <StudioIcon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#92948f]" />
        <input name="q" defaultValue={filters.query} type="search" placeholder="Proje, müşteri, kod veya konum ara..."
          className="h-10 w-full rounded-lg border border-[#dedad2] bg-[#fbfaf7] pl-10 pr-3 text-[11px] text-[#333a3f] outline-none placeholder:text-[#a3a39e] focus:border-[#a98f5e] focus:ring-2 focus:ring-[#a98f5e]/15" />
      </label>
      <label><span className="sr-only">Arşiv filtresi</span><select name="archive" defaultValue={filters.archive||"active"} className="h-10 w-full rounded-lg border border-[#dedad2] bg-[#fbfaf7] px-3 text-[10px] text-[#555b5e] outline-none focus:border-[#a98f5e]"><option value="active">Aktif Projeler</option><option value="archived">Arşiv</option><option value="all">Tümü</option></select></label>
      <label>
        <span className="sr-only">Durum filtresi</span>
        <select name="status" defaultValue={filters.status || ""} className="h-10 w-full rounded-lg border border-[#dedad2] bg-[#fbfaf7] px-3 text-[10px] text-[#555b5e] outline-none focus:border-[#a98f5e] focus:ring-2 focus:ring-[#a98f5e]/15">
          <option value="">Tüm durumlar</option>
          {projectStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
      </label>
      <label>
        <span className="sr-only">Aşama filtresi</span>
        <select name="stage" defaultValue={filters.stage || ""} className="h-10 w-full rounded-lg border border-[#dedad2] bg-[#fbfaf7] px-3 text-[10px] text-[#555b5e] outline-none focus:border-[#a98f5e] focus:ring-2 focus:ring-[#a98f5e]/15">
          <option value="">Tüm aşamalar</option>
          {projectStages.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
        </select>
      </label>
      <button type="submit" className={studioButtonClass("primary", "sm")}>Filtrele</button>
    </form>
  );
}
