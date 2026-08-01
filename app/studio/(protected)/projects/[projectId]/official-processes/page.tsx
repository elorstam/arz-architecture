import { notFound } from "next/navigation";
import StudioCustomFeeForm from "@/components/studio/official-processes/StudioCustomFeeForm";
import StudioOfficialProcessCard from "@/components/studio/official-processes/StudioOfficialProcessCard";
import StudioOfficialProcessSummaryGrid from "@/components/studio/official-processes/StudioOfficialProcessSummaryGrid";
import StudioProjectTabs from "@/components/studio/projects/StudioProjectTabs";
import { initializeOfficialProcesses, listOfficialProcessDocuments, listOfficialProcesses } from "@/lib/studio/official-processes/official-process-repository";
import { isWhatsAppConfigured } from "@/lib/studio/notifications/whatsapp-adapter";
import { getStudioProjectAccess, getStudioProjectById } from "@/lib/studio/projects/project-repository";

export const dynamic = "force-dynamic";

export default async function OfficialProcessesPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const [project,access]=await Promise.all([getStudioProjectById(projectId),getStudioProjectAccess()]);
  if(!project)notFound();
  let payload:Awaited<ReturnType<typeof loadOfficialProcesses>>|null=null;
  try{if(access.canManage)await initializeOfficialProcesses(projectId);payload=await loadOfficialProcesses(projectId);}catch{payload=null;}
  if(!payload)return <main className="mx-auto max-w-[1540px] px-4 py-6 sm:px-6 lg:px-8"><PageHeader code={project.code} name={project.name} projectId={projectId}/><section role="status" className="mt-5 rounded-xl border border-dashed bg-[#faf8f3] p-6"><h2 className="text-xl font-semibold">Modül henüz hazırlanmadı</h2><p className="mt-2 text-[15px] leading-6 text-[#68716f]">Harç ve Evraklar veri yapısı henüz bu ortamda etkin değil. Migration 014 uygulandıktan sonra bu sayfa otomatik olarak kullanılabilir olacak.</p></section></main>;
  const{items,documents,fees,application,cleanApplication}=payload;
  return <main className="mx-auto min-w-0 max-w-[1540px] px-4 py-6 sm:px-6 lg:px-8"><PageHeader code={project.code} name={project.name} projectId={projectId}/><StudioOfficialProcessSummaryGrid items={items}/><ProcessSection title="Belediye Harçları" description="Tahakkuk, ödeme ve alınan evrak takibi." count={`${fees.length} kayıt`}>{access.canManage?<StudioCustomFeeForm projectId={projectId}/>:null}<div className="grid min-w-0 gap-4 xl:grid-cols-2">{fees.map(item=><StudioOfficialProcessCard key={item.id} item={item} documents={documents} canManage={access.canManage} whatsappConfigured={isWhatsAppConfigured()}/>)}</div></ProcessSection><ProcessSection title="Aplikasyon" description="Projenin aplikasyon tahakkuk, ödeme ve nihai evrak süreci." count={application[0]?.status??"Bekleniyor"}><div className="grid min-w-0 gap-4">{application.map(item=><StudioOfficialProcessCard key={item.id} item={item} documents={documents} canManage={access.canManage} whatsappConfigured={isWhatsAppConfigured()}/>)}</div></ProcessSection><ProcessSection title="Temiz Aplikasyon" description="Normal aplikasyon sürecinden bağımsız temiz aplikasyon takibi." count={cleanApplication[0]?.status??"Bekleniyor"}><div className="grid min-w-0 gap-4">{cleanApplication.map(item=><StudioOfficialProcessCard key={item.id} item={item} documents={documents} canManage={access.canManage} whatsappConfigured={isWhatsAppConfigured()}/>)}</div></ProcessSection></main>;
}

async function loadOfficialProcesses(projectId:string){const[items,documents]=await Promise.all([listOfficialProcesses(projectId),listOfficialProcessDocuments(projectId)]);return{items,documents,fees:items.filter(item=>item.entityType==="fee"),application:items.filter(item=>item.entityType==="application"),cleanApplication:items.filter(item=>item.entityType==="clean_application")};}
function PageHeader({code,name,projectId}:{code:string;name:string;projectId:string}){return <><div><p className="text-sm font-semibold text-[#9a7b40]">{code}</p><h1 className="mt-1 break-words text-3xl font-semibold text-[#202b34]">Harç ve Evraklar</h1><p className="mt-2 text-[15px] leading-6 text-[#68716f]">{name} için belediye harçları ve resmî süreçler.</p></div><StudioProjectTabs projectId={projectId} active="official-processes"/></>;}
function ProcessSection({title,description,count,children}:{title:string;description:string;count:string;children:React.ReactNode}){return <section className="mt-8 min-w-0 rounded-2xl border border-[#e2ddd3] bg-[#f7f4ee]/60 p-4 sm:p-5"><header className="mb-4 flex flex-wrap items-end justify-between gap-2"><div><h2 className="text-xl font-semibold">{title}</h2><p className="mt-1 text-sm leading-6 text-[#68716f]">{description}</p></div><span className="rounded-full border bg-white px-3 py-1 text-xs font-semibold">{count}</span></header><div className="space-y-4">{children}</div></section>}
