import type {ScheduleItem} from "@/components/studio/dashboard/StudioDashboardData";

export default function StudioSchedule({items}: {items: ScheduleItem[]}) {
  return (
    <section aria-labelledby="schedule-title" className="rounded-xl border border-[#dedad1] bg-white shadow-[0_4px_18px_rgba(32,39,46,.03)]">
      <div className="border-b border-[#ece9e3] px-5 py-5">
        <h2 id="schedule-title" className="text-[14px] font-semibold text-[#2d353b]">Yaklaşan Program</h2>
        <p className="mt-1 text-[9px] text-[#989994]">Önümüzdeki dört çalışma</p>
      </div>
      <div className="divide-y divide-[#efede8] px-5">
        {items.map((item) => (
          <article key={`${item.day}-${item.title}`} className="flex gap-3 py-4">
            <div className="w-10 shrink-0 border-r border-[#e5e1d8] pr-3 text-center">
              <p className="text-[15px] font-semibold text-[#30383e]">{item.day}</p>
              <p className="mt-0.5 text-[8px] uppercase tracking-[.1em] text-[#a18b5f]">{item.month}</p>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2"><p className="text-[10px] font-semibold leading-4 text-[#3d4449]">{item.title}</p><span className="shrink-0 text-[8px] text-[#8f918d]">{item.time}</span></div>
              <p className="mt-1 text-[8px] text-[#9b9c97]">{item.context}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
