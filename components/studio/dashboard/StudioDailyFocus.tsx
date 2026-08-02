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
            <Link href={item.href} className="group grid h-[112px] grid-cols-[44px_minmax(0,1fr)_auto] grid-rows-[44px_auto] gap-x-3 rounded-[inherit] p-4 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#668ba0]" aria-label={`${item.label}: ${item.count}. ${item.context}`}>
              <StudioDashboardIconSurface icon={iconNames[item.icon]??"activity"} tone={tones[index]??"slate"}/>
              <div className="min-w-0 self-center"><p className="text-[26px] font-bold leading-none tracking-[-.05em] text-[#202a30]">{item.count}</p><h3 className="mt-1 truncate text-[13px] font-semibold text-[#34414a]">{item.label}</h3></div>
              <span aria-hidden="true" className="self-center text-base text-[#a2abb0] transition-transform duration-150 group-hover:translate-x-0.5">→</span>
              <p className="col-span-3 mt-2 truncate text-[11px] leading-4 text-[#89939a]">{item.context}</p>
            </Link>
          </StudioCard>
        ))}
      </div>
    </section>
  );
}
