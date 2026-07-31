import type {ProjectOverviewItem} from "@/components/studio/dashboard/StudioDashboardData";

const statusStyles: Record<string, string> = {
  Aktif: "border-[#ccd8d0] bg-[#f0f5f1] text-[#587060]",
  Render: "border-[#d6d8dd] bg-[#f2f3f5] text-[#626b77]",
  Gecikmiş: "border-[#e3d1c9] bg-[#f8f1ee] text-[#916554]",
  Planlandı: "border-[#dfd8c9] bg-[#f7f4ed] text-[#7e6b48]",
};

export default function StudioProjectOverview({items}: {items: ProjectOverviewItem[]}) {
  return (
    <section aria-labelledby="project-overview-title" className="overflow-hidden rounded-xl border border-[#dedad1] bg-white shadow-[0_4px_18px_rgba(32,39,46,.03)]">
      <div className="flex items-center justify-between gap-4 border-b border-[#ece9e3] px-5 py-5 sm:px-6">
        <div>
          <h2 id="project-overview-title" className="text-[15px] font-semibold tracking-[-.015em] text-[#273038]">Proje Görünümü</h2>
          <p className="mt-1 text-[10px] text-[#969792]">Aktif çalışma akışı ve son güncellemeler</p>
        </div>
        <span className="rounded-full border border-[#dfdbd2] px-2.5 py-1 text-[9px] font-medium text-[#7b7d78]">4 proje</span>
      </div>

      <div className="hidden grid-cols-[minmax(220px,1.6fr)_110px_120px_120px_90px] gap-4 border-b border-[#eeece7] bg-[#faf9f6] px-6 py-2.5 text-[8px] font-semibold uppercase tracking-[.12em] text-[#a19e97] lg:grid">
        <span>Proje / Müşteri</span><span>Aşama</span><span>İlerleme</span><span>Son Güncelleme</span><span>Sorumlu</span>
      </div>
      <div className="divide-y divide-[#efede8]">
        {items.map((project) => (
          <article key={project.name} className="grid min-w-0 gap-4 px-5 py-4 transition-colors hover:bg-[#fbfaf7] sm:px-6 lg:grid-cols-[minmax(220px,1.6fr)_110px_120px_120px_90px] lg:items-center">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#18232d] text-[9px] font-semibold tracking-[.08em] text-[#d5b878]">{project.code}</span>
              <div className="min-w-0">
                <p className="truncate text-[12px] font-semibold text-[#30383e]">{project.name}</p>
                <p className="mt-1 truncate text-[9px] text-[#969792]">{project.client}</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 lg:block">
              <span className="text-[9px] text-[#9b9a94] lg:hidden">Aşama</span>
              <div><p className="text-[10px] text-[#5f6568]">{project.stage}</p><span className={`mt-1.5 inline-flex rounded-full border px-2 py-0.5 text-[8px] font-medium ${statusStyles[project.status]}`}>{project.status}</span></div>
            </div>
            <div>
              <div className="flex justify-between text-[8px] text-[#999a95]"><span>İlerleme</span><span>%{project.progress}</span></div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#edeae4]"><div className="h-full rounded-full bg-[#ad9360]" style={{width: `${project.progress}%`}} /></div>
            </div>
            <div className="flex items-center justify-between lg:block"><span className="text-[9px] text-[#9b9a94] lg:hidden">Güncelleme</span><p className="text-[9px] text-[#747976]">{project.updatedAt}</p></div>
            <div className="flex items-center justify-between lg:justify-start">
              <span className="text-[9px] text-[#9b9a94] lg:hidden">Sorumlu</span>
              <span className="grid h-7 w-7 place-items-center rounded-full border border-[#ddd6c8] bg-[#f4f0e8] text-[8px] font-semibold text-[#7f6940]" title="Sorumlu kişi">{project.owner}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
