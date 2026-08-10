import StudioProjectFinanceWorkspace from "@/components/studio/finance/StudioProjectFinanceWorkspace";
import StudioVisualizationFinanceProfile from "@/components/studio/finance/StudioVisualizationFinanceProfile";
import StudioVisualizationExpenseForm from "@/components/studio/finance/StudioVisualizationExpenseForm";
import StudioProjectTabs from "@/components/studio/projects/StudioProjectTabs";
import {getProjectFinanceWorkspace} from "@/lib/studio/finance/project-finance-repository";
import {getStudioPaymentRequests}from"@/lib/studio/finance/payment-request-repository";
import StudioPaymentRequests from"@/components/studio/finance/StudioPaymentRequests";
import {StudioCard,StudioPageHeader,StudioSectionHeader} from "@/components/studio/ui";
import{listStudioPublicPaymentLinks}from"@/lib/payments/public-links";

export default async function Page({params}:{params:Promise<{projectId:string}>}){
 const {projectId}=await params;
 const[data,paymentRequests,publicLinks]=await Promise.all([getProjectFinanceWorkspace(projectId),getStudioPaymentRequests(projectId),listStudioPublicPaymentLinks(projectId)]);
 return <main className="studio-finance-page mx-auto min-w-0 max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
  <StudioPageHeader eyebrow={data.project.code} title={`${data.project.name} · Finans`} description="Projenin sözleşme bedelini, gider geçmişini ve kârlılığını yönetin."/>
  <StudioProjectTabs projectId={projectId} active="finance"/>
  <StudioPaymentRequests projectId={projectId} canManage={data.canManage} requests={paymentRequests} publicLinks={publicLinks}/>
  {data.isVisualization?<><StudioVisualizationFinanceProfile data={data}/>{data.canManage?<StudioCard className="mt-4 p-0"><details><summary className="cursor-pointer list-none p-4"><StudioSectionHeader title="Görselleştirme Gideri Ekle" description="Mevcut proje finans gider akışı" icon="image" action={<span className="text-lg text-[#8b969d]">＋</span>}/></summary><div className="border-t border-[#edf0f2] p-4"><StudioVisualizationExpenseForm projectId={projectId} projectName={data.project.name}/></div></details></StudioCard>:null}</>:<StudioProjectFinanceWorkspace data={data}/>}</main>;
}
