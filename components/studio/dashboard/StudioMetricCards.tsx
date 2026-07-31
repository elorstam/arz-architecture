import {StudioIcon} from "@/components/studio/StudioIcons";
import type {Metric} from "@/components/studio/dashboard/StudioDashboardData";

export default function StudioMetricCards({items}: {items: Metric[]}) {
  return (
    <section aria-label="Studio özeti" className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <article key={item.label} className="group rounded-xl border border-[#dedad1] bg-white p-5 shadow-[0_4px_18px_rgba(32,39,46,.03)] transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-[#cfc7b7] hover:shadow-[0_10px_28px_rgba(32,39,46,.06)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium text-[#777b78]">{item.label}</p>
              <p className="mt-3 text-[26px] font-semibold tracking-[-.045em] text-[#222b32]">{item.value}</p>
            </div>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#e4ded2] bg-[#f4f1eb] text-[#8d7548] transition-colors group-hover:bg-[#eee8dd]">
              <StudioIcon name={item.icon} className="h-[17px] w-[17px]" />
            </span>
          </div>
          <p className="mt-3 text-[10px] text-[#696e6b]">{item.detail}</p>
          <p className="mt-3 border-t border-[#efede8] pt-3 text-[9px] uppercase tracking-[.08em] text-[#aaa69e]">{item.note}</p>
        </article>
      ))}
    </section>
  );
}
