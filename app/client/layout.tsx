import type {ReactNode} from "react";
import {notFound,redirect} from "next/navigation";
import {getClientPortalContext} from "@/lib/client-portal/get-client-portal-context";

export const dynamic="force-dynamic";

export default async function ClientPortalLayout({children}:{children:ReactNode}){
 const context=await getClientPortalContext().catch(()=>null);
 if(!context?.user)redirect("/studio/login");
 if(!context.membership||!context.project)notFound();
 return children;
}
