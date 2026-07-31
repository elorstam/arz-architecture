import type {ProjectMilestone} from "@/components/studio/projects/StudioProjectData";

const stateStyles: Record<ProjectMilestone["state"], string> = {
  completed: "border-[#718076] bg-[#718076]",
  current: "border-[#ad9360] bg-[#ad9360] shadow-[0_0_0_4px_rgba(173,147,96,.14)]",
  upcoming: "border-[#cfcac0] bg-white",
};

export default function StudioProjectMilestones({items}: {items: ProjectMilestone[]}) {
  return (
    <section aria-labelledby="milestones-title" className="rounded-xl border border-[#dedad1] bg-white shadow-[0_4px_18px_rgba(32,39,46,.03)]">
      <div className="border-b border-[#ece9e3] px-5 py-5"><h2 id="milestones-title" className="text-[14px] font-semibold text-[#2d353b]">Önemli Tarihler</h2><p className="mt-1 text-[9px] text-[#989994]">Proje kilometre taşları</p></div>
      <div className="px-5 py-2">
        {!items.length?<p className="py-10 text-center text-[9px] text-[#9b9c97]">Henüz kilometre taşı eklenmedi.</p>:null}
        {items.map((item, index) => (
          <article key={item.title} className="relative flex gap-4 py-4">
            {index < items.length - 1 ? <span className="absolute left-[5px] top-8 h-[calc(100%-1rem)] w-px bg-[#dedad1]" /> : null}
            <span className={`relative z-10 mt-1 h-3 w-3 shrink-0 rounded-full border-2 ${stateStyles[item.state]}`} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-[10px] font-semibold text-[#3e464b]">{item.title}</h3><time className="text-[8px] text-[#9a9b96]">{item.date}</time></div>
              <p className="mt-1 text-[8px] leading-4 text-[#858985]">{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
