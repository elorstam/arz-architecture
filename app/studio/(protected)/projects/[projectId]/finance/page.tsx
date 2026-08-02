import StudioProjectFinanceWorkspace from "@/components/studio/finance/StudioProjectFinanceWorkspace";
import StudioVisualizationFinanceProfile from "@/components/studio/finance/StudioVisualizationFinanceProfile";
import StudioVisualizationExpenseForm from "@/components/studio/finance/StudioVisualizationExpenseForm";
import StudioProjectTabs from "@/components/studio/projects/StudioProjectTabs";
import {getProjectFinanceWorkspace} from "@/lib/studio/finance/project-finance-repository";

export default async function Page({params}:{params:Promise<{projectId:string}>}){
 const {projectId}=await params;
 const data=await getProjectFinanceWorkspace(projectId);
 return <main className="mx-auto min-w-0 max-w-[1540px] px-4 py-6 sm:px-6 lg:px-8">
  <p className="text-sm font-semibold text-[#9a7b40]">{data.project.code}</p>
  <h1 className="mt-1 break-words text-3xl font-semibold">{data.project.name} · Finans</h1>
  <p className="mt-2 text-[15px] leading-6 text-[#68716f]">Projenin sözleşme bedelini, gider geçmişini ve kârlılığını yönetin.</p>
  <StudioProjectTabs projectId={projectId} active="finance"/>
  {data.isVisualization?<><StudioVisualizationFinanceProfile data={data}/>{data.canManage?<div className="mt-6"><StudioVisualizationExpenseForm projectId={projectId} projectName={data.project.name}/></div>:null}</>:<StudioProjectFinanceWorkspace data={data}/>}</main>;
}
