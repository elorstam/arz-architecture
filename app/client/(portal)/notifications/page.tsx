import {notFound,redirect} from "next/navigation";
import ClientNotificationsPage from "@/components/client-portal/ClientNotificationsPage";
import {getClientNotifications} from "@/lib/client-portal/get-client-notifications";
import {getClientPortalContext} from "@/lib/client-portal/get-client-portal-context";
import "./client-notifications.css";

export default async function ClientNotificationsRoute({searchParams}:{searchParams:Promise<{project?:string|string[]}>}){const query=await searchParams,selected=typeof query.project==="string"?query.project:undefined;const context=await getClientPortalContext(selected).catch(()=>null);if(!context?.user)redirect("/client/login?next=%2Fclient%2Fnotifications");if(!context.membership||!context.project)notFound();const notifications=await getClientNotifications(context.project.id);return <ClientNotificationsPage project={context.project} notifications={notifications}/>;}
