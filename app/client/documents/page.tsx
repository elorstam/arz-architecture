import {notFound,redirect} from "next/navigation";
import ClientDocumentsPage from "@/components/client-portal/ClientDocumentsPage";
import {getClientDocuments} from "@/lib/client-portal/get-client-documents";
import {getClientPortalContext} from "@/lib/client-portal/get-client-portal-context";
import "../files/client-files.css";
import "./client-documents.css";
export default async function ClientDocumentsRoute({searchParams}:{searchParams:Promise<{project?:string|string[]}>}){const query=await searchParams,selected=typeof query.project==="string"?query.project:undefined;const context=await getClientPortalContext(selected).catch(()=>null);if(!context?.user)redirect("/studio/login");if(!context.membership||!context.project)notFound();const documents=await getClientDocuments(context.project.id);return <ClientDocumentsPage project={context.project} documents={documents}/>;}
