import {StudioKpiCard} from "@/components/studio/StudioDesignSystem";
import type {Metric} from "@/components/studio/dashboard/StudioDashboardData";

export default function StudioMetricCards({items}: {items: Metric[]}) {
  return (
    <section aria-label="Studio özeti" className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => <StudioKpiCard key={item.label} label={item.label} value={item.value} detail={`${item.detail} · ${item.note}`} icon={item.icon} />)}
    </section>
  );
}
