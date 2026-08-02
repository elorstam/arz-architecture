import type {FocusItem} from "@/components/studio/dashboard/StudioDashboardData";
import {StudioCard,StudioIconSurface,StudioSectionHeader,type StudioIconTone} from "@/components/studio/ui";

const tones:StudioIconTone[]=["blue","gold","green","purple","amber","slate"];

export default function StudioDailyFocus({items}: {items: FocusItem[]}) {
  return (
    <section aria-label="Günlük Çalışma Planı" className="mt-7 min-w-0">
      <StudioSectionHeader
        title="Günlük Çalışma Planı"
        description="Bugün öncelikli olarak tamamlanması gereken işler."
        icon="calendar"
      />
      <div className="mt-5 grid min-w-0 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {items.map((item,index) => (
          <StudioCard as="article" key={item.label} className="flex min-h-56 flex-col p-6">
            <StudioIconSurface icon={item.icon} tone={tones[index]??"slate"} size="lg" />
            <p className="mt-6 text-4xl font-bold tracking-[-.055em] text-[#202a30]">{item.count}</p>
            <h3 className="mt-3 text-base font-semibold tracking-[-.02em] text-[#34414a]">{item.label}</h3>
            <p className="mt-auto pt-3 text-sm leading-5 text-[#89939a]">{item.context}</p>
          </StudioCard>
        ))}
      </div>
    </section>
  );
}
