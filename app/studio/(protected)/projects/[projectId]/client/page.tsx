import {notFound} from "next/navigation";
import StudioClientInvitationLink from "@/components/studio/projects/StudioClientInvitationLink";
import StudioProjectTabs from "@/components/studio/projects/StudioProjectTabs";
import {getStudioProjectById} from "@/lib/studio/projects/project-repository";
export const dynamic="force-dynamic";
export default async function StudioProjectClientPage({params}:{params:Promise<{projectId:string}>}){const{projectId}=await params;const project=await getStudioProjectById(projectId);if(!project||!project.canManage)notFound();return <section className="mx-auto min-w-0 max-w-[1540px] px-4 py-5 sm:px-6 lg:px-8"><h1 className="text-2xl font-semibold text-[#17232e]">Müşteri Erişimi</h1><p className="mt-2 text-sm text-[#64748b]">Proje müşterisi için güvenli portal daveti oluşturun.</p><StudioProjectTabs projectId={projectId} active="client"/><div className="mt-4 max-w-3xl"><StudioClientInvitationLink projectId={projectId} defaultEmail={project.client.email}/></div></section>;}
