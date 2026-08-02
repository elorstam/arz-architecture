import type {ActivityItem} from "@/components/studio/dashboard/StudioDashboardData";
import {StudioIconSurface} from "@/components/studio/ui";

export default function StudioActivityFeed({items}: {items: ActivityItem[]}) {
  return (
    <section aria-labelledby="activity-title" className="rounded-xl border border-[#dedad1] bg-white shadow-[0_4px_18px_rgba(32,39,46,.03)]">
      <div className="border-b border-[#ece9e3] px-5 py-5">
        <h2 id="activity-title" className="text-[14px] font-semibold text-[#2d353b]">Son Aktiviteler</h2>
        <p className="mt-1 text-[9px] text-[#989994]">Studio çalışma akışındaki değişiklikler</p>
      </div>
      <div className="px-5 py-1">
        {items.map((item, index) => (
          <article key={`${item.project}-${item.event}`} className="relative flex gap-3 py-4">
            {index < items.length - 1 ? <span className="absolute left-[14px] top-10 h-[calc(100%-1rem)] w-px bg-[#e5e1d9]" /> : null}
            <StudioIconSurface icon="activity" tone="blue" size="sm" className="studio-dashboard-activity-icon relative z-10" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3"><p className="text-[10px] font-semibold text-[#3b4348]">{item.project}</p><span className="shrink-0 text-[8px] text-[#aaa69e]">{item.time}</span></div>
              <p className="mt-1 text-sm leading-5 text-[#59656d]">{item.event}</p>
              <p className="mt-1 text-xs text-[#8a9290]">{item.actor} tarafından</p>
              <span className="mt-2 inline-block rounded-full bg-[#f2f0eb] px-2 py-0.5 text-[7px] uppercase tracking-[.08em] text-[#85837d]">{item.type}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
