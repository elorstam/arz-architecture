import StudioFinanceNav from "./StudioFinanceNav";
import StudioFinanceDashboardView from "./StudioFinanceDashboard";
import StudioFinanceAiWriter from "./StudioFinanceAiWriter";
import StudioFinanceProfitabilitySummary from "./StudioFinanceProfitabilitySummary";
import {getFinanceDashboard} from "@/lib/studio/finance/finance-repository";
import StudioProjectTabs from "@/components/studio/projects/StudioProjectTabs";
import {getStudioProjectById} from "@/lib/studio/projects/project-repository";
import {notFound} from "next/navigation";
import Link from "next/link";
import {StudioPageHeader} from "@/components/studio/ui";
import {studioButtonClass} from "@/components/studio/StudioButton";

const route:Record<string,string>={overview:"/studio/finance",incomes:"/studio/finance/incomes",expenses:"/studio/finance/expenses",payments:"/studio/finance/payments", "progress-payments":"/studio/finance/progress-payments",profitability:"/studio/finance/profitability", "cash-flow":"/studio/finance/cash-flow",invoices:"/studio/finance/invoices",reports:"/studio/finance/reports"};

export default async function StudioFinancePage({section,projectId}:{section:keyof typeof route;projectId?:string}){
 const [data,project]=await Promise.all([getFinanceDashboard(projectId),projectId?getStudioProjectById(projectId):Promise.resolve(null)]);if(projectId&&!project)notFound();
 const actions=!project&&data.canManage?<><Link href="/studio/finance/incomes" className={studioButtonClass("primary","sm")}>Gelir Ekle</Link><Link href="/studio/finance/expenses" className={studioButtonClass("outline","sm")}>Gider Ekle</Link><Link href="/studio/finance/payments" className={studioButtonClass("outline","sm")}>Tahsilat Ekle</Link><Link href="/studio/finance/reports" className={studioButtonClass("ghost","sm")}>Rapor Al</Link></>:null;
 return <main className="studio-finance-page mx-auto min-w-0 max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">{project?<><StudioPageHeader eyebrow={project.code} title={`${project.name} · Finans`} description="Projenin anlaşılan bedelini, tahsilatlarını ve giderlerini tek ekranda izleyin."/><StudioProjectTabs projectId={project.id} active="finance"/></>:<StudioPageHeader eyebrow="Ofis Finans Merkezi" title="Finans" description="Gelir, gider, tahsilat ve proje kârlılığını tek ekrandan takip edin." actions={actions}/>}<StudioFinanceNav active={route[section]}/>{section==="profitability"&&data.available?<StudioFinanceProfitabilitySummary data={data}/>:null}<StudioFinanceDashboardView data={data} section={section}/>{section==="overview"&&data.available?<div className="mt-4"><StudioFinanceAiWriter data={data}/></div>:null}</main>;
}
