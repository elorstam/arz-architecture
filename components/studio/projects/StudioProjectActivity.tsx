import type {ProjectActivity} from "@/components/studio/projects/StudioProjectData";

export default function StudioProjectActivity({items}: {items: ProjectActivity[]}) {
  return (
    <section aria-labelledby="project-activity-title" className="rounded-xl border border-[#dedad1] bg-white shadow-[0_4px_18px_rgba(32,39,46,.03)]">
      <div className="border-b border-[#ece9e3] px-5 py-5"><h2 id="project-activity-title" className="text-[14px] font-semibold text-[#2d353b]">Proje Aktivitesi</h2><p className="mt-1 text-[9px] text-[#989994]">Son değişiklikler ve kararlar</p></div>
      <div className="divide-y divide-[#efede8] px-5">
        {!items.length?<p className="py-10 text-center text-[9px] text-[#9b9c97]">Henüz proje aktivitesi bulunmuyor.</p>:null}
        {items.map((item) => (
          <article key={`${item.title}-${item.relativeTime}`} className="flex gap-3 py-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#1b2731] text-[7px] font-semibold text-[#d6ba7e]">{item.actorInitials}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3"><h3 className="text-[10px] font-semibold leading-4 text-[#3e464b]">{item.title}</h3><span className="shrink-0 text-[8px] text-[#aaa69e]">{item.relativeTime}</span></div>
              <p className="mt-1 text-[8px] leading-4 text-[#858985]">{item.detail}</p>
              <span className="mt-2 inline-block rounded-full bg-[#f2f0eb] px-2 py-0.5 text-[7px] uppercase tracking-[.08em] text-[#85837d]">{item.type}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
