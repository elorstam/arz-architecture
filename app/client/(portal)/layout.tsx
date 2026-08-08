import type {ReactNode} from "react";
import {redirect} from "next/navigation";
import ClientPortalShell from "@/components/client-portal/ClientPortalShell";
import {getClientUnreadNotificationCount} from "@/lib/client-portal/get-client-notifications";
import {getClientPortalContext} from "@/lib/client-portal/get-client-portal-context";
import {serverAppPath} from "@/lib/routing/server-app-path";

export const dynamic="force-dynamic";

export default async function ClientPortalLayout({children}:{children:ReactNode}){
 const clientLogin=await serverAppPath("client","/client/login");
 const context=await getClientPortalContext().catch(()=>null);
 if(!context?.user)redirect(`${clientLogin}?next=${encodeURIComponent(await serverAppPath("client","/client"))}`);
 if(!context.membership||!context.project)redirect(`${clientLogin}?error=access`);
 const unreadCount=await getClientUnreadNotificationCount();
 return <ClientPortalShell projects={context.projects} userName={context.profile.fullName} unreadCount={unreadCount}>{children}</ClientPortalShell>;
}
