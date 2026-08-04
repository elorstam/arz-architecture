import Link from "next/link";

import type {FocusItem} from "@/components/studio/dashboard/StudioDashboardData";
import StudioDashboardIconSurface,{type DashboardIconName,type DashboardIconTone} from "@/components/studio/dashboard/StudioDashboardIconSurface";
import {StudioCard,StudioSectionHeader} from "@/components/studio/ui";

const tones:DashboardIconTone[]=["blue","orange","green","purple","yellow","slate"];
const iconNames:Partial<Record<FocusItem["icon"],DashboardIconName>>={calendar:"calendar",clock:"clock",check:"check",render:"render",receipt:"receipt"};

export default function StudioDailyFocus({items}: {items: Array<FocusItem&{href:string}>}) {
  return (
    <section aria-label="Günlük Çalışma Planı" className="min-w-0">
      <StudioSectionHeader
        title="Günlük Çalışma Planı"
        description="Bugün öncelikli olarak tamamlanması gereken işler."
      />
      <div className="mt-3 grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {items.map((item,index) => (
          <StudioCard as="article" key={item.label} className="!rounded-[18px] p-0">
            <Link href={item.href} className="group relative flex min-h-[132px] flex-col rounded-[inherit] p-4 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#668ba0]" aria-label={`${item.label}: ${item.count}. ${item.context}`}>
              <div className="flex items-center gap-3"><StudioDashboardIconSurface icon={iconNames[item.icon]??"activity"} tone={tones[index]??"slate"}/><p className="text-[26px] font-bold leading-none tracking-[-.05em] text-[#202a30]">{item.count}</p></div>
              <h3 className="mt-3.5 line-clamp-2 text-base font-semibold leading-[1.35] text-[#34414a]">{item.label}</h3>
              <p className="mt-2 pr-6 text-[13px] leading-[1.45] text-[#89939a]">{item.context}</p>
              <span aria-hidden="true" className="absolute bottom-4 right-4 text-base text-[#a2abb0] transition-transform duration-150 group-hover:translate-x-0.5">→</span>
            </Link>
          </StudioCard>
        ))}
      </div>
    </section>
  );
}
