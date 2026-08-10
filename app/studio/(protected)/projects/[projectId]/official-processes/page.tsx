import {notFound} from "next/navigation";
import StudioCustomFeeForm from "@/components/studio/official-processes/StudioCustomFeeForm";
import StudioOfficialProcessMilestoneCard from "@/components/studio/official-processes/StudioOfficialProcessMilestoneCard";
import StudioOfficialProcessesWorkspace from "@/components/studio/official-processes/StudioOfficialProcessesWorkspace";
import StudioProjectTabs from "@/components/studio/projects/StudioProjectTabs";
import {studioButtonClass} from "@/components/studio/StudioButton";
import StudioTabs from "@/components/studio/StudioTabs";
import {StudioEmptyState,StudioPageHeader} from "@/components/studio/ui";
import {initializeOfficialProcesses,listOfficialProcessDocuments,listOfficialProcesses} from "@/lib/studio/official-processes/official-process-repository";
import {isWhatsAppConfigured} from "@/lib/studio/notifications/whatsapp-adapter";
import {getStudioProjectAccess,getStudioProjectById} from "@/lib/studio/projects/project-repository";

export const dynamic="force-dynamic";

export default async function OfficialProcessesPage({params,searchParams}:{params:Promise<{projectId:string}>;searchParams:Promise<Record<string,string|undefined>>}){
 const{projectId}=await params;const query=await searchParams;const archiveView=query.view==="archive";const[project,access]=await Promise.all([getStudioProjectById(projectId),getStudioProjectAccess()]);if(!project)notFound();let payload:Awaited<ReturnType<typeof loadOfficialProcesses>>|null=null;try{if(access.canManage&&!archiveView)await initializeOfficialProcesses(projectId);payload=await loadOfficialProcesses(projectId,archiveView);}catch{payload=null;}
 const tabs=[{href:`/studio/projects/${projectId}/official-processes`,label:"Aktif",icon:"activity" as const},{href:`/studio/projects/${projectId}/official-processes?view=archive`,label:"Arşivlenmiş",icon:"archive" as const}];
 return <main className="mx-auto min-w-0 max-w-[1540px] px-4 py-5 sm:px-6 lg:px-8">
  <StudioPageHeader eyebrow={project.code} title="Harç ve Evraklar" description={`${project.name} için belediye harçlarını, resmî evrakları ve yaklaşan işlemleri yönetin.`} icon="receipt" actions={access.canManage&&!archiveView?<details className="relative max-sm:w-full"><summary className={`${studioButtonClass("primary", "md")} cursor-pointer list-none max-sm:w-full`}>Özel Harç Ekle</summary><div className="absolute right-0 top-12 z-30 w-[min(92vw,440px)] rounded-2xl border border-[var(--studio-border)] bg-white p-3 shadow-xl"><StudioCustomFeeForm projectId={projectId}/></div></details>:null}/>
  <StudioProjectTabs projectId={projectId} active="official-processes"/>
  <div className="mt-4"><StudioTabs items={tabs} active={archiveView?tabs[1].href!:tabs[0].href!} ariaLabel="Harç görünümü"/></div>
  {!payload
   ?<div className="mt-5"><StudioEmptyState icon="receipt" title="Modül henüz hazırlanmadı" description="Harç ve Evraklar veri yapısı henüz bu ortamda etkin değil."/></div>
   :archiveView
    ?<Archive items={payload.items} documents={payload.documents} canManage={access.canManage} projectName={project.name} customerName={project.client.name} customerPhone={project.client.phone}/>
    :<StudioOfficialProcessesWorkspace items={payload.items} documents={payload.documents} canManage={access.canManage} whatsappConfigured={isWhatsAppConfigured()} projectName={project.name} customerName={project.client.name} customerPhone={project.client.phone}/>}
 </main>;
}

async function loadOfficialProcesses(projectId:string,includeArchived=false){const[items,documents]=await Promise.all([listOfficialProcesses(projectId,{includeArchived}),listOfficialProcessDocuments(projectId)]);return{items,documents};}

function Archive({items,documents,canManage,projectName,customerName,customerPhone}:{items:Awaited<ReturnType<typeof listOfficialProcesses>>;documents:Array<{id:string;name:string}>;canManage:boolean;projectName:string;customerName:string;customerPhone:string}){
 const archived=items.filter(item=>item.isArchived);const cardProps={documents,canManage,whatsappConfigured:isWhatsAppConfigured(),projectName,customerName,customerPhone};return <section className="mt-5">{archived.length?<div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">{archived.map(item=><StudioOfficialProcessMilestoneCard key={item.id} item={item} {...cardProps}/>)}</div>:<StudioEmptyState icon="archive" title="Arşivlenmiş süreç bulunmuyor" description="Arşivlenen harç ve evrak kayıtları burada korunur."/>}</section>;
}
