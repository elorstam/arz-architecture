import StudioFinanceNav from "./StudioFinanceNav";
import StudioFinanceDashboardView from "./StudioFinanceDashboard";
import StudioFinanceAiWriter from "./StudioFinanceAiWriter";
import StudioFinanceProfitabilitySummary from "./StudioFinanceProfitabilitySummary";
import {getFinanceDashboard} from "@/lib/studio/finance/finance-repository";

const route:Record<string,string>={overview:"/studio/finance",incomes:"/studio/finance/incomes",expenses:"/studio/finance/expenses",payments:"/studio/finance/payments", "progress-payments":"/studio/finance/progress-payments",profitability:"/studio/finance/profitability", "cash-flow":"/studio/finance/cash-flow",invoices:"/studio/finance/invoices",reports:"/studio/finance/reports"};

export default async function StudioFinancePage({section,projectId}:{section:keyof typeof route;projectId?:string}){
 const data=await getFinanceDashboard(projectId);
 return <main className="mx-auto min-w-0 max-w-[1540px] px-4 py-6 sm:px-6 lg:px-8"><header className="border-b pb-6"><p className="studio-label text-[#9a8253]">Finans ve Muhasebe</p><h1 className="studio-page-title mt-2">{projectId?"Proje Finans":"Finans"}</h1><p className="studio-body-text mt-2 max-w-3xl text-[#68706f]">Gelir, gider, tahsilat, hakediş, fatura ve proje kârlılığını tek çalışma alanında yönetin.</p></header><StudioFinanceNav active={route[section]}/>{section==="overview"&&data.available?<div className="mt-6"><StudioFinanceAiWriter data={data}/></div>:null}{section==="profitability"&&data.available?<StudioFinanceProfitabilitySummary data={data}/>:null}<StudioFinanceDashboardView data={data} section={section}/></main>;
}
