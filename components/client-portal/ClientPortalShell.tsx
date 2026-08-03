import type {ReactNode} from "react";
import type {ClientPortalProject} from "@/lib/client-portal/get-client-portal-context";
import ClientPortalHeader from "./ClientPortalHeader";
import ClientPortalNavigation from "./ClientPortalNavigation";

export default function ClientPortalShell({children,projects,userName}:{children:ReactNode;projects:ClientPortalProject[];userName:string}){return <div className="studio-root client-portal min-h-screen min-w-0 overflow-x-hidden"><ClientPortalHeader projects={projects} userName={userName}/><div className="client-shell"><ClientPortalNavigation/><main className="client-main">{children}</main></div></div>}
