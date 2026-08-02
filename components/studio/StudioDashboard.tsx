import StudioActivityFeed from "@/components/studio/dashboard/StudioActivityFeed";
import {activities,focusItems,metrics,renderQueue,revisions,schedule} from "@/components/studio/dashboard/StudioDashboardData";
import StudioDailyFocus from "@/components/studio/dashboard/StudioDailyFocus";
import StudioMetricCards from "@/components/studio/dashboard/StudioMetricCards";
import StudioProjectOverview from "@/components/studio/dashboard/StudioProjectOverview";
import StudioSchedule from "@/components/studio/dashboard/StudioSchedule";
import StudioWelcome from "@/components/studio/dashboard/StudioWelcome";
import StudioWorkflowQueue from "@/components/studio/dashboard/StudioWorkflowQueue";
import StudioCrmSummary from "@/components/studio/dashboard/StudioCrmSummary";
import type {StudioLeadSummary} from "@/lib/studio/crm/lead-types";
import StudioQuoteSummary from "@/components/studio/dashboard/StudioQuoteSummary";
import type {StudioQuoteSummary as QuoteSummary} from "@/lib/studio/quotes/quote-types";
import StudioQuickAccessWidget from "@/components/studio/dashboard/StudioQuickAccessWidget";
import type {StudioQuickAccessData} from "@/lib/studio/quick-access/quick-access-types";
import StudioFinanceSummary from "@/components/studio/dashboard/StudioFinanceSummary";
import StudioPermitSummary from "@/components/studio/dashboard/StudioPermitSummary";
import type {FinanceDashboard} from "@/lib/studio/finance/finance-types";
import type {StudioProject} from "@/lib/studio/projects/project-types";
import type {OfficialProcess} from "@/lib/studio/official-processes/official-process-types";

export default function StudioDashboard({userName, organizationName, dateLabel, crmSummary, quoteSummary,quickAccess,finance,projects,officialProcesses}: {
  userName: string;
  organizationName: string;
  dateLabel: string;
  crmSummary: StudioLeadSummary;
  quoteSummary: QuoteSummary;
  quickAccess: StudioQuickAccessData;
  finance: FinanceDashboard;
  projects: StudioProject[];
  officialProcesses: OfficialProcess[];
}) {
  return (
    <section className="studio-dashboard-v3 mx-auto min-w-0 max-w-[1540px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
      <StudioWelcome userName={userName} organizationName={organizationName} dateLabel={dateLabel} projectName={projects[0]?.name ?? ""} />
      <StudioProjectOverview projects={projects} officialProcesses={officialProcesses} />
      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,.85fr)]"><StudioPermitSummary items={officialProcesses}/><StudioActivityFeed items={activities}/></div>
      <StudioFinanceSummary data={finance}/>
      <div className="grid min-w-0 gap-5 xl:grid-cols-2"><StudioCrmSummary summary={crmSummary} /><StudioQuoteSummary summary={quoteSummary} /></div>
      <StudioQuickAccessWidget data={quickAccess}/>
      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"><StudioWorkflowQueue revisions={revisions} renders={renderQueue}/><StudioSchedule items={schedule}/></div>
      <StudioDailyFocus items={focusItems} />
      <StudioMetricCards items={metrics} />
    </section>
  );
}
