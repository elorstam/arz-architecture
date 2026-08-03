import type {ReactNode} from "react";
import localFont from "next/font/local";
import {notFound,redirect} from "next/navigation";
import {getClientPortalContext} from "@/lib/client-portal/get-client-portal-context";
import ClientPortalShell from "@/components/client-portal/ClientPortalShell";
import "./client-portal.css";

export const dynamic="force-dynamic";

const clientFont=localFont({src:[{path:"../../public/fonts/CenturyGothic.woff2",weight:"400",style:"normal"},{path:"../../public/fonts/CenturyGothic.woff",weight:"600",style:"normal"}],display:"swap",fallback:["Arial","Helvetica","sans-serif"],variable:"--font-studio"});

export default async function ClientPortalLayout({children}:{children:ReactNode}){
 const context=await getClientPortalContext().catch(()=>null);
 if(!context?.user)redirect("/studio/login");
 if(!context.membership||!context.project)notFound();
 return <div className={`${clientFont.variable} ${clientFont.className}`}><ClientPortalShell projects={context.projects} userName={context.profile.fullName}>{children}</ClientPortalShell></div>;
}
