import {StudioIcon} from "@/components/studio/StudioIcons";
import type {FocusItem} from "@/components/studio/dashboard/StudioDashboardData";

const priorityStyles: Record<FocusItem["priority"], string> = {
  high: "border-[#b79b64]/35 bg-[#f8f4ec]",
  medium: "border-[#d9d5cc] bg-[#faf9f6]",
  normal: "border-[#dfe1df] bg-[#f7f8f7]",
};

export default function StudioDailyFocus({items}: {items: FocusItem[]}) {
  return (
    <section aria-labelledby="daily-focus-title" className="mt-7 overflow-hidden rounded-2xl border border-[#27333e] bg-[#17222c] text-white shadow-[0_14px_36px_rgba(25,34,43,.12)]">
      <div className="grid lg:grid-cols-[240px_minmax(0,1fr)]">
        <div className="border-b border-white/[.08] p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <p className="text-[9px] font-semibold uppercase tracking-[.2em] text-[#d1b477]">Günlük çalışma planı</p>
          <h2 id="daily-focus-title" className="mt-3 text-[20px] font-medium tracking-[-.025em]">Bugünün Odağı</h2>
          <p className="mt-2 text-[11px] leading-5 text-white/45">Önce dikkat gerektiren işleri tamamlayın.</p>
        </div>
        <div className="grid gap-px bg-white/[.07] sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {items.map((item) => (
            <article key={item.label} className="group bg-[#17222c] p-5 transition-colors hover:bg-[#1d2a35]">
              <div className="flex items-start justify-between gap-3">
                <span className="text-[25px] font-semibold tracking-[-.04em] text-white">{item.count}</span>
                <span className={`grid h-8 w-8 place-items-center rounded-lg border ${priorityStyles[item.priority]} text-[#8e7547]`}>
                  <StudioIcon name={item.icon} className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-3 text-[12px] font-medium leading-5 text-white/85">{item.label}</p>
              <p className="mt-1 text-[9px] leading-4 text-white/35">{item.context}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
