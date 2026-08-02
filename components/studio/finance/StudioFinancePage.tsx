import StudioFinanceNav from "./StudioFinanceNav";
import StudioFinanceDashboardView from "./StudioFinanceDashboard";
import StudioFinanceAiWriter from "./StudioFinanceAiWriter";
import StudioFinanceProfitabilitySummary from "./StudioFinanceProfitabilitySummary";
import {getFinanceDashboard} from "@/lib/studio/finance/finance-repository";
import StudioProjectTabs from "@/components/studio/projects/StudioProjectTabs";
import {getStudioProjectById} from "@/lib/studio/projects/project-repository";
import {notFound} from "next/navigation";

const route:Record<string,string>={overview:"/studio/finance",incomes:"/studio/finance/incomes",expenses:"/studio/finance/expenses",payments:"/studio/finance/payments", "progress-payments":"/studio/finance/progress-payments",profitability:"/studio/finance/profitability", "cash-flow":"/studio/finance/cash-flow",invoices:"/studio/finance/invoices",reports:"/studio/finance/reports"};

export default async function StudioFinancePage({section,projectId}:{section:keyof typeof route;projectId?:string}){
 const [data,project]=await Promise.all([getFinanceDashboard(projectId),projectId?getStudioProjectById(projectId):Promise.resolve(null)]);if(projectId&&!project)notFound();
 return <main className="mx-auto min-w-0 max-w-[1540px] px-4 py-6 sm:px-6 lg:px-8">{project?<><p className="text-sm font-semibold text-[#9a7b40]">{project.code}</p><h1 className="mt-1 break-words text-3xl font-semibold">{project.name} · Finans</h1><p className="mt-2 text-[15px] leading-6 text-[#68716f]">Projenin anlaşılan bedelini, tahsilatlarını ve giderlerini tek ekranda izleyin.</p><StudioProjectTabs projectId={project.id} active="finance"/></>:<header className="border-b pb-6"><p className="studio-label text-[#9a8253]">Finans ve Muhasebe</p><h1 className="studio-page-title mt-2">Finans</h1><p className="studio-body-text mt-2 max-w-3xl text-[#68706f]">Gelir, gider, tahsilat, hakediş, fatura ve proje kârlılığını tek çalışma alanında yönetin.</p></header>}<StudioFinanceNav active={route[section]}/>{section==="overview"&&data.available?<div className="mt-6"><StudioFinanceAiWriter data={data}/></div>:null}{section==="profitability"&&data.available?<StudioFinanceProfitabilitySummary data={data}/>:null}<StudioFinanceDashboardView data={data} section={section}/></main>;
}
