import type {StudioProject} from "@/components/studio/projects/StudioProjectData";
import StudioProjectActivity from "@/components/studio/projects/StudioProjectActivity";
import StudioProjectClientCard from "@/components/studio/projects/StudioProjectClientCard";
import StudioProjectMilestones from "@/components/studio/projects/StudioProjectMilestones";
import StudioProjectTeam from "@/components/studio/projects/StudioProjectTeam";

export default function StudioProjectOverview({project}: {project: StudioProject}) {
  return (
    <div className="mt-5 grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(280px,.55fr)]">
      <div className="min-w-0 space-y-5">
        <section aria-labelledby="project-summary-title" className="rounded-xl border border-[#dedad1] bg-white p-5 shadow-[0_4px_18px_rgba(32,39,46,.03)] sm:p-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[.14em] text-[#a08859]">Proje Özeti</p>
              <h2 id="project-summary-title" className="mt-2 text-[15px] font-semibold text-[#2d353b]">Mimari kapsam</h2>
              <p className="mt-3 text-[10px] leading-5 text-[#6f7472]">{project.summary}</p>
            </div>
            <div className="border-t border-[#e9e5dd] pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              <p className="text-[8px] font-semibold uppercase tracking-[.14em] text-[#a08859]">Mevcut Faz</p>
              <h2 className="mt-2 text-[15px] font-semibold text-[#2d353b]">{project.stage}</h2>
              <p className="mt-3 text-[10px] leading-5 text-[#6f7472]">{project.currentPhase}</p>
            </div>
          </div>
          <dl className="mt-6 grid gap-3 border-t border-[#ece9e3] pt-5 sm:grid-cols-3">
            <div><dt className="text-[8px] text-[#aaa69e]">Başlangıç</dt><dd className="mt-1 text-[10px] font-medium text-[#51585c]">{project.startDate}</dd></div>
            <div><dt className="text-[8px] text-[#aaa69e]">Hedef teslim</dt><dd className="mt-1 text-[10px] font-medium text-[#51585c]">{project.targetDate}</dd></div>
            <div><dt className="text-[8px] text-[#aaa69e]">Proje yılı</dt><dd className="mt-1 text-[10px] font-medium text-[#51585c]">{project.year}</dd></div>
          </dl>
        </section>

        <section aria-label="Gelecek proje iş akışları" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {["Revizyonlar","Renderlar","Görevler","Teslimler"].map(label=><article key={label} className="rounded-xl border border-dashed border-[#d8d3ca] bg-white/55 p-4"><p className="text-[9px] font-semibold text-[#676c69]">{label}</p><p className="mt-2 text-[8px] leading-4 text-[#a09f99]">Bu iş akışı sonraki fazda açılacak.</p></article>)}
        </section>

        <div className="grid min-w-0 gap-5 lg:grid-cols-2">
          <StudioProjectMilestones items={project.milestones} />
          <StudioProjectActivity items={project.activities} />
        </div>
      </div>

      <aside className="min-w-0 space-y-5">
        <section aria-labelledby="next-milestone-title" className="rounded-xl border border-[#27333e] bg-[#17222c] p-5 text-white shadow-[0_10px_28px_rgba(25,34,43,.1)]">
          <p className="text-[8px] font-semibold uppercase tracking-[.16em] text-[#d1b477]">Sıradaki Adım</p>
          <h2 id="next-milestone-title" className="mt-3 text-[15px] font-semibold">{project.nextMilestone}</h2>
          <p className="mt-2 text-[9px] text-white/45">{project.nextMilestoneDate}</p>
          <p className="mt-4 border-t border-white/10 pt-4 text-[9px] leading-4 text-white/55">Ekip sorumlusu: {project.responsible?.name??"Henüz atanmadı"}</p>
        </section>
        <StudioProjectTeam members={project.team} />
        <StudioProjectClientCard client={project.client} />
        <section aria-labelledby="notes-title" className="rounded-xl border border-[#dedad1] bg-[#faf8f3] p-5">
          <div className="flex items-center justify-between gap-3"><h2 id="notes-title" className="text-[13px] font-semibold text-[#2d353b]">Proje Notları</h2><span className="text-[7px] uppercase tracking-[.1em] text-[#ad966a]">Salt okunur</span></div>
          <ul className="mt-4 space-y-3">
            {project.notes.map((note) => <li key={note} className="border-l-2 border-[#c6aa73] pl-3 text-[9px] leading-4 text-[#6f7472]">{note}</li>)}
          </ul>
        </section>
      </aside>
    </div>
  );
}
