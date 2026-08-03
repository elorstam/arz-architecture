import {notFound,redirect} from "next/navigation";
import ClientFilesPage from "@/components/client-portal/ClientFilesPage";
import {getClientFiles} from "@/lib/client-portal/get-client-files";
import {getClientPortalContext} from "@/lib/client-portal/get-client-portal-context";
import "./client-files.css";
export default async function ClientFilesRoute({searchParams}:{searchParams:Promise<{project?:string|string[]}>}){const query=await searchParams,selected=typeof query.project==="string"?query.project:undefined;const context=await getClientPortalContext(selected).catch(()=>null);if(!context?.user)redirect("/client/login?next=%2Fclient%2Ffiles");if(!context.membership||!context.project)notFound();const files=await getClientFiles(context.project.id);return <ClientFilesPage project={context.project} files={files}/>;}
