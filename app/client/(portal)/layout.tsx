import type {ReactNode} from "react";
import {redirect} from "next/navigation";
import {headers} from "next/headers";
import ClientPortalShell from "@/components/client-portal/ClientPortalShell";
import {safeClientNext} from "@/lib/client-portal/auth";
import {getClientUnreadNotificationCount} from "@/lib/client-portal/get-client-notifications";
import {getClientPortalContext} from "@/lib/client-portal/get-client-portal-context";
import {CLIENT_REQUEST_PATH_HEADER} from "@/lib/routing/app-domains";
import {serverAppPath} from "@/lib/routing/server-app-path";

export const dynamic="force-dynamic";

export default async function ClientPortalLayout({children}:{children:ReactNode}){
 const clientLogin=await serverAppPath("client","/client/login");
 const context=await getClientPortalContext().catch(()=>null);
 if(!context?.user){
  const requestedPath=safeClientNext((await headers()).get(CLIENT_REQUEST_PATH_HEADER)??undefined);
  const loginDestination=await serverAppPath("client",requestedPath);
  redirect(`${clientLogin}?next=${encodeURIComponent(loginDestination)}`);
 }
 if(!context.membership||!context.project)redirect(`${clientLogin}?error=access`);
 const unreadCount=await getClientUnreadNotificationCount();
 return <ClientPortalShell projects={context.projects} userName={context.profile.fullName} unreadCount={unreadCount}>{children}</ClientPortalShell>;
}
