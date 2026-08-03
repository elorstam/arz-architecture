import {notFound,redirect} from "next/navigation";
import ClientRendersPage from "@/components/client-portal/ClientRendersPage";
import {getClientPortalContext} from "@/lib/client-portal/get-client-portal-context";
import {getClientRenders} from "@/lib/client-portal/get-client-renders";
import "./client-renders.css";
export default async function ClientRendersRoute({searchParams}:{searchParams:Promise<{project?:string|string[]}>}){const query=await searchParams,selected=typeof query.project==="string"?query.project:undefined;const context=await getClientPortalContext(selected).catch(()=>null);if(!context?.user)redirect("/client/login?next=%2Fclient%2Frenders");if(!context.membership||!context.project)notFound();const renders=await getClientRenders(context.project.id);return <ClientRendersPage project={context.project} renders={renders}/>;}
