import {notFound,redirect} from "next/navigation";
import ClientPortalDashboard from "@/components/client-portal/ClientPortalDashboard";
import {getClientPortalContext} from "@/lib/client-portal/get-client-portal-context";
import {getClientDashboard} from "@/lib/client-portal/get-client-dashboard";

export default async function ClientPortalPage({searchParams}:{searchParams:Promise<{project?:string|string[]}>}){
 const query=await searchParams,selected=typeof query.project==="string"?query.project:undefined;
 const context=await getClientPortalContext(selected).catch(()=>null);
 if(!context?.user)redirect("/studio/login");
 if(!context.membership||!context.project)notFound();
 const data=await getClientDashboard(context.project.id);
 return <ClientPortalDashboard project={context.project} projects={context.projects} userName={context.profile.fullName} data={data}/>;
}
