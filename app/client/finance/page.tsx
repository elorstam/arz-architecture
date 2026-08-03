import {notFound,redirect} from "next/navigation";
import ClientFinancePage from "@/components/client-portal/ClientFinancePage";
import {getClientFiles} from "@/lib/client-portal/get-client-files";
import {getClientFinance} from "@/lib/client-portal/get-client-finance";
import {getClientPortalContext} from "@/lib/client-portal/get-client-portal-context";
import "./client-finance.css";
export default async function ClientFinanceRoute({searchParams}:{searchParams:Promise<{project?:string|string[]}>}){const query=await searchParams,selected=typeof query.project==="string"?query.project:undefined;const context=await getClientPortalContext(selected).catch(()=>null);if(!context?.user)redirect("/studio/login");if(!context.membership||!context.project)notFound();const[entries,files]=await Promise.all([getClientFinance(context.project.id),getClientFiles(context.project.id).catch(()=>[])]);return <ClientFinancePage project={context.project} entries={entries} downloadableFileIds={files.map(file=>file.id)} today={new Date().toISOString().slice(0,10)}/>;}
