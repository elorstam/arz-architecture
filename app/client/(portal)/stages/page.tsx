import {notFound,redirect} from "next/navigation";
import ClientStagesPage from "@/components/client-portal/ClientStagesPage";
import {getClientPortalContext} from "@/lib/client-portal/get-client-portal-context";
import {getClientStages} from "@/lib/client-portal/get-client-stages";
import "./client-stages.css";
export default async function ClientStagesRoute({searchParams}:{searchParams:Promise<{project?:string|string[]}>}){const query=await searchParams,selected=typeof query.project==="string"?query.project:undefined;const context=await getClientPortalContext(selected).catch(()=>null);if(!context?.user)redirect("/client/login?next=%2Fclient%2Fstages");if(!context.membership||!context.project)notFound();const stages=await getClientStages(context.project.id);return <ClientStagesPage project={context.project} stages={stages}/>}
