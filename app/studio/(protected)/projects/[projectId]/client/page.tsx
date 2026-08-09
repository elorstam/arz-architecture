import {notFound} from "next/navigation";
import StudioClientAccessManager from "@/components/studio/projects/StudioClientAccessManager";
import StudioClientInvitationLink from "@/components/studio/projects/StudioClientInvitationLink";
import StudioClientPaymentProfiles from "@/components/studio/projects/StudioClientPaymentProfiles";
import StudioProjectTabs from "@/components/studio/projects/StudioProjectTabs";
import {getStudioClientAccessManagement} from "@/lib/studio/client-access/client-access-repository";
import {getStudioClientPaymentProfiles} from "@/lib/studio/client-access/client-payment-profile";
import {mergeActiveClientPaymentProfiles} from "@/lib/studio/client-access/client-payment-profile-view";
import {getStudioProjectById} from "@/lib/studio/projects/project-repository";

export const dynamic="force-dynamic";
export default async function StudioProjectClientPage({params}:{params:Promise<{projectId:string}>}){
 const{projectId}=await params;const project=await getStudioProjectById(projectId);if(!project||!project.canManage)notFound();
 const[management,loadedPaymentProfiles]=await Promise.all([getStudioClientAccessManagement(projectId),getStudioClientPaymentProfiles(projectId)]);
 const paymentProfiles=mergeActiveClientPaymentProfiles(management.accesses,loadedPaymentProfiles);
 return <section className="mx-auto min-w-0 max-w-[1540px] px-4 py-5 sm:px-6 lg:px-8"><h1 className="text-2xl font-semibold text-[#17232e]">Müşteri Erişimi</h1><p className="mt-2 text-sm text-[#64748b]">Portal davetlerini ve projeye erişebilen müşterileri güvenli biçimde yönetin.</p><StudioProjectTabs projectId={projectId} active="client"/><div className="mt-4 grid max-w-4xl gap-4"><StudioClientInvitationLink projectId={projectId} defaultEmail={project.client.email}/><StudioClientPaymentProfiles projectId={projectId} profiles={paymentProfiles}/><StudioClientAccessManager projectId={projectId} {...management}/></div></section>;
}
