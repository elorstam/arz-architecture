import Link from "next/link";

import type {FocusItem} from "@/components/studio/dashboard/StudioDashboardData";
import {StudioCard,StudioIconSurface,StudioSectionHeader,type StudioIconTone} from "@/components/studio/ui";

const tones:StudioIconTone[]=["blue","gold","green","purple","amber","slate"];

export default function StudioDailyFocus({items}: {items: Array<FocusItem&{href:string}>}) {
  return (
    <section aria-label="Günlük Çalışma Planı" className="min-w-0">
      <StudioSectionHeader
        title="Günlük Çalışma Planı"
        description="Bugün öncelikli olarak tamamlanması gereken işler."
        icon="calendar"
      />
      <div className="mt-3 grid min-w-0 grid-cols-2 gap-3 lg:grid-cols-3 min-[1440px]:grid-cols-6">
        {items.map((item,index) => (
          <StudioCard as="article" key={item.label} className="p-0">
            <Link href={item.href} className="group flex min-h-[164px] flex-col rounded-[inherit] p-4 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#668ba0]" aria-label={`${item.label}: ${item.count}. ${item.context}`}>
              <StudioIconSurface icon={item.icon} tone={tones[index]??"slate"} size="md" />
              <p className="mt-3 text-3xl font-bold tracking-[-.055em] text-[#202a30]">{item.count}</p>
              <h3 className="mt-1.5 text-sm font-semibold tracking-[-.02em] text-[#34414a]">{item.label}</h3>
              <p className="mt-auto flex items-end justify-between gap-2 pt-1.5 text-xs leading-4 text-[#89939a]"><span className="line-clamp-1">{item.context}</span><span aria-hidden="true" className="text-base text-[#a2abb0] transition-transform duration-150 group-hover:translate-x-0.5">→</span></p>
            </Link>
          </StudioCard>
        ))}
      </div>
    </section>
  );
}
