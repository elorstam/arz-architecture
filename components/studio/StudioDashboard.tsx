import StudioActivityFeed from "@/components/studio/dashboard/StudioActivityFeed";
import {activities,renderQueue,revisions,schedule} from "@/components/studio/dashboard/StudioDashboardData";
import StudioDailyFocus from "@/components/studio/dashboard/StudioDailyFocus";
import StudioProjectOverview from "@/components/studio/dashboard/StudioProjectOverview";
import StudioWelcome from "@/components/studio/dashboard/StudioWelcome";
import type {StudioLeadSummary} from "@/lib/studio/crm/lead-types";
import type {StudioQuoteSummary as QuoteSummary} from "@/lib/studio/quotes/quote-types";
import type {StudioQuickAccessData} from "@/lib/studio/quick-access/quick-access-types";
import StudioPermitSummary from "@/components/studio/dashboard/StudioPermitSummary";
import StudioCompactWidgets from "@/components/studio/dashboard/StudioCompactWidgets";
import type {FinanceDashboard} from "@/lib/studio/finance/finance-types";
import type {StudioProject} from "@/lib/studio/projects/project-types";
import type {OfficialProcess} from "@/lib/studio/official-processes/official-process-types";

export default function StudioDashboard({userName, organizationName, dateLabel, crmSummary, quoteSummary,quickAccess,finance,projects,officialProcessesByProject}: {
  userName: string;
  organizationName: string;
  dateLabel: string;
  crmSummary: StudioLeadSummary;
  quoteSummary: QuoteSummary;
  quickAccess: StudioQuickAccessData;
  finance: FinanceDashboard;
  projects: StudioProject[];
  officialProcessesByProject: Record<string,OfficialProcess[]>;
}) {
  const officialProcesses=Object.values(officialProcessesByProject).flat();
  const dailyPlan=[
    {count:schedule.length,label:"Bugünkü işler",context:"Planlanan ofis akışı",icon:"calendar" as const,priority:"normal" as const},
    {count:revisions.filter(item=>item.due.includes("gecikti")).length,label:"Geciken işler",context:"Öncelik gerektiriyor",icon:"clock" as const,priority:"high" as const},
    {count:renderQueue.filter(item=>item.state.includes("Onaya hazır")).length+quoteSummary.awaitingApproval,label:"Bekleyen onaylar",context:"Render ve teklif onayları",icon:"check" as const,priority:"medium" as const},
    {count:schedule.filter(item=>item.title.toLocaleLowerCase("tr-TR").includes("teslim")).length,label:"Yaklaşan teslimler",context:"Takvimdeki teslimler",icon:"calendar" as const,priority:"medium" as const},
    {count:renderQueue.filter(item=>item.state!=="Teslim edildi").length,label:"Render bekleyenler",context:"Aktif render kuyruğu",icon:"render" as const,priority:"normal" as const},
    {count:crmSummary.awaitingQuote,label:"Teklif hazırlanacaklar",context:"CRM teklif akışı",icon:"receipt" as const,priority:"normal" as const},
  ];
  return (
    <section className="studio-dashboard-v3 mx-auto min-w-0 max-w-[1540px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
      <StudioWelcome userName={userName} organizationName={organizationName} dateLabel={dateLabel} />
      <StudioDailyFocus items={dailyPlan} />
      <StudioProjectOverview projects={projects} officialProcessesByProject={officialProcessesByProject} />
      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,.85fr)]"><StudioPermitSummary items={officialProcesses}/><StudioActivityFeed items={activities.slice(0,4)}/></div>
      <StudioCompactWidgets finance={finance} quotes={quoteSummary} crm={crmSummary} renderCount={renderQueue.filter(item=>item.state!=="Teslim edildi").length} quickAccess={quickAccess}/>
    </section>
  );
}
