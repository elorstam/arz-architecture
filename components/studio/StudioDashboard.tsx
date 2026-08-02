import StudioActivityFeed from "@/components/studio/dashboard/StudioActivityFeed";
import {
  activities,
  focusItems,
  metrics,
  projects,
  renderQueue,
  revisions,
  schedule,
} from "@/components/studio/dashboard/StudioDashboardData";
import StudioDailyFocus from "@/components/studio/dashboard/StudioDailyFocus";
import StudioMetricCards from "@/components/studio/dashboard/StudioMetricCards";
import StudioProjectOverview from "@/components/studio/dashboard/StudioProjectOverview";
import StudioQuickActions from "@/components/studio/dashboard/StudioQuickActions";
import StudioSchedule from "@/components/studio/dashboard/StudioSchedule";
import StudioWelcome from "@/components/studio/dashboard/StudioWelcome";
import StudioWorkflowQueue from "@/components/studio/dashboard/StudioWorkflowQueue";
import StudioCrmSummary from "@/components/studio/dashboard/StudioCrmSummary";
import type {StudioLeadSummary} from "@/lib/studio/crm/lead-types";
import StudioQuoteSummary from "@/components/studio/dashboard/StudioQuoteSummary";
import type {StudioQuoteSummary as QuoteSummary} from "@/lib/studio/quotes/quote-types";
import StudioQuickAccessWidget from "@/components/studio/dashboard/StudioQuickAccessWidget";
import type {StudioQuickAccessData} from "@/lib/studio/quick-access/quick-access-types";

export default function StudioDashboard({userName, organizationName, dateLabel, crmSummary, quoteSummary,quickAccess}: {
  userName: string;
  organizationName: string;
  dateLabel: string;
  crmSummary: StudioLeadSummary;
  quoteSummary: QuoteSummary;
  quickAccess: StudioQuickAccessData;
}) {
  return (
    <section className="mx-auto min-w-0 max-w-[1540px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
      <StudioWelcome userName={userName} organizationName={organizationName} dateLabel={dateLabel} />
      <StudioDailyFocus items={focusItems} />
      <StudioMetricCards items={metrics} />
      <StudioCrmSummary summary={crmSummary} />
      <StudioQuoteSummary summary={quoteSummary} />
      <StudioQuickAccessWidget data={quickAccess}/>

      <div className="mt-5">
        <StudioProjectOverview items={projects} />
      </div>

      <div className="mt-5">
        <StudioWorkflowQueue revisions={revisions} renders={renderQueue} />
      </div>

      <div className="mt-5 grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <StudioSchedule items={schedule} />
        <StudioActivityFeed items={activities} />
      </div>

      <StudioQuickActions />
    </section>
  );
}
