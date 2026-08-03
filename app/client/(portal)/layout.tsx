import type {ReactNode} from "react";
import {redirect} from "next/navigation";
import ClientPortalShell from "@/components/client-portal/ClientPortalShell";
import {getClientPortalContext} from "@/lib/client-portal/get-client-portal-context";

export const dynamic="force-dynamic";

export default async function ClientPortalLayout({children}:{children:ReactNode}){
 const context=await getClientPortalContext().catch(()=>null);
 if(!context?.user)redirect("/client/login?next=%2Fclient");
 if(!context.membership||!context.project)redirect("/client/login?error=access");
 return <ClientPortalShell projects={context.projects} userName={context.profile.fullName}>{children}</ClientPortalShell>;
}
