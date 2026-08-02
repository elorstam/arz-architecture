import StudioActivityFeed from "@/components/studio/dashboard/StudioActivityFeed";
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
  const delayedProjects=projects.filter(project=>project.status==="Gecikmiş");
  const renderProjects=projects.filter(project=>project.stage==="Görselleştirme");
  const todayProjects=projects.filter(project=>project.activities.some(activity=>activity.relativeTime.toLocaleLowerCase("tr-TR").includes("bugün")));
  const upcomingDeliveries=projects.filter(project=>project.nextMilestone.toLocaleLowerCase("tr-TR").includes("teslim"));
  const activityItems=projects.flatMap(project=>project.activities.map(activity=>({projectId:project.id,project:project.name,event:activity.title,type:activity.type,actor:activity.actorInitials,time:activity.relativeTime}))).slice(0,5);
  const dailyPlan=[
    {count:todayProjects.length,label:"Bugünkü işler",context:"Bugün işlem gören projeler",icon:"calendar" as const,priority:"normal" as const,href:"/studio/projects?archive=active"},
    {count:delayedProjects.length,label:"Geciken işler",context:"Öncelikli projeler",icon:"clock" as const,priority:"high" as const,href:"/studio/projects?status=Gecikmiş"},
    {count:quoteSummary.awaitingApproval,label:"Bekleyen onaylar",context:"Onay bekleyen teklifler",icon:"check" as const,priority:"medium" as const,href:"/studio/quotes"},
    {count:upcomingDeliveries.length,label:"Yaklaşan teslimler",context:"Sıradaki adımı teslim olanlar",icon:"calendar" as const,priority:"medium" as const,href:"#active-projects"},
    {count:renderProjects.length,label:"Render bekleyenler",context:"Görselleştirme projeleri",icon:"render" as const,priority:"normal" as const,href:"/studio/projects?stage=Görselleştirme"},
    {count:crmSummary.awaitingQuote,label:"Teklif hazırlanacaklar",context:"CRM teklif akışı",icon:"receipt" as const,priority:"normal" as const,href:"/studio/crm"},
  ];
  return (
    <section className="studio-dashboard-v3 mx-auto min-w-0 max-w-[1540px] px-4 py-4 sm:px-6 sm:py-5 lg:px-6">
      <StudioWelcome userName={userName} organizationName={organizationName} dateLabel={dateLabel} />
      <StudioDailyFocus items={dailyPlan} />
      <div className="grid min-w-0 auto-rows-[440px] items-stretch gap-3 md:auto-rows-[480px] md:grid-cols-2 min-[1440px]:h-[480px] min-[1440px]:grid-cols-[minmax(0,1.25fr)_minmax(0,.9fr)_minmax(0,1fr)]"><StudioProjectOverview projects={projects} officialProcessesByProject={officialProcessesByProject}/><StudioPermitSummary items={officialProcesses}/><StudioActivityFeed items={activityItems}/></div>
      <StudioCompactWidgets finance={finance} quotes={quoteSummary} crm={crmSummary} renderCount={renderProjects.length} quickAccess={quickAccess}/>
    </section>
  );
}
