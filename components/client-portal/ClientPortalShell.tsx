import {Suspense,type ReactNode} from "react";
import type {ClientPortalProject} from "@/lib/client-portal/get-client-portal-context";
import ClientPortalHeader from "./ClientPortalHeader";
import ClientPortalNavigation from "./ClientPortalNavigation";

export default function ClientPortalShell({children,projects,userName,unreadCount}:{children:ReactNode;projects:ClientPortalProject[];userName:string;unreadCount:number}){return <div className="studio-root client-portal min-h-screen min-w-0 overflow-x-hidden"><ClientPortalHeader projects={projects} userName={userName} unreadCount={unreadCount}/><div className="client-shell"><Suspense fallback={<div className="h-[62px]" aria-hidden="true"/>}><ClientPortalNavigation/></Suspense><main className="client-main">{children}</main></div></div>}
